// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MultiControlERC20 is ERC20Upgradeable, Ownable2StepUpgradeable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    uint8 private _decimals;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    mapping(address => bool) public blacklisted;

    uint256 public mintQuota;

    error EOnlyGuardianOrOwner();
    error EBlacklisted();

    function initConfigs(string memory name, string memory symbol, uint8 decimals_, address owner) public initializer {
        __ERC20_init(name, symbol);
        _decimals = decimals_;
        __Ownable_init(owner);
        _grantRole(MINTER_ROLE, _msgSender());
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}


    // blacklist
    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external onlyOwner {
        delete blacklisted[account];
        emit Unblacklisted(account);
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], EBlacklisted());
        _;
    }

    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);


    // minter
    function grantMinterRole(address account) external onlyOwner {
        _grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) external onlyOwner {
        _revokeRole(MINTER_ROLE, account);
    }

    function renounceMinterRole() external onlyRole(MINTER_ROLE) {
        _revokeRole(MINTER_ROLE, _msgSender());
    }

    function updateMintQuota(uint256 quota) external onlyOwner {
        mintQuota = quota;
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) notBlacklisted(to) whenNotPaused {
        if (to != owner()) {
            mintQuota -= amount;
        }
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(account, amount);
    }


    // guardian
    function grantGuardianRole(address account) external onlyOwner {
        _grantRole(GUARDIAN_ROLE, account);
    }

    function revokeGuardianRole(address account) external onlyOwner {
        _revokeRole(GUARDIAN_ROLE, account);
    }

    function renounceGuardianRole() external onlyRole(GUARDIAN_ROLE) {
        _revokeRole(GUARDIAN_ROLE, _msgSender());
    }

    function pause() external {
        require(_msgSender() == owner() || hasRole(GUARDIAN_ROLE, _msgSender()), EOnlyGuardianOrOwner());
        _pause();
    }

    function unpause() external {
        require(_msgSender() == owner() || hasRole(GUARDIAN_ROLE, _msgSender()), EOnlyGuardianOrOwner());
        _unpause();
    }


    // ERC20 methods
    function transfer(
        address recipient,
        uint256 amount
    ) public override notBlacklisted(_msgSender()) notBlacklisted(recipient) whenNotPaused returns (bool) {
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override notBlacklisted(sender) notBlacklisted(recipient) whenNotPaused returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    function approve(
        address spender,
        uint256 amount
    ) public override notBlacklisted(_msgSender()) notBlacklisted(spender) whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }
}
