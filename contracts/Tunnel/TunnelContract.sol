// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./LockContract.sol";
import "./MintContract.sol";
import "../DelayedERC1967Proxy.sol";
import "../utils/MultiControlERC20.sol";

contract TunnelContract is LockContract, MintContract, UUPSUpgradeable {
    bool public detached;

    error EUpgradeNotDetached();
    error EDeployMultiControlERC20();
    error EDeployProxy();

    constructor(uint64 version, address hubAddress, string memory tunnelName, bool isLockMode) Constants(version, hubAddress, tunnelName, isLockMode) initializer {}

    function initConfigs(
        address admin,
        address[] calldata executors,
        uint256 threshold,
        uint256 exeIndex,
        address proposer
    ) external initializer {
        _initAdmin(admin);
        _initExecutors(executors, threshold, exeIndex);
        if (proposer != address(0)) {
            _addProposer(proposer);
        }
    }

    function upgradeTunnel(uint64 version) public onlyProxy onlyAdmin {
        address newImplementation = ITunnelHub(HUB_ADDRESS).upgradeTunnel(getTunnelName(), IS_LOCK_MODE, version);
        UUPSUpgradeable.upgradeToAndCall(newImplementation, "");
    }

    function _authorizeUpgrade(address newImplementation) internal pure override {}

    function upgradeToAndCall(address newImplementation, bytes memory data) public payable override {
        require(detached, EUpgradeNotDetached());
        UUPSUpgradeable.upgradeToAndCall(newImplementation, data);
    }

    function detachTunnel() external onlyHub {
        detached = true;
    }

    function addToken(uint8 tokenIndex, address tokenAddr) external onlyAdmin {
        _addToken(tokenIndex, tokenAddr);
    }

    function createToken(uint8 tokenIndex, string memory name, string memory symbol, uint8 decimals) external onlyAdmin {
        bytes memory bytecode = ITunnelHub(HUB_ADDRESS).getMultiControlERC20Bytecode();
        bytes32 salt = keccak256(abi.encode(name, symbol, decimals));
        address implAddress;
        assembly {
            implAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(implAddress != address(0), EDeployMultiControlERC20());

        bytes memory proxyBytecode = ITunnelHub(HUB_ADDRESS).getProxyBytecode();
        address proxyAddress;
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 0x20), mload(proxyBytecode), salt)
        }
        require(proxyAddress != address(0), EDeployProxy());

        bytes memory data = abi.encodeCall(MultiControlERC20.initConfigs, (name, symbol, decimals, _getVaultWithAdminFallback()));
        DelayedERC1967Proxy(payable(proxyAddress)).initImplementation(implAddress, data);

        _addToken(tokenIndex, proxyAddress);
    }

    function removeToken(uint8 tokenIndex) external onlyAdmin {
        _removeToken(tokenIndex);
    }
}
