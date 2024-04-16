// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract ReqHelpers {
    // 0x00: ethereum
    // 0x01: arbitrum
    // 0x02: bnb smart chain
    // 0x0a: mode
    // 0x10: merlin
    // 0x11: b2
    // 0x12: bitlayer
    // 0xf0: sepolia
    // 0xf1: merlin-testnet
    // 0xf2: b2-testnet
    uint8 constant CHAIN = 0x00;

    // This value should be different for different bridge deployments
    string constant BRIDGE_CHANNEL = "Merlin ERC20 Bridge";

    uint256 constant PROPOSE_PERIOD = 2 hours;
    uint256 constant EXPIRE_PERIOD = 24 hours;
    uint256 constant EXPIRE_EXTRA_PERIOD = 36 hours;

    struct ReqHelpersStorage {
        mapping(uint8 => address) _tokens;
        mapping(uint8 => uint8) _tokenDecimals;
    }

    // keccak256(abi.encode(uint256(keccak256("atomic-lock-mint.ReqHelpers")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ReqHelpersStorageLocation = 0xd6c54e2ae807cd214b40b716718abbdcf0be862340bc50cb8180c058254f4b00;

    function _getReqHelpersStorage() private pure returns (ReqHelpersStorage storage $) {
        assembly {
            $.slot := ReqHelpersStorageLocation
        }
    }

    function tokenForIndex(uint8 tokenIndex) external view returns (address) {
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        return $._tokens[tokenIndex];
    }

    event TokenAdded(uint8 tokenIndex, address tokenAddr);
    event TokenRemoved(uint8 tokenIndex, address tokenAddr);

    function _addToken(uint8 tokenIndex, address tokenAddr) internal {
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        require($._tokens[tokenIndex] == address(0), "Token index occupied");
        require(tokenIndex > 0, "Token index cannot be zero");
        require(tokenAddr != address(0), "Token address cannot be zero");

        uint8 decimals = tokenAddr == address(1) ? 18 : IERC20Metadata(tokenAddr).decimals();
        if (decimals == 6) {
            require(tokenIndex < 64, "Token with decimals 6 should have index 1-63");
        } else if (decimals == 18) {
            require(tokenIndex >= 64 && tokenIndex < 192, "Token with decimals 18 should have index 64-191");
        } else {
            require(tokenIndex >= 192, "Token with decimals other than 6 or 18 should have index 192-255");
            $._tokenDecimals[tokenIndex] = decimals;
        }
        $._tokens[tokenIndex] = tokenAddr;

        emit TokenAdded(tokenIndex, tokenAddr);
    }

    function _removeToken(uint8 tokenIndex) internal {
        require(tokenIndex > 0, "Token index cannot be zero");
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        address tokenAddr = $._tokens[tokenIndex];
        require(tokenAddr != address(0), "No token for this tokenIndex");
        delete $._tokens[tokenIndex];
        if (tokenIndex >= 192) {
            delete $._tokenDecimals[tokenIndex];
        }

        emit TokenRemoved(tokenIndex, tokenAddr);
    }

    function getSupportedTokens() external view
        returns (address[] memory supportedTokens, uint8[] memory indexes, uint8[] memory decimals)
    {
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        uint8 i;
        uint8 num = 0;
        for (i = 0; i < 255; i++) {
            if ($._tokens[i+1] != address(0)) {
                num++;
            }
        }
        supportedTokens = new address[](num);
        indexes = new uint8[](num);
        decimals = new uint8[](num);
        uint8 j = 0;
        for (i = 0; i < 255; i++) {
            if ($._tokens[i+1] != address(0)) {
                supportedTokens[j] = $._tokens[i+1];
                indexes[j] = i+1;
                if (i+1 < 64) {
                    decimals[j] = 6;
                } else if (i+1 < 192) {
                    decimals[j] = 18;
                } else {
                    decimals[j] = $._tokenDecimals[i+1];
                }
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
            require(createdTime > block.timestamp - PROPOSE_PERIOD, "createdTime too early");
            require(createdTime < block.timestamp + 1 minutes, "createdTime too late");
        }
    }

    // action:
    //   0x01: lock-mint
    //   0x02: burn-unlock
    //   0x11: lock-mint (lock & mint to vault)
    //   0x12: burn-unlock (unlock from vault)
    function _actionFrom(bytes32 reqId) internal pure returns (uint8 action) {
        action = uint8(uint256(reqId) >> 200);
    }

    function _tokenFrom(bytes32 reqId) internal view returns (address tokenAddr) {
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        uint8 tokenIndex = uint8(uint256(reqId) >> 192);
        tokenAddr = $._tokens[tokenIndex];
        require(tokenAddr != address(0), "Invalid tokenIndex");
    }

    function _amountFrom(bytes32 reqId) internal view returns (uint256 amount) {
        amount = (uint256(reqId) >> 128) & 0xFFFFFFFFFFFFFFFF;
        require(amount > 0, "Amount must be greater than zero");
        uint8 tokenIndex = uint8(uint256(reqId) >> 192);
        if (tokenIndex >= 192) {
            ReqHelpersStorage storage $ = _getReqHelpersStorage();
            uint8 decimals = $._tokenDecimals[tokenIndex];
            if (decimals > 6) {
                amount *= 10 ** (decimals - 6);
            } else {
                amount /= 10 ** (6 - decimals);
            }
        } else if (tokenIndex >= 64) {
            amount *= 1e12;
        }
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
