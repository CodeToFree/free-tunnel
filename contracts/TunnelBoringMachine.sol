// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Tunnel/TunnelContract.sol";

contract TunnelBoringMachine {
    uint64 public immutable VERSION;

    constructor (uint64 version) {
        VERSION = version;
    }

    function openNewTunnel(uint8 hubId, string memory tunnelName, bytes32 tunnelHash) external returns (address tunnelAddress) {
        bytes memory bytecode = abi.encodePacked(type(TunnelContract).creationCode, abi.encode(VERSION, hubId, tunnelName));
        assembly {
            tunnelAddress := create2(0, add(bytecode, 0x20), mload(bytecode), tunnelHash)
        }
        require(tunnelAddress != address(0), "TunnelContract failed to deploy");
    }
}
