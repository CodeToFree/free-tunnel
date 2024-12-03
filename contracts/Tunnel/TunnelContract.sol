// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./LockContract.sol";
import "./MintContract.sol";

contract TunnelContract is LockContract, MintContract, UUPSUpgradeable {
    constructor(uint64 version, uint8 hubId, string memory tunnelName) Constants(version, hubId, tunnelName) {}

    function initialize(address _admin, address _vault, address proposer, address[] calldata executors, uint256 threshold) public initializer {
        _initAdmin(_admin);
        if (_vault != address(0)) {
            _initVault(_vault);
        }
        _addProposer(proposer);
        _initExecutors(executors, threshold);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    function addToken(uint8 tokenIndex, address tokenAddr) external onlyAdmin {
        _addToken(tokenIndex, tokenAddr);
    }

    // function createToken(uint8 tokenIndex, string memory name, string memory symbol, uint8 decimals) external onlyAdmin {
    //     MintableERC20 tokenAddr = new MintableERC20(address(this), _getVaultWithAdminFallback(), name, symbol, decimals);
    //     _addToken(tokenIndex, address(tokenAddr));
    // }

    function removeToken(uint8 tokenIndex) external onlyAdmin {
        _removeToken(tokenIndex);
    }
}
