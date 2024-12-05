// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../utils/Permissions.sol";
import "../utils/ReqHelpers.sol";
import "../utils/MintableERC20.sol";

abstract contract MintContract is Permissions, ReqHelpers {
    using SafeERC20 for MintableERC20;

    struct MintContractStorage {
        mapping(bytes32 => address) proposedMint;
        mapping(bytes32 => address) proposedBurn;
    }

    // keccak256(abi.encode(uint256(keccak256("FreeTunnel.MintContract")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant MintContractLocation = 0x0ce47b8019829ba7e1ad1ecc3567e0440e2ce6aa95722ff9c6221e887a876c00;

    function _getMintContractStorage() private pure returns (MintContractStorage storage $) {
        assembly {
            $.slot := MintContractLocation
        }
    }

    event TokenMintProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenMintExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenMintCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposedMint(bytes32 reqId) external view returns (address) {
        MintContractStorage storage $ = _getMintContractStorage();
        return $.proposedMint[reqId];
    }

    function proposedBurn(bytes32 reqId) external view returns (address) {
        MintContractStorage storage $ = _getMintContractStorage();
        return $.proposedBurn[reqId];
    }

    function proposeMint(bytes32 reqId, address recipient) external onlyHubOrProposer isMintMode hubIsMintSideOf(reqId) {
        require(_actionFrom(reqId) & 0x0f == 1, "Invalid action; not lock-mint");
        _proposeMint(reqId, recipient);
    }

    function proposeMintFromBurn(bytes32 reqId, address recipient) external onlyHubOrProposer isMintMode hubIsMintSideOf(reqId) {
        require(_actionFrom(reqId) & 0x0f == 3, "Invalid action; not burn-mint");
        _proposeMint(reqId, recipient);
    }

    function _proposeMint(bytes32 reqId, address recipient) private {
        _createdTimeFrom(reqId, true);
        MintContractStorage storage $ = _getMintContractStorage();
        require($.proposedMint[reqId] == address(0), "Invalid reqId");
        require(recipient > address(1), "Invalid recipient");

        _amountFrom(reqId);
        _tokenFrom(reqId);
        $.proposedMint[reqId] = recipient;

        emit TokenMintProposed(reqId, recipient);
    }

    function executeMint(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        MintContractStorage storage $ = _getMintContractStorage();
        address recipient = $.proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        $.proposedMint[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        address vault;
        if (_actionFrom(reqId) & 0x10 > 0) {
            vault = getVault();
        }
        if (vault == address(0)) {
            MintableERC20(tokenAddr).mint(recipient, amount);
        } else {
            MintableERC20(tokenAddr).mint(vault, amount);
        }

        emit TokenMintExecuted(reqId, recipient);
    }

    function cancelMint(bytes32 reqId) external {
        MintContractStorage storage $ = _getMintContractStorage();
        address recipient = $.proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, "Wait until expired to cancel");

        delete $.proposedMint[reqId];

        emit TokenMintCancelled(reqId, recipient);
    }

    event TokenBurnProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnCancelled(bytes32 indexed reqId, address indexed proposer);

    function proposeBurn(bytes32 reqId, address proposer) external payable isMintMode hubIsMintSideOf(reqId) {
        require(_actionFrom(reqId) & 0x0f == 2, "Invalid action; not burn-unlock");
        _proposeBurn(reqId, proposer);
    }

    function proposeBurnForMint(bytes32 reqId, address proposer) external payable isMintMode hubIsMintOppositeSideOf(reqId) {
        require(_actionFrom(reqId) & 0x0f == 3, "Invalid action; not burn-mint");
        _proposeBurn(reqId, proposer);
    }

    function _proposeBurn(bytes32 reqId, address proposer) private {
        _createdTimeFrom(reqId, true);
        MintContractStorage storage $ = _getMintContractStorage();
        require($.proposedBurn[reqId] == address(0), "Invalid reqId");
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        $.proposedBurn[reqId] = proposer;

        MintableERC20(tokenAddr).safeTransferFrom(proposer, address(this), amount);

        emit TokenBurnProposed(reqId, proposer);
    }

    function executeBurn(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        MintContractStorage storage $ = _getMintContractStorage();
        address proposer = $.proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        $.proposedBurn[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        MintableERC20(tokenAddr).burn(address(this), amount);

        emit TokenBurnExecuted(reqId, proposer);
    }

    function cancelBurn(bytes32 reqId) external {
        MintContractStorage storage $ = _getMintContractStorage();
        address proposer = $.proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, "Wait until expired to cancel");

        delete $.proposedBurn[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        MintableERC20(tokenAddr).safeTransfer(proposer, amount);

        emit TokenBurnCancelled(reqId, proposer);
    }
}
