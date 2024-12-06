// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

contract DelayedERC1967Proxy is Proxy {
    function initImplementation(address implAddress, bytes memory data) external {
        require(_implementation() == address(0), "Already has an implementation");
        require(implAddress != address(0), "Cannot init to zero implementation");
        ERC1967Utils.upgradeToAndCall(implAddress, data);
    }

    function _implementation() internal view virtual override returns (address) {
        return ERC1967Utils.getImplementation();
    }
}
