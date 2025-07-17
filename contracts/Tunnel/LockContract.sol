// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../utils/Permissions.sol";
import "../utils/ReqHelpers.sol";

abstract contract LockContract is Permissions, ReqHelpers {
    using SafeERC20 for IERC20;

    struct LockContractStorage {
        mapping(address => uint256) lockedBalanceOf;
        mapping(bytes32 => address) proposedLock;
        mapping(bytes32 => address) proposedUnlock;
    }

    // keccak256(abi.encode(uint256(keccak256("FreeTunnel.LockContract")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant LockContractLocation = 0x90f7cb3c12ebfa90f9416fb4eafec99f060cb3a7062ece5d5e6d912499d21000;

    function _getLockContractStorage() private pure returns (LockContractStorage storage $) {
        assembly {
            $.slot := LockContractLocation
        }
    }

    event TokenLockProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenLockExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenLockCancelled(bytes32 indexed reqId, address indexed proposer);

    function lockedBalanceOf(address tokenAddr) external view returns (uint256) {
        LockContractStorage storage $ = _getLockContractStorage();
        return $.lockedBalanceOf[tokenAddr];
    }

    function proposedLock(bytes32 reqId) external view returns (address) {
        LockContractStorage storage $ = _getLockContractStorage();
        return $.proposedLock[reqId];
    }

    function proposedUnlock(bytes32 reqId) external view returns (address) {
        LockContractStorage storage $ = _getLockContractStorage();
        return $.proposedUnlock[reqId];
    }

    function proposeLock(bytes32 reqId) external payable {
        _proposeLock(reqId, msg.sender);
    }

    function proposeLockFromHub(bytes32 reqId, address proposer) external payable onlyHub {
        _proposeLock(reqId, proposer);
    }

    function _proposeLock(bytes32 reqId, address proposer) private isLockMode hubIsMintOppositeSideOf(reqId) {
        _createdTimeFrom(reqId, true);
        LockContractStorage storage $ = _getLockContractStorage();
        uint8 action = _actionFrom(reqId);
        require(action & 0x0f == 1, EInvalidAction());
        require($.proposedLock[reqId] == address(0), EInvalidReqId());
        require(proposer > address(1), EInvalidProposer());

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        if (tokenAddr == address(1)) {
            require(msg.value >= amount, ETransferFailed());
        }
        $.proposedLock[reqId] = proposer;

        if (action & 0x10 > 0) {
            address vault = getVault();
            require(vault != address(0), EVaultNotActivated());

            if (tokenAddr == address(1)) {
                (bool success, ) = vault.call{ value: amount }("");
                require(success, ETransferFailed());
            } else {
                IERC20(tokenAddr).safeTransferFrom(proposer, vault, amount);
            }
        } else if (tokenAddr != address(1)) {
            IERC20(tokenAddr).safeTransferFrom(proposer, address(this), amount);
        }

        emit TokenLockProposed(reqId, proposer);
    }

    function __getLockTxValue(bytes32 reqId) external view returns (uint256 value) {
        if (_tokenFrom(reqId) == address(1)) {
            value = _amountFrom(reqId);
        }
    }

    function executeLock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        LockContractStorage storage $ = _getLockContractStorage();
        address proposer = $.proposedLock[reqId];
        require(proposer > address(1), EInvalidReqId());

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        $.proposedLock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        $.lockedBalanceOf[tokenAddr] += amount;

        emit TokenLockExecuted(reqId, proposer);
    }

    function cancelLock(bytes32 reqId) external {
        LockContractStorage storage $ = _getLockContractStorage();
        address proposer = $.proposedLock[reqId];
        require(proposer > address(1), EInvalidReqId());
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, ENotExpiredToCancel());

        delete $.proposedLock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);

        if (tokenAddr == address(1)) {
            (bool success, ) = proposer.call{ value: amount }("");
            require(success, ETransferFailed());
        } else {
            address vault;
            if (_actionFrom(reqId) & 0x10 > 0) {
                vault = getVault();
            }
            if (vault == address(0)) {
                IERC20(tokenAddr).safeTransfer(proposer, amount);
            } else {
                IERC20(tokenAddr).safeTransferFrom(vault, proposer, amount);
            }
        }

        emit TokenLockCancelled(reqId, proposer);
    }

    event TokenUnlockProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposeUnlock(bytes32 reqId, address recipient) external onlyHubOrProposer isLockMode hubIsMintOppositeSideOf(reqId) {
        _createdTimeFrom(reqId, true);
        LockContractStorage storage $ = _getLockContractStorage();
        require(_actionFrom(reqId) & 0x0f == 2, EInvalidAction());
        require($.proposedUnlock[reqId] == address(0), EInvalidReqId());
        require(recipient > address(1), EInvalidRecipient());

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        $.lockedBalanceOf[tokenAddr] -= amount;
        $.proposedUnlock[reqId] = recipient;

        emit TokenUnlockProposed(reqId, recipient);
    }

    function executeUnlock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        LockContractStorage storage $ = _getLockContractStorage();
        address recipient = $.proposedUnlock[reqId];
        require(recipient > address(1), EInvalidReqId());

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        $.proposedUnlock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        if (tokenAddr == address(1)) {
            (bool success, ) = recipient.call{ value: amount }("");
            require(success, ETransferFailed());
        } else {
            address vault;
            if (_actionFrom(reqId) & 0x10 > 0) {
                vault = getVault();
            }
            if (vault == address(0)) {
                IERC20(tokenAddr).safeTransfer(recipient, amount);
            } else {
                IERC20(tokenAddr).safeTransferFrom(vault, recipient, amount);
            }
        }

        emit TokenUnlockExecuted(reqId, recipient);
    }

    function cancelUnlock(bytes32 reqId) external {
        LockContractStorage storage $ = _getLockContractStorage();
        address recipient = $.proposedUnlock[reqId];
        require(recipient > address(1), EInvalidReqId());
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, ENotExpiredToCancel());

        delete $.proposedUnlock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        $.lockedBalanceOf[tokenAddr] += amount;

        emit TokenUnlockCancelled(reqId, recipient);
    }

    receive() external payable {}
}
