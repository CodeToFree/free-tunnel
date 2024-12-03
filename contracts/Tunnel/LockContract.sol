// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../utils/Permissions.sol";
import "../utils/ReqHelpers.sol";

abstract contract LockContract is Permissions, ReqHelpers {
    using SafeERC20 for IERC20;
    
    mapping(address => uint256) public lockedBalanceOf;

    mapping(bytes32 => address) public proposedLock;
    mapping(bytes32 => address) public proposedUnlock;

    event TokenLockProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenLockExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenLockCancelled(bytes32 indexed reqId, address indexed proposer);

    function __getLockTxValue(bytes32 reqId) external view returns (uint256 value) {
        if (_tokenFrom(reqId) == address(1)) {
            value = _amountFrom(reqId);
        }
    }

    function proposeLock(bytes32 reqId, address proposer) payable external fromThisHub(reqId) {
        _createdTimeFrom(reqId, true);
        uint8 action = _actionFrom(reqId);
        require(action & 0x0f == 1, "Invalid action; not lock-mint");
        require(proposedLock[reqId] == address(0), "Invalid reqId");
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        if (tokenAddr == address(1)) {
            require(msg.value >= amount, "Transferred amount (tx.value) insufficient");
        }
        proposedLock[reqId] = proposer;

        if (action & 0x10 > 0) {
            address vault = getVault();
            require(vault != address(0), "Vault not activated");

            if (tokenAddr == address(1)) {
                (bool success, ) = vault.call{value: amount}("");
                require(success, "Transfer failed");
            } else {
                IERC20(tokenAddr).safeTransferFrom(proposer, vault, amount);
            }
        } else if (tokenAddr != address(1)) {
            IERC20(tokenAddr).safeTransferFrom(proposer, address(this), amount);
        }

        emit TokenLockProposed(reqId, proposer);
    }

    receive() external payable {}

    function executeLock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        address proposer = proposedLock[reqId];
        require(proposer > address(1), "Invalid reqId");

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        proposedLock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] += amount;

        emit TokenLockExecuted(reqId, proposer);
    }

    function cancelLock(bytes32 reqId) external {
        address proposer = proposedLock[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, "Wait until expired to cancel");

        delete proposedLock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);

        if (tokenAddr == address(1)) {
            (bool success, ) = proposer.call{value: amount}("");
            require(success, "Transfer failed");
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

    function proposeUnlock(bytes32 reqId, address recipient) external onlyProposer fromThisHub(reqId) {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) & 0x0f == 2, "Invalid action; not burn-unlock");
        require(proposedUnlock[reqId] == address(0), "Invalid reqId");
        require(recipient > address(1), "Invalid recipient");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] -= amount;
        proposedUnlock[reqId] = recipient;

        emit TokenUnlockProposed(reqId, recipient);
    }

    function executeUnlock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        address recipient = proposedUnlock[reqId];
        require(recipient > address(1), "Invalid reqId");

        bytes32 digest = _digestFromReqSigningMessage(reqId);
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        proposedUnlock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        if (tokenAddr == address(1)) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "Transfer failed");
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
        address recipient = proposedUnlock[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, "Wait until expired to cancel");

        delete proposedUnlock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] += amount;

        emit TokenUnlockCancelled(reqId, recipient);
    }
}
