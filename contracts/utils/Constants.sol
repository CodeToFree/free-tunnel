// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITunnelHub {
    function HUB_ID() external view returns (uint8);
    function upgradeTunnel(string memory, bool, uint64) external returns (address);
    function getProxyBytecode() external pure returns (bytes memory);
    function getMultiControlERC20Bytecode() external pure returns (bytes memory);
}

contract Constants {
    uint64 public immutable VERSION;
    address public immutable HUB_ADDRESS;
    uint8 public immutable HUB_ID;
    bytes32 internal immutable TUNNEL_NAME_BYTES;
    uint8 internal immutable TUNNEL_NAME_LEN;
    bool public immutable IS_LOCK_MODE;

    uint256 constant PROPOSE_PERIOD = 48 hours;
    uint256 constant EXPIRE_PERIOD = 72 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 96 hours;

    error EOnlyFreeTunnelHub();
    error ETunnelNameTooLong();

    constructor(uint64 version, address hubAddress, string memory tunnelName, bool isLockMode) {
        VERSION = version;
        HUB_ADDRESS = hubAddress;
        HUB_ID = ITunnelHub(hubAddress).HUB_ID();
        IS_LOCK_MODE = isLockMode;

        bytes memory nameBytes = bytes(tunnelName);
        uint256 len = nameBytes.length;
        require(len < 32, ETunnelNameTooLong());
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

    modifier onlyHub() {
        require(msg.sender == HUB_ADDRESS, EOnlyFreeTunnelHub());
        _;
    }
}
