// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Tunnel/TunnelContract.sol";

contract TunnelBoringMachine {
    uint64 public immutable VERSION;
    address public immutable HUB_ADDRESS;

    error EOnlyFreeTunnelHub();
    error EDeploy();

    constructor(uint64 version) {
        VERSION = version;
        HUB_ADDRESS = msg.sender;
    }

    function openNewTunnel(address hubAddress, string memory tunnelName, bool isLockMode) external returns (address tunnelAddress) {
        require(msg.sender == HUB_ADDRESS, EOnlyFreeTunnelHub());
        bytes memory bytecode = abi.encodePacked(type(TunnelContract).creationCode, abi.encode(VERSION, hubAddress, tunnelName, isLockMode));
        assembly {
            tunnelAddress := create2(0, add(bytecode, 0x20), mload(bytecode), "")
        }
        require(tunnelAddress != address(0), EDeploy());
    }
}
