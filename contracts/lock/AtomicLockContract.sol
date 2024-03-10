// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "../ReqHelpers.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AtomicLockContract is ReqHelpers, UUPSUpgradeable {

    mapping(address => uint256) public lockedBalanceOf;

    mapping(bytes32 => address) public proposedLock;
    mapping(bytes32 => address) public proposedUnlock;

    function initialize(address _admin) public initializer {
        admin = _admin;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    event TokenLockProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenLockExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenLockCancelled(bytes32 indexed reqId, address indexed proposer);

    function proposeLock(bytes32 reqId) external onlyProposer {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) == 1, "Invalid action; not lock-mint");
        require(proposedLock[reqId] == address(0), "Invalid reqId");

        address proposer = msg.sender;
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        proposedLock[reqId] = proposer;

        IERC20(tokenAddr).transferFrom(proposer, address(this), amount);

        emit TokenLockProposed(reqId, proposer);
    }

    function executeLock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors) external onlyExecutor {
        address proposer = proposedLock[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + WAIT_PERIOD, "Wait at least 3 hours to execute");

        require(r.length == yParityAndS.length, "Array length should equal");
        require(r.length == executors.length, "Array length should equal");
        require(r.length >= executeThreshold, "Does not meet threshold");
        for (uint256 i = 0; i < r.length; i++) {
            _checkSignature(reqId, r[i], yParityAndS[i], executors[i]);
        }

        proposedLock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] += amount;

        emit TokenLockExecuted(reqId, proposer);
    }

    function cancelLock(bytes32 reqId) external {
        address proposer = proposedLock[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, "Wait expire time to cancel");

        delete proposedLock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        IERC20(tokenAddr).transfer(proposer, amount);

        emit TokenLockCancelled(reqId, proposer);
    }

    event TokenUnlockProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposeUnlock(bytes32 reqId, address recipient) external onlyProposer {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) == 2, "Invalid action; not burn-unlock");
        require(proposedUnlock[reqId] == address(0), "Invalid reqId");
        require(recipient > address(1), "Invalid recipient");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] -= amount;
        proposedUnlock[reqId] = recipient;

        emit TokenUnlockProposed(reqId, recipient);
    }

    function executeUnlock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors) external {
        address recipient = proposedUnlock[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + WAIT_PERIOD, "Wait at least 3 hours to execute");

        require(r.length == yParityAndS.length, "Array length should equal");
        require(r.length == executors.length, "Array length should equal");
        require(r.length >= executeThreshold, "Does not meet threshold");
        for (uint256 i = 0; i < r.length; i++) {
            _checkSignature(reqId, r[i], yParityAndS[i], executors[i]);
        }

        proposedUnlock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        IERC20(tokenAddr).transfer(recipient, amount);

        emit TokenUnlockExecuted(reqId, recipient);
    }

    function cancelUnlock(bytes32 reqId) external {
        address recipient = proposedUnlock[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, "Wait expire time to cancel");

        delete proposedUnlock[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        lockedBalanceOf[tokenAddr] += amount;

        emit TokenUnlockCancelled(reqId, recipient);
    }
}
