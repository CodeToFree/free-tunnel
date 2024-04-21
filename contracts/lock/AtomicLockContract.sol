// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../Permissions.sol";
import "../ReqHelpers.sol";

contract AtomicLockContract is Permissions, ReqHelpers, UUPSUpgradeable {
    using SafeERC20 for IERC20;
    
    mapping(address => uint256) public lockedBalanceOf;

    mapping(bytes32 => address) public proposedLock;
    mapping(bytes32 => address) public proposedUnlock;

    function initialize(address _admin, address _vault, address proposer, address[] calldata executors, uint256 threshold) public initializer {
        _initAdmin(_admin);
        _initVault(_vault);
        _addProposer(proposer);
        _initExecutors(executors, threshold);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    function addToken(uint8 tokenIndex, address tokenAddr) external onlyAdmin {
        _addToken(tokenIndex, tokenAddr);
    }

    function removeToken(uint8 tokenIndex) external onlyAdmin {
        _removeToken(tokenIndex);
    }

    event TokenLockProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenLockExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenLockCancelled(bytes32 indexed reqId, address indexed proposer);

    function proposeLock(bytes32 reqId) payable external fromChainOnly(reqId) {
        _createdTimeFrom(reqId, true);
        uint8 action = _actionFrom(reqId);
        require(action & 0x0f == 1, "Invalid action; not lock-mint");
        require(proposedLock[reqId] == address(0), "Invalid reqId");

        address proposer = msg.sender;
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        proposedLock[reqId] = proposer;

        if (tokenAddr == address(1)) {
            require(amount == msg.value, "msg.value should equal the amount encoded in reqId");
            if (action & 0x10 > 0) {
                address vault = getVault();
                (bool success, ) = vault.call{value: amount}("");
                require(success, "Transfer failed");
            }
        } else {
            if (action & 0x10 > 0) {
                IERC20(tokenAddr).safeTransferFrom(proposer, getVault(), amount);
            } else {
                IERC20(tokenAddr).safeTransferFrom(proposer, address(this), amount);
            }
        }

        emit TokenLockProposed(reqId, proposer);
    }

    function executeLock(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        address proposer = proposedLock[reqId];
        require(proposer > address(1), "Invalid reqId");

        bytes32 digest = keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(3 + bytes(BRIDGE_CHANNEL).length + 29 + 66),
            "[", BRIDGE_CHANNEL, "]\n",
            "Sign to execute a lock-mint:\n", Strings.toHexString(uint256(reqId), 32)
        ));
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
            if (_actionFrom(reqId) & 0x10 > 0) {
                IERC20(tokenAddr).safeTransferFrom(getVault(), proposer, amount);
            } else {
                IERC20(tokenAddr).safeTransfer(proposer, amount);
            }
        }

        emit TokenLockCancelled(reqId, proposer);
    }

    event TokenUnlockProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenUnlockCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposeUnlock(bytes32 reqId, address recipient) external onlyProposer fromChainOnly(reqId) {
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

        bytes32 digest = keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(3 + bytes(BRIDGE_CHANNEL).length + 31 + 66),
            "[", BRIDGE_CHANNEL, "]\n",
            "Sign to execute a burn-unlock:\n", Strings.toHexString(uint256(reqId), 32)
        ));
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        proposedUnlock[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        if (tokenAddr == address(1)) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            if (_actionFrom(reqId) & 0x10 > 0) {
                IERC20(tokenAddr).safeTransferFrom(getVault(), recipient, amount);
            } else {
                IERC20(tokenAddr).safeTransfer(recipient, amount);
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
