// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./DelayedERC1967Proxy.sol";
import "./TunnelBoringMachine.sol";
import "./Tunnel/TunnelContract.sol";
import "./utils/MultiControlERC20.sol";
import "./utils/SigVerifier.sol";

contract FreeTunnelHub is SigVerifier, OwnableUpgradeable, UUPSUpgradeable {
    uint8 public HUB_ID;

    address public currentTBM;
    event TunnelBoringMachineUpdated(uint64 indexed version, address tbmAddress);

    mapping(bytes32 => address) public addressOfTunnel;
    event TunnelOpenned(address indexed tunnelAddress, uint64 indexed version, address implAddress, string tunnelName);
    event TunnelUpgraded(address indexed tunnelAddress, uint64 indexed version, address implAddress, string tunnelName);

    constructor() initializer {}

    function initialize(uint8 hubId) public initializer {
        __Ownable_init(msg.sender);
        HUB_ID = hubId;
    }

    function upgrade(bytes memory bytecode) public onlyOwner {
        address implAddress;
        assembly {
            implAddress := create2(0, add(bytecode, 0x20), mload(bytecode), "")
        }
        require(implAddress != address(0), "New implementation of FreeTunnelHub failed to deploy");
        UUPSUpgradeable.upgradeToAndCall(implAddress, "");
    }

    function _authorizeUpgrade(address newImplementation) internal pure override {}

    function upgradeToAndCall(address, bytes memory) public payable override {
        revert("Method upgradeToAndCall disabled. Use upgrade.");
    }

    function currentTBMVersion() public view returns (uint64) {
        return TunnelBoringMachine(currentTBM).VERSION();
    }

    function updateTunnelBoringMachine(uint64 version, bytes memory bytecode) public onlyOwner {
        if (currentTBM != address(0)) {
            require(version > currentTBMVersion(), "New version must be greater than the current version.");
        }

        bytes memory deployBytecode = abi.encodePacked(bytecode, abi.encode(version));

        address tbmAddress;
        assembly {
            tbmAddress := create2(0, add(deployBytecode, 0x20), mload(deployBytecode), "")
        }
        require(tbmAddress != address(0), "TunnelBoringMachine failed to deploy");
        require(TunnelBoringMachine(tbmAddress).VERSION() == version, "TunnelBoringMachine.VERSION does not equal to version");

        currentTBM = tbmAddress;
        emit TunnelBoringMachineUpdated(version, tbmAddress);
    }

    function getTunnelHash(string memory tunnelName, bool isLockMode) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tunnelName, isLockMode ? " (Lock Mode)" : " (Mint Mode)"));
    }

    function getTunnelAddress(string memory tunnelName, bool isLockMode) public view returns (address) {
        return addressOfTunnel[getTunnelHash(tunnelName, isLockMode)];
    }

    function _getTunnelContract(string memory tunnelName, bool isLockMode) private view returns (TunnelContract) {
        address tunnelAddress = getTunnelAddress(tunnelName, isLockMode);
        require(tunnelAddress != address(0), "Tunnel not openned");
        return TunnelContract(payable(tunnelAddress));
    }

    function openNewTunnel(
        string memory tunnelName,
        bool isLockMode,
        bytes32 r,
        bytes32 yParityAndS,
        uint256 until,
        address[] calldata executors,
        uint256 threshold,
        uint256 exeIndex,
        address proposer
    ) external {
        require(currentTBM != address(0), "No TunnelBoringMachine");
        require(getTunnelAddress(tunnelName, isLockMode) == address(0), "Tunnel already openned");
        require(getTunnelAddress(tunnelName, !isLockMode) == address(0), "Tunnel of the other mode already openned");
        require(until > block.timestamp, "Signature expired");

        address admin = msg.sender;
        bytes32 digest = __digestFromMessage(abi.encodePacked(
            "FreeTunnelHub at ", Strings.toHexString(address(this)), " allows ", Strings.toHexString(admin),
            " to open the tunnel:\n", tunnelName,
            "\nUntil: ", Strings.toString(until)
        ));
        __checkSignature(digest, r, yParityAndS, owner());

        address implAddress = TunnelBoringMachine(currentTBM).openNewTunnel(address(this), tunnelName, isLockMode);

        bytes memory proxyBytecode = getProxyBytecode();
        bytes32 tunnelHash = getTunnelHash(tunnelName, isLockMode);
        address proxyAddress;
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 0x20), mload(proxyBytecode), tunnelHash)
        }
        require(proxyAddress != address(0), "Proxy contract failed to deploy");

        bytes memory data = abi.encodeCall(TunnelContract.initConfigs, (admin, executors, threshold, exeIndex, proposer));
        DelayedERC1967Proxy(payable(proxyAddress)).initImplementation(implAddress, data);

        addressOfTunnel[tunnelHash] = proxyAddress;

        emit TunnelOpenned(proxyAddress, currentTBMVersion(), implAddress, tunnelName);
    }

    function upgradeTunnel(string memory tunnelName, bool isLockMode, uint64 version) external returns (address implAddress) {
        require(version == currentTBMVersion(), "The given version is not the current TunnelBoringMachine version.");
        TunnelContract tunnel = _getTunnelContract(tunnelName, isLockMode);
        require(msg.sender == address(tunnel), "Only for Tunnel");
        implAddress = TunnelBoringMachine(currentTBM).openNewTunnel(address(this), tunnelName, isLockMode);
        emit TunnelUpgraded(address(tunnel), currentTBMVersion(), implAddress, tunnelName);
    }

    function getProxyBytecode() public pure returns (bytes memory) {
        return type(DelayedERC1967Proxy).creationCode;
    }

    function getMultiControlERC20Bytecode() external pure returns (bytes memory) {
        return type(MultiControlERC20).creationCode;
    }


    // Lock methods
    function proposeLock(string memory tunnelName, bytes32 reqId) external payable {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        uint256 value = tunnel.__getLockTxValue(reqId);
        tunnel.proposeLockFromHub{ value: value }(reqId, msg.sender);
    }

    function executeLock(
        string memory tunnelName,
        bytes32 reqId,
        bytes32[] memory r,
        bytes32[] memory yParityAndS,
        address[] memory executors,
        uint256 exeIndex
    ) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.executeLock(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelLock(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.cancelLock(reqId);
    }

    // Mint methods
    function proposeMint(string memory tunnelName, bytes32 reqId, address recipient) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        require(tunnel.proposerIndex(msg.sender) > 0, "Require a proposer");
        tunnel.proposeMint(reqId, recipient);
    }

    function proposeMintFromBurn(string memory tunnelName, bytes32 reqId, address recipient) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        require(tunnel.proposerIndex(msg.sender) > 0, "Require a proposer");
        tunnel.proposeMint(reqId, recipient);
    }

    function executeMint(
        string memory tunnelName,
        bytes32 reqId,
        bytes32[] memory r,
        bytes32[] memory yParityAndS,
        address[] memory executors,
        uint256 exeIndex
    ) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.executeMint(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelMint(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.cancelMint(reqId);
    }

    // Burn methods
    function proposeBurn(string memory tunnelName, bytes32 reqId) external payable {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.proposeBurnFromHub(reqId, msg.sender);
    }

    function proposeBurnForMint(string memory tunnelName, bytes32 reqId) external payable {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.proposeBurnFromHub(reqId, msg.sender);
    }

    function executeBurn(
        string memory tunnelName,
        bytes32 reqId,
        bytes32[] memory r,
        bytes32[] memory yParityAndS,
        address[] memory executors,
        uint256 exeIndex
    ) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.executeBurn(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelBurn(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.cancelBurn(reqId);
    }

    // Unlock methods
    function proposeUnlock(string memory tunnelName, bytes32 reqId, address recipient) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        require(tunnel.proposerIndex(msg.sender) > 0, "Require a proposer");
        tunnel.proposeUnlock(reqId, recipient);
    }

    function executeUnlock(
        string memory tunnelName,
        bytes32 reqId,
        bytes32[] memory r,
        bytes32[] memory yParityAndS,
        address[] memory executors,
        uint256 exeIndex
    ) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.executeUnlock(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelUnlock(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.cancelUnlock(reqId);
    }

    receive() external payable {}
}
