// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./MintableERC20.sol";
import "../Permissions.sol";
import "../ReqHelpers.sol";

contract AtomicMintContract is Permissions, ReqHelpers, UUPSUpgradeable {
    using SafeERC20 for MintableERC20;

    mapping(bytes32 => address) public proposedMint;
    mapping(bytes32 => address) public proposedBurn;

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

    function createToken(uint8 tokenIndex, string memory name, string memory symbol, uint8 decimals) external onlyAdmin {
        MintableERC20 tokenAddr = new MintableERC20(address(this), _getVaultWithAdminFallback(), name, symbol, decimals);
        _addToken(tokenIndex, address(tokenAddr));
    }

    function removeToken(uint8 tokenIndex) external onlyAdmin {
        _removeToken(tokenIndex);
    }

    event TokenMintProposed(bytes32 indexed reqId, address indexed recipient);
    event TokenMintExecuted(bytes32 indexed reqId, address indexed recipient);
    event TokenMintCancelled(bytes32 indexed reqId, address indexed recipient);

    function proposeMint(bytes32 reqId, address recipient) external onlyProposer toChainOnly(reqId) {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) & 0x0f == 1, "Invalid action; not lock-mint");
        require(proposedMint[reqId] == address(0), "Invalid reqId");
        require(recipient > address(1), "Invalid recipient");

        _amountFrom(reqId);
        _tokenFrom(reqId);
        proposedMint[reqId] = recipient;

        emit TokenMintProposed(reqId, recipient);
    }

    function executeMint(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        address recipient = proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");

        bytes32 digest = keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(3 + bytes(BRIDGE_CHANNEL).length + 29 + 66),
            "[", BRIDGE_CHANNEL, "]\n",
            "Sign to execute a lock-mint:\n", Strings.toHexString(uint256(reqId), 32)
        ));
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        proposedMint[reqId] = address(1);

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
        address recipient = proposedMint[reqId];
        require(recipient > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_EXTRA_PERIOD, "Wait until expired to cancel");

        delete proposedMint[reqId];

        emit TokenMintCancelled(reqId, recipient);
    }

    event TokenBurnProposed(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnExecuted(bytes32 indexed reqId, address indexed proposer);
    event TokenBurnCancelled(bytes32 indexed reqId, address indexed proposer);

    function proposeBurn(bytes32 reqId) payable external toChainOnly(reqId) {
        _createdTimeFrom(reqId, true);
        require(_actionFrom(reqId) & 0x0f == 2, "Invalid action; not burn-unlock");
        require(proposedBurn[reqId] == address(0), "Invalid reqId");

        address proposer = msg.sender;
        require(proposer > address(1), "Invalid proposer");

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        proposedBurn[reqId] = proposer;

        MintableERC20(tokenAddr).safeTransferFrom(proposer, address(this), amount);

        emit TokenBurnProposed(reqId, proposer);
    }

    function executeBurn(bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        address proposer = proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");

        bytes32 digest = keccak256(abi.encodePacked(
            ETH_SIGN_HEADER, Strings.toString(3 + bytes(BRIDGE_CHANNEL).length + 31 + 66),
            "[", BRIDGE_CHANNEL, "]\n",
            "Sign to execute a burn-unlock:\n", Strings.toHexString(uint256(reqId), 32)
        ));
        _checkMultiSignatures(digest, r, yParityAndS, executors, exeIndex);

        proposedBurn[reqId] = address(1);

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        MintableERC20(tokenAddr).burn(address(this), amount);

        emit TokenBurnExecuted(reqId, proposer);
    }

    function cancelBurn(bytes32 reqId) external {
        address proposer = proposedBurn[reqId];
        require(proposer > address(1), "Invalid reqId");
        require(block.timestamp > _createdTimeFrom(reqId, false) + EXPIRE_PERIOD, "Wait until expired to cancel");

        delete proposedBurn[reqId];

        uint256 amount = _amountFrom(reqId);
        address tokenAddr = _tokenFrom(reqId);
        MintableERC20(tokenAddr).safeTransfer(proposer, amount);

        emit TokenBurnCancelled(reqId, proposer);
    }
}
