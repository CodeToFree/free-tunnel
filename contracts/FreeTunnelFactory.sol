// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./lock/AtomicLockContract.sol";
import "./mint/AtomicMintContract.sol";

contract FreeTunnelFactory is UUPSUpgradeable {
    // 0x00: ethereum
    // 0x01: arbitrum
    // 0x02: bnb smart chain
    // 0x03: polygon
    // 0x04: optimism
    // 0x05: avalanche
    // 0x06: base
    // 0x07: linea
    // 0x08: zksync
    // 0x09: scroll
    // 0x0a: mode
    // 0x0b: manta
    // 0x0c: zklink
    // 0x0d: core
    // 0x0e: xlayer
    // 0x0f: mantle
    // 0x10: merlin
    // 0x11: b2
    // 0x12: bitlayer
    // 0x13: bevm
    // 0x14: bb
    // 0x15: bob
    // 0x16: opbnb
    // 0x1a: neox
    // 0x20: kava
    // 0x21: kroma
    // 0x22: kaia
    // 0x23: ailayer
    // 0x24: zircuit
    // 0x25: iotex
    // 0x26: zeta
    // 0x27: taiko
    // 0x28: sei
    // 0x29: duck
    // 0x2a: morph
    // 0xa0: (non-evm) sui
    // 0xf0: sepolia
    // 0xf1: merlin-testnet
    // 0xf2: b2-testnet
    uint8 public immutable CHAIN;

    mapping(bytes32 => address) public addressOfChannel;

    constructor(uint8 chain) {
        CHAIN = chain;
    }

    function initialize() public initializer {}

    function _authorizeUpgrade(address newImplementation) internal override {}

    function deployLockContract(string memory bridgeChannel, address proposer, address[] calldata executors, uint256 threshold) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        address implAddress = _deployLock(bridgeChannel, channelHash);

        bytes memory proxyBytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implAddress, abi.encodeCall(AtomicLockContract.initialize, (address(this), address(0), proposer, executors, threshold)))
        );

        address proxyAddress;
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 0x20), mload(proxyBytecode), channelHash)
        }
        require(proxyAddress != address(0), "Proxy contract failed to deploy");

        addressOfChannel[channelHash] = proxyAddress;
    }

    function upgradeLockContract(string memory bridgeChannel) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        address implAddress = _deployLock(bridgeChannel, channelHash);
        require(implAddress != address(0), "LockContract not deployed yet");
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.upgradeToAndCall(implAddress, "");
    }

    function _deployLock(string memory bridgeChannel, bytes32 channelHash) private returns (address) {
        bytes memory bytecode = abi.encodePacked(type(AtomicLockContract).creationCode, abi.encode(CHAIN, bridgeChannel));
        address deployedAddress;
        assembly {
            deployedAddress := create2(0, add(bytecode, 0x20), mload(bytecode), channelHash)
        }
        require(deployedAddress != address(0), "LockContract failed to deploy");
        return deployedAddress;
    }

    function deployMintContract(string memory bridgeChannel, address proposer, address[] calldata executors, uint256 threshold) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        address implAddress = _deployMint(bridgeChannel, channelHash);

        bytes memory proxyBytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implAddress, abi.encodeCall(AtomicMintContract.initialize, (address(this), address(0), proposer, executors, threshold)))
        );

        address proxyAddress;
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 0x20), mload(proxyBytecode), channelHash)
        }
        require(proxyAddress != address(0), "Proxy contract failed to deploy");

        addressOfChannel[channelHash] = proxyAddress;
    }

    function upgradeMintContract(string memory bridgeChannel) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        address implAddress = _deployMint(bridgeChannel, channelHash);
        require(implAddress != address(0), "MintContract not deployed yet");
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.upgradeToAndCall(implAddress, "");
    }

    function _deployMint(string memory bridgeChannel, bytes32 channelHash) private returns (address) {
        bytes memory bytecode = abi.encodePacked(type(AtomicMintContract).creationCode, abi.encode(CHAIN, bridgeChannel));
        address deployedAddress;
        assembly {
            deployedAddress := create2(0, add(bytecode, 0x20), mload(bytecode), channelHash)
        }
        require(deployedAddress != address(0), "MintContract failed to deploy");
        return deployedAddress;
    }

    // Lock methods
    function proposeLock(string memory bridgeChannel, bytes32 reqId, address proposer) external payable {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.proposeLock{ value: msg.value }(reqId, proposer);
    }

    function executeLock(string memory bridgeChannel, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.executeLock(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelLock(string memory bridgeChannel, bytes32 reqId) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.cancelLock(reqId);
    }

    // Mint methods
    function proposeMint(string memory bridgeChannel, bytes32 reqId, address recipient) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.proposeMint(reqId, recipient);
    }

    function proposeMintFromBurn(string memory bridgeChannel, bytes32 reqId, address recipient) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.proposeMintFromBurn(reqId, recipient);
    }

    function executeMint(string memory bridgeChannel, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.executeMint(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelMint(string memory bridgeChannel, bytes32 reqId) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.cancelMint(reqId);
    }

    // Unlock methods
    function proposeUnlock(string memory bridgeChannel, bytes32 reqId, address recipient) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.proposeUnlock(reqId, recipient);
    }

    function executeUnlock(string memory bridgeChannel, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.executeUnlock(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelUnlock(string memory bridgeChannel, bytes32 reqId) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (LockContract)"));
        AtomicLockContract channelContract = AtomicLockContract(payable(addressOfChannel[channelHash]));
        channelContract.cancelUnlock(reqId);
    }

    // Burn methods
    function proposeBurn(string memory bridgeChannel, bytes32 reqId, address proposer) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.proposeBurn(reqId, proposer);
    }

    function proposeBurnForMint(string memory bridgeChannel, bytes32 reqId, address proposer) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.proposeBurnForMint(reqId, proposer);
    }

    function executeBurn(string memory bridgeChannel, bytes32 reqId, bytes32[] memory r, bytes32[] memory yParityAndS, address[] memory executors, uint256 exeIndex) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.executeBurn(reqId, r, yParityAndS, executors, exeIndex);
    }

    function cancelBurn(string memory bridgeChannel, bytes32 reqId) external {
        bytes32 channelHash = keccak256(abi.encodePacked(bridgeChannel, " (MintContract)"));
        AtomicMintContract channelContract = AtomicMintContract(addressOfChannel[channelHash]);
        channelContract.cancelBurn(reqId);
    }
}
