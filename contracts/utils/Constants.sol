// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Constants {
    uint64 public immutable VERSION;
    uint8 public immutable HUB_ID;
    bytes32 internal immutable TUNNEL_NAME_BYTES;
    uint8 internal immutable TUNNEL_NAME_LEN;

    constructor (uint64 version, uint8 hubId, string memory tunnelName) {
        VERSION = version;
        HUB_ID = hubId;

        bytes memory nameBytes = bytes(tunnelName);
        uint256 len = nameBytes.length;
        require(len < 32, "The length of tunnelName must be less than 32.");
        bytes32 nameBytes32;
        assembly {
            nameBytes32 := mload(add(nameBytes, 32))
        }
        TUNNEL_NAME_BYTES = nameBytes32;
        TUNNEL_NAME_LEN = uint8(len);
    }

    function getTunnelName() public view returns (string memory tunnelName) {
        bytes32 nameBytes = TUNNEL_NAME_BYTES;
        tunnelName = new string(TUNNEL_NAME_LEN);
        assembly {
            mstore(add(tunnelName, 32), nameBytes)
        }
    }

    uint256 constant PROPOSE_PERIOD = 48 hours;
    uint256 constant EXPIRE_PERIOD = 72 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 96 hours;

    bytes26 constant ETH_SIGN_HEADER = bytes26("\x19Ethereum Signed Message:\n");
}
