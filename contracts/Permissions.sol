// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Permissions {
    address public admin;

    mapping(address => uint256) public proposerIndex;
    address[] public proposerList;

    address[][] public executorsForIndex;
    uint256[] public exeThresholdForIndex;
    uint256[] public exeActiveSinceForIndex;

    bytes26 constant ETH_SIGN_HEADER = bytes26("\x19Ethereum Signed Message:\n");

    modifier onlyAdmin() {
        require(msg.sender == admin, "Require admin");
        _;
    }

    modifier onlyProposer() {
        require(proposerIndex[msg.sender] > 0, "Require a proposer");
        _;
    }

    event AdminTransferred(address indexed prevAdmin, address indexed newAdmin);

    function transferAdmin(address newAdmin) external onlyAdmin {
        address prevAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(prevAdmin, newAdmin);
    }

    event ProposerAdded(address indexed proposer);
    event ProposerRemoved(address indexed proposer);

    function addProposer(address proposer) external onlyAdmin {
        _addProposer(proposer);
    }

    function _addProposer(address proposer) internal {
        require(proposerIndex[proposer] == 0, "Already a proposer");
        proposerList.push(proposer);
        proposerIndex[proposer] = proposerList.length;
        emit ProposerAdded(proposer);
    }

    function removeProposer(address proposer) external onlyAdmin {
        uint256 index = proposerIndex[proposer];
        require(index > 0, "Not an existing proposer");
        delete proposerIndex[proposer];

        uint256 len = proposerList.length;
        if (index < len) {
            address lastProposer = proposerList[len - 1];
            proposerList[index - 1] = lastProposer;
            proposerIndex[lastProposer] = index;
        }
        proposerList.pop();
        emit ProposerRemoved(proposer);
    }

    function _initExecutors(address[] memory executors, uint256 threshold) internal {
        require(exeThresholdForIndex.length == 0, "Executors already initialized");
        require(threshold > 0, "Threshold must be greater than 0");
        executorsForIndex.push(executors);
        exeThresholdForIndex.push(threshold);
        exeActiveSinceForIndex.push(1);
    }

    // All history executors will be recorded and indexed in chronological order. 
    // When a new set of `executors` is updated, the index will increase by 1. 
    // When updating `executors`, an `activeSince` timestamp must be provided, 
    // indicating the time from which this set of `executors` will become effective. 
    // The `activeSince` must be between 3 and 7 days after the current time, and also 
    // at least 1 day after the `activeSince` of the previous set of `executors`. 
    // Note that when the new set of `executors` becomes effective, the previous 
    // set of `executors` will become invalid.
    function updateExecutors(
        address[] calldata newExecutors,
        uint256 threshold,
        uint256 activeSince,
        bytes32[] calldata r, bytes32[] calldata yParityAndS, address[] calldata executors, uint256 exeIndex
    ) external {
        require(threshold > 0, "Threshold must be greater than 0");
        require(activeSince > block.timestamp + 36 hours, "The activeSince should be after 1.5 days from now");
        require(activeSince < block.timestamp + 5 days, "The activeSince should be within 5 days from now");

        bytes32 digest = keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(29 + 43 * newExecutors.length + 11 + Math.log10(threshold) + 1),
            "Sign to update executors to:\n",
            __joinAddressList(newExecutors),
            "Threshold: ", Strings.toString(threshold)
        ));
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        uint256 newIndex = exeIndex + 1;
        if (newIndex == exeActiveSinceForIndex.length) {
            executorsForIndex.push(newExecutors);
            exeThresholdForIndex.push(threshold);
            exeActiveSinceForIndex.push(activeSince);
        } else {
            require(activeSince >= exeActiveSinceForIndex[newIndex], "Failed to overwrite existing executors");
            require(threshold >= exeThresholdForIndex[newIndex], "Failed to overwrite existing executors");
            require(__cmpAddrList(newExecutors, executorsForIndex[newIndex]), "Failed to overwrite existing executors");
            executorsForIndex[newIndex] = newExecutors;
            exeThresholdForIndex[newIndex] = threshold;
            exeActiveSinceForIndex[newIndex] = activeSince;
        }
    }

    function packParameters(
        address[] calldata newExecutors,
        uint256 threshold
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(29 + 43 * newExecutors.length + 11 + Math.log10(threshold) + 1),
            "Sign to update executors to:\n",
            __joinAddressList(newExecutors),
            "Threshold: ", Strings.toString(threshold)
        ));
    }

    function __joinAddressList(address[] memory addrs) private pure returns (string memory) {
        string memory result = "";

        for (uint256 i = 0; i < addrs.length; i++) {
            string memory addrStr = Strings.toHexString(addrs[i]);
            if (i == 0) {
                result = string(abi.encodePacked(addrStr, "\n"));
            } else {
                result = string(abi.encodePacked(result, addrStr, "\n"));
            }
        }

        return result;
    }

    function __cmpAddrList(address[] memory list1, address[] memory list2) private pure returns (bool) {
        if (list1.length > list2.length) {
            return true;
        } else if (list1.length < list2.length) {
            return false;
        }
        for (uint256 i = 0; i < list1.length; i++) {
            if (list1[i] > list2[i]) {
                return true;
            } else if (list1[i] < list2[i]) {
                return false;
            }
        }
        return false;
    }

    function _checkMultiSignatures(
        bytes32 digest,
        bytes32[] memory r,
        bytes32[] memory yParityAndS,
        address[] memory executors,
        uint256 exeIndex
    ) internal view {
        require(r.length == yParityAndS.length, "Array length should equal");
        require(r.length == executors.length, "Array length should equal");

        __checkExecutorsForIndex(executors, exeIndex);

        for (uint256 i = 0; i < executors.length; i++) {
            address executor = executors[i];
            __checkSignature(digest, r[i], yParityAndS[i], executor);
        }
    }

    function __checkExecutorsForIndex(address[] memory executors, uint256 exeIndex) private view {
        require(executors.length >= exeThresholdForIndex[exeIndex], "Does not meet threshold");

        uint256 blockTime = block.timestamp;
        uint256 activeSince = exeActiveSinceForIndex[exeIndex];
        require(activeSince < blockTime, "Executors not yet active");

        if (exeActiveSinceForIndex.length > exeIndex + 1) {
            uint256 nextActiveSince = exeActiveSinceForIndex[exeIndex + 1];
            require(nextActiveSince > blockTime, "Executors of next index is active");
        }

        address[] memory currentExecutors = executorsForIndex[exeIndex];
        for (uint256 i = 0; i < executors.length; i++) {
            address executor = executors[i];
            for (uint256 j = 0; j < i; j++) {
                require(executors[j] != executor, "Duplicated executors");
            }

            bool isExecutor = false;
            for (uint256 j = 0; j < currentExecutors.length; j++) {
                if (executor == currentExecutors[j]) {
                    isExecutor = true;
                    break;
                }
            }
            if (!isExecutor) {
                require(isExecutor, "Non-executor");
            }
        }
    }

    function __checkSignature(bytes32 digest, bytes32 r, bytes32 yParityAndS, address signer) internal pure {
        require(signer != address(0), "Signer cannot be empty address");
        bytes32 s = yParityAndS & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        uint8 v = uint8((uint256(yParityAndS) >> 255) + 27);
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "Invalid signature");

        require(signer == ecrecover(digest, v, r, s), "Invalid signature");
    }
}
