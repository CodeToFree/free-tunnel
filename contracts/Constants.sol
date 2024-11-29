// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Constants {
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
    uint8 constant CHAIN = 0x00;

    // This value should be different for different bridge deployments
    string constant BRIDGE_CHANNEL = "Merlin ERC20 Bridge";

    uint256 constant PROPOSE_PERIOD = 48 hours;
    uint256 constant EXPIRE_PERIOD = 72 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 96 hours;

    bytes26 constant ETH_SIGN_HEADER = bytes26("\x19Ethereum Signed Message:\n");
}
