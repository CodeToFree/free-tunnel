// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./TunnelBoringMachine.sol";
import "./Tunnel/TunnelContract.sol";

contract FreeTunnelHub is OwnableUpgradeable, UUPSUpgradeable {
    uint8 public immutable HUB_ID;

    constructor(uint8 hubId) {
        HUB_ID = hubId;
    }

    address public currentTBM;
    event TunnelBoringMachineUpdated(uint64 indexed version, address tbmAddress);

    mapping(bytes32 => address) public addressOfTunnel;
    event TunnelOpenned(bytes32 indexed tunnelHash, string tunnelName, address indexed tunnelAddress, uint64 indexed version);
    event TunnelUpgraded(bytes32 indexed tunnelHash, string tunnelName, address indexed tunnelAddress, uint64 indexed version);

    function initialize(address tbmAddress) public initializer {
        __Ownable_init(msg.sender);
        uint64 version = TunnelBoringMachine(tbmAddress).VERSION();
        currentTBM = tbmAddress;
        emit TunnelBoringMachineUpdated(version, tbmAddress);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function currentTBMVersion() public view returns (uint64) {
        return TunnelBoringMachine(currentTBM).VERSION();
    }

    function updateTunnelBoringMachine(address tbmAddress) public onlyOwner() {
        uint64 version = TunnelBoringMachine(tbmAddress).VERSION();
        require(version > currentTBMVersion(), "New version must be greater than the current version.");
        currentTBM = tbmAddress;
        emit TunnelBoringMachineUpdated(version, tbmAddress);
    }

    function getTunnelAddress(string memory tunnelName, bool lockOrMint) public view returns (address) {
        return addressOfTunnel[getTunnelHash(tunnelName, lockOrMint)];
    }

    function getTunnelHash(string memory tunnelName, bool lockOrMint) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tunnelName, lockOrMint ? " (LockContract)" : " (MintContract)"));
    }

    function openNewTunnel(string memory tunnelName, bool lockOrMint, address proposer, address[] calldata executors, uint256 threshold) external {
        bytes32 tunnelHash = getTunnelHash(tunnelName, lockOrMint);
        address implAddress = TunnelBoringMachine(currentTBM).openNewTunnel(HUB_ID, tunnelName, tunnelHash);

        bytes memory proxyBytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implAddress, abi.encodeCall(TunnelContract.initialize, (address(this), address(0), proposer, executors, threshold)))
        );

        address proxyAddress;
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 0x20), mload(proxyBytecode), tunnelHash)
        }
        require(proxyAddress != address(0), "Proxy contract failed to deploy");

        addressOfTunnel[tunnelHash] = proxyAddress;

        emit TunnelOpenned(tunnelHash, tunnelName, proxyAddress, currentTBMVersion());
    }

    function upgradeTunnel(string memory tunnelName, bool lockOrMint) external {
        bytes32 tunnelHash = getTunnelHash(tunnelName, lockOrMint);
        address tunnelAddress = addressOfTunnel[tunnelHash];
        require(tunnelAddress != address(0), "TunnelContract not deployed yet");
        address implAddress = TunnelBoringMachine(currentTBM).openNewTunnel(HUB_ID, tunnelName, tunnelHash);
        TunnelContract(payable(tunnelAddress)).upgradeToAndCall(implAddress, "");

        emit TunnelUpgraded(tunnelHash, tunnelName, tunnelAddress, currentTBMVersion());
    }

    function _getTunnelContract(string memory tunnelName, bool lockOrMint) private view returns (TunnelContract) {
        return TunnelContract(payable(getTunnelAddress(tunnelName, lockOrMint)));
    }

    receive() external payable {}


    // Lock methods
    function proposeLock(string memory tunnelName, bytes32 reqId, address proposer) payable external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        uint256 value = tunnel.__getLockTxValue(reqId);
        tunnel.proposeLock{ value: value }(reqId, proposer);
    }

    function executeLock(string memory tunnelName, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
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
        tunnel.proposeMint(reqId, recipient);
    }

    function proposeMintFromBurn(string memory tunnelName, bytes32 reqId, address recipient) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.proposeMintFromBurn(reqId, recipient);
    }

    function executeMint(string memory tunnelName, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.executeMint(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelMint(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.cancelMint(reqId);
    }

    // Unlock methods
    function proposeUnlock(string memory tunnelName, bytes32 reqId, address recipient) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.proposeUnlock(reqId, recipient);
    }

    function executeUnlock(string memory tunnelName, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.executeUnlock(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelUnlock(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, true);
        tunnel.cancelUnlock(reqId);
    }

    // Burn methods
    function proposeBurn(string memory tunnelName, bytes32 reqId, address proposer) payable external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.proposeBurn(reqId, proposer);
    }

    function proposeBurnForMint(string memory tunnelName, bytes32 reqId, address proposer) payable external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.proposeBurnForMint(reqId, proposer);
    }

    function executeBurn(string memory tunnelName, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.executeBurn(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelBurn(string memory tunnelName, bytes32 reqId) external {
        TunnelContract tunnel = _getTunnelContract(tunnelName, false);
        tunnel.cancelBurn(reqId);
    }
}
