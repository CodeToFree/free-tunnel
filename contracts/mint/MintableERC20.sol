// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintableERC20 is ERC20 {
    address public minter;
    uint8 private _decimals;

    constructor(address minter_, string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        minter = minter_;
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Require minter");
        _;
    }

    function mint(address account, uint256 amount) onlyMinter external {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) onlyMinter external {
        _burn(account, amount);
    }
}
