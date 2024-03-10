// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Permissions.sol";

contract ReqHelpers is Permissions {
    uint256 constant WAIT_PERIOD = 3 hours;
    uint256 constant EXPIRE_PERIOD = 24 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 36 hours;

    bytes28 constant ETH_SIGN_HEADER = bytes28("\x19Ethereum Signed Message:\n32");

    mapping(uint8 => address) public tokens;

    function addSupportedToken(uint8 tokenIndex, address tokenAddr) external onlyAdmin {
        tokens[tokenIndex] = tokenAddr;
    }

    function removeSupportedToken(uint8 tokenIndex) external onlyAdmin {
        delete tokens[tokenIndex];
    }

    /// `reqId` in format of `version:uint8|createdTime:uint40|action:uint8|tokenIndex:uint8｜amount:uint64|(TBD):uint128`
    function _versionFrom(bytes32 reqId) internal pure returns (uint8) {
        return uint8(uint256(reqId) >> 248);
    }

    function _createdTimeFrom(bytes32 reqId, bool check) internal view returns (uint256 createdTime) {
        createdTime = uint40(uint256(reqId) >> 208);
        if (check) {
            require(createdTime > block.timestamp - 20 minutes, "createdTime too early");
            require(createdTime < block.timestamp, "createdTime too late");
        }
    }

    // action:
    //   1: lock-mint
    //   2: burn-unlock
    function _actionFrom(bytes32 reqId) internal pure returns (uint8 action) {
        action = uint8(uint256(reqId) >> 200);
    }

    function _tokenFrom(bytes32 reqId) internal view returns (address tokenAddr) {
        uint8 tokenIndex = uint8(uint256(reqId) >> 192);
        tokenAddr = tokens[tokenIndex];
        require(tokenAddr != address(0), "Invalid tokenIndex");
    }

    function _amountFrom(bytes32 reqId) internal pure returns (uint256 amount) {
        amount = (uint256(reqId) >> 128) & 0xFFFFFFFFFFFFFFFF;
        require(amount > 0, "Amount must be greater than zero");
    }

    function _checkSignature(bytes32 reqId, bytes32 r, bytes32 yParityAndS, address signer) internal pure {
        require(signer != address(0), "Signer cannot be empty address");
        bytes32 s = yParityAndS & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        uint8 v = uint8((uint256(yParityAndS) >> 255) + 27);
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "Invalid signature");

        bytes32 digest = keccak256(abi.encodePacked(ETH_SIGN_HEADER, reqId));
        require(signer == ecrecover(digest, v, r, s), "Invalid signature");
    }
}
