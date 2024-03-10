// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "../ReqHelpers.sol";

interface IMintableERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mint(address account, uint256 amount) external returns (bool);
    function burn(address account, uint256 amount) external returns (bool);
}

contract AtomicMintContract is ReqHelpers, UUPSUpgradeable, ERC20Upgradeable {
    mapping(bytes32 => address) public proposedMint;
    mapping(bytes32 => address) public proposedBurn;

    function initialize(address _admin) public initializer {
        admin = _admin;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    event TokenMintProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenMintExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenMintCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposeMint(bytes32 reqId, address recipient) external onlyProposer {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) == 1, "Invalid action; not lock-mint");
        require(proposedMint[reqId] == address(0), "Invalid reqId");
        require(recipient > address(1), "Invalid recipient");

        _amountFrom(reqId);
        _tokenFrom(reqId);
        proposedMint[reqId] = recipient;

        emit TokenMintProposed(reqId, recipient);
    }

    function executeMint(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors) external onlyExecutor {
        address recipient = proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + WAIT_PERIOD, "Wait at least 3 hours to execute");

        require(r.length == yParityAndS.length, "Array length should equal");
        require(r.length == executors.length, "Array length should equal");
        require(r.length >= executeThreshold, "Does not meet threshold");
        for (uint256 i = 0; i < r.length; i++) {
            _checkSignature(reqId, r[i], yParityAndS[i], executors[i]);
        }

        proposedMint[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        IMintableERC20(tokenAddr).mint(recipient, amount);

        emit TokenMintExecuted(reqId, recipient);
    }

    function cancelMint(bytes32 reqId) external {
        address recipient = proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, "Wait expire time to cancel");

        delete proposedMint[reqId];

        emit TokenMintCancelled(reqId, recipient);
    }

    event TokenBurnProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnCancelled(bytes32 indexed reqId, address indexed proposer);

    function proposeBurn(bytes32 reqId) external onlyProposer {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) == 2, "Invalid action; not burn-unlock");
        require(proposedBurn[reqId] == address(0), "Invalid reqId");

        address proposer = msg.sender;
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        proposedBurn[reqId] = proposer;

        IMintableERC20(tokenAddr).transferFrom(proposer, address(this), amount);

        emit TokenBurnProposed(reqId, proposer);
    }

    function executeBurn(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors) external onlyExecutor {
        address proposer = proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + WAIT_PERIOD, "Wait at least 3 hours to execute");

        require(r.length == yParityAndS.length, "Array length should equal");
        require(r.length == executors.length, "Array length should equal");
        require(r.length >= executeThreshold, "Does not meet threshold");
        for (uint256 i = 0; i < r.length; i++) {
            _checkSignature(reqId, r[i], yParityAndS[i], executors[i]);
        }

        proposedBurn[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        IMintableERC20(tokenAddr).burn(address(this), amount);

        emit TokenBurnExecuted(reqId, proposer);
    }

    function cancelBurn(bytes32 reqId) external {
        address proposer = proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, "Wait expire time to cancel");

        delete proposedBurn[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        IMintableERC20(tokenAddr).transfer(proposer, amount);

        emit TokenBurnCancelled(reqId, proposer);
    }
}
