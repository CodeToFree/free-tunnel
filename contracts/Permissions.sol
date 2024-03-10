// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Permissions {
    address public admin;

    mapping(address => uint256) public proposerIndex;
    address[] public proposerList;

    mapping(address => uint256) public executorIndex;
    address[] public executorList;
    uint256 public executeThreshold;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Require admin");
        _;
    }

    modifier onlyProposer() {
        require(proposerIndex[msg.sender] > 0, "Require a proposer");
        _;
    }

    modifier onlyExecutor() {
        require(executorIndex[msg.sender] > 0, "Require an executor");
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

    event ExecutorAdded(address indexed executor);
    event ExecutorRemoved(address indexed executor);

    function addExecuter(address executor) external onlyAdmin {
        require(executorIndex[executor] == 0, "Already a executor");
        executorList.push(executor);
        executorIndex[executor] = executorList.length;
        emit ExecutorAdded(executor);
    }

    function removeExecuter(address executor) external onlyAdmin {
        uint256 index = executorIndex[executor];
        require(index > 0, "Not an existing executor");
        delete executorIndex[executor];

        uint256 len = executorList.length;
        if (index < len) {
            address lastExecuter = executorList[len - 1];
            executorList[index - 1] = lastExecuter;
            executorIndex[lastExecuter] = index;
        }
        executorList.pop();
        emit ExecutorRemoved(executor);
    }

    function setExecuteThreshold(uint256 threshold) external onlyAdmin {
        executeThreshold = threshold;
    }
}
