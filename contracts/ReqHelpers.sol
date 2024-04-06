// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReqHelpers {
    // 0x00: ethereum
    // 0x01: arbitrum
    // 0x10: merlin
    // 0x11: b2
    // 0x12: bitlayer
    // 0xf0: sepolia
    // 0xf1: merlin-testnet
    // 0xf2: b2-testnet
    uint8 constant CHAIN = 1;

    uint256 constant EXPIRE_PERIOD = 24 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 36 hours;

    mapping(uint8 => address) public tokens;

    event TokenAdded(uint8 tokenIndex, address tokenAddr);
    event TokenRemoved(uint8 tokenIndex, address tokenAddr);

    function _addToken(uint8 tokenIndex, address tokenAddr) internal {
        require(tokens[tokenIndex] == address(0), "Token index occupied");
        require(tokenAddr != address(0), "Token address cannot be zero");
        tokens[tokenIndex] = tokenAddr;

        emit TokenAdded(tokenIndex, tokenAddr);
    }

    function _removeToken(uint8 tokenIndex) internal {
        address tokenAddr = tokens[tokenIndex];
        require(tokenAddr != address(0), "No token for this tokenIndex");
        delete tokens[tokenIndex];

        emit TokenRemoved(tokenIndex, tokenAddr);
    }

    function getSupportedTokens() external view returns (address[] memory supportedTokens, uint8[] memory indexes) {
        uint8 i;
        uint8 num = 0;
        for (i = 0; i < 255; i++) {
            if (tokens[i+1] != address(0)) {
                num++;
            }
        }
        supportedTokens = new address[](num);
        indexes = new uint8[](num);
        uint8 j = 0;
        for (i = 0; i < 255; i++) {
            if (tokens[i+1] != address(0)) {
                supportedTokens[j] = tokens[i+1];
                indexes[j] = i+1;
                j++;
            }
        }
    }

    /// `reqId` in format of `version:uint8|createdTime:uint40|action:uint8|tokenIndex:uint8|amount:uint64|from:uint8|to:uint8|(TBD):uint112`
    function _versionFrom(bytes32 reqId) internal pure returns (uint8) {
        return uint8(uint256(reqId) >> 248);
    }

    function _createdTimeFrom(bytes32 reqId, bool check) internal view returns (uint256 createdTime) {
        createdTime = uint40(uint256(reqId) >> 208);
        if (check) {
            require(createdTime > block.timestamp - 30 minutes, "createdTime too early");
            require(createdTime < block.timestamp + 1 minutes, "createdTime too late");
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

    modifier fromChainOnly(bytes32 reqId) {
        require(CHAIN == uint8(uint256(reqId) >> 120), "Request not from the current chain");
        _;
    }

    modifier toChainOnly(bytes32 reqId) {
        require(CHAIN == uint8(uint256(reqId) >> 112), "Request not to the current chain");
        _;
    }
}
