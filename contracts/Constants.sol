// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Constants {
    uint8 public immutable CHAIN;
    bytes32 internal immutable BRIDGE_CHANNEL_BYTES;
    uint8 internal immutable BRIDGE_CHANNEL_LEN;

    constructor (uint8 chain, string memory bridgeChannel) {
        CHAIN = chain;

        bytes memory channelBytes = bytes(bridgeChannel);
        uint256 len = channelBytes.length;
        require(len < 32, "The length of bridgeChannel must be less than 32.");
        bytes32 channelBytes32;
        assembly {
            channelBytes32 := mload(add(channelBytes, 32))
        }
        BRIDGE_CHANNEL_BYTES = channelBytes32;
        BRIDGE_CHANNEL_LEN = uint8(len);
    }

    function getBridgeChannel() public view returns (bytes memory) {
        uint8 n = BRIDGE_CHANNEL_LEN;
        bytes32 data = BRIDGE_CHANNEL_BYTES;
        bytes memory result = new bytes(BRIDGE_CHANNEL_LEN);
        assembly {
            let resultPtr := add(result, 0x20)
            mstore(resultPtr, shl(mul(sub(32, n), 8), data))
        }
        return result;
    }

    uint256 constant PROPOSE_PERIOD = 48 hours;
    uint256 constant EXPIRE_PERIOD = 72 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 96 hours;

    bytes26 constant ETH_SIGN_HEADER = bytes26("\x19Ethereum Signed Message:\n");
}
