// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./Constants.sol";
import "./SigVerifier.sol";

abstract contract ReqHelpers is Constants, SigVerifier {
    struct ReqHelpersStorage {
        mapping(uint8 => address) _tokens;
        mapping(uint8 => uint8) _tokenDecimals;
    }

    // keccak256(abi.encode(uint256(keccak256("FreeTunnel.ReqHelpers")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ReqHelpersStorageLocation = 0x057585c5bab557d050e69d0aa3d9dc85384bd232fd51374129020b8431577400;

    error ETunnelOnLockMode();
    error ETunnelOnMintMode();
    error EHubNotMintSide();
    error EHubNotMintOppositeSide();

    error ETokenIndexExisted();
    error ETokenIndexNotExisted();
    error ETokenIndexZero();
    error ETokenIndexRange();
    error ETokenAddressZero();

    error EInvalidReqId();
    error EInvalidAction();
    error EInvalidProposer();
    error EInvalidRecipient();

    error ECreatedTimeTooEarly();
    error ECreatedTimeTooLate();
    error EAmountZero();

    error EVaultNotActivated();
    error ETransferFailed();
    error EMintFailed();
    error EBurnFailed();
    error ENotExpiredToCancel();

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
        require($._tokens[tokenIndex] == address(0), ETokenIndexExisted());
        require(tokenIndex > 0, ETokenIndexZero());
        require(tokenAddr != address(0), ETokenAddressZero());

        uint8 decimals = tokenAddr == address(1) ? 18 : IERC20Metadata(tokenAddr).decimals();
        $._tokens[tokenIndex] = tokenAddr;
        $._tokenDecimals[tokenIndex] = decimals;

        emit TokenAdded(tokenIndex, tokenAddr);
    }

    function _removeToken(uint8 tokenIndex) internal {
        require(tokenIndex > 0, ETokenIndexZero());
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        address tokenAddr = $._tokens[tokenIndex];
        require(tokenAddr != address(0), ETokenIndexNotExisted());
        delete $._tokens[tokenIndex];
        delete $._tokenDecimals[tokenIndex];

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
                decimals[j] = $._tokenDecimals[i+1];
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
            require(createdTime > block.timestamp - PROPOSE_PERIOD, ECreatedTimeTooEarly());
            require(createdTime < block.timestamp + 1 minutes, ECreatedTimeTooLate());
        }
    }

    // action:
    //   0x01: lock-mint
    //   0x02: burn-unlock
    //   0x03: burn-mint
    //   0x11: lock-mint (lock & mint to vault)
    //   0x12: burn-unlock (unlock from vault)
    //   0x13: burn-mint (mint to vault)
    function _actionFrom(bytes32 reqId) internal pure returns (uint8 action) {
        action = uint8(uint256(reqId) >> 200);
    }

    function _tokenFrom(bytes32 reqId) internal view returns (address tokenAddr) {
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        uint8 tokenIndex = uint8(uint256(reqId) >> 192);
        tokenAddr = $._tokens[tokenIndex];
        require(tokenAddr != address(0), ETokenIndexNotExisted());
    }

    function _amountFrom(bytes32 reqId) internal view returns (uint256 amount) {
        amount = (uint256(reqId) >> 128) & 0xFFFFFFFFFFFFFFFF;
        require(amount > 0, EAmountZero());
        uint8 tokenIndex = uint8(uint256(reqId) >> 192);
        ReqHelpersStorage storage $ = _getReqHelpersStorage();
        uint8 decimals = $._tokenDecimals[tokenIndex];
        if (decimals > 6) {
            amount *= 10 ** (decimals - 6);
        } else {
            amount /= 10 ** (6 - decimals);
        }
    }

    function _digestFromReqSigningMessage(bytes32 reqId) internal view returns (bytes32) {
        uint8 specificAction = _actionFrom(reqId) & 0x0f;
        if (specificAction == 1) {
            return __digestFromMessage(abi.encodePacked(
                "[", getTunnelName(), "]\n",
                "Sign to execute a lock-mint:\n", Strings.toHexString(uint256(reqId), 32)
            ));
        } else if (specificAction == 2) {
            return __digestFromMessage(abi.encodePacked(
                "[", getTunnelName(), "]\n",
                "Sign to execute a burn-unlock:\n", Strings.toHexString(uint256(reqId), 32)
            ));
        } else if (specificAction == 3) {
            return __digestFromMessage(abi.encodePacked(
                "[", getTunnelName(), "]\n",
                "Sign to execute a burn-mint:\n", Strings.toHexString(uint256(reqId), 32)
            ));
        }
        return 0x0;
    }

    modifier isLockMode() {
        require(IS_LOCK_MODE, ETunnelOnLockMode());
        _;
    }

    modifier isMintMode() {
        require(!IS_LOCK_MODE, ETunnelOnMintMode());
        _;
    }

    modifier hubIsMintOppositeSideOf(bytes32 reqId) {
        require(HUB_ID == uint8(uint256(reqId) >> 120), EHubNotMintOppositeSide());
        _;
    }

    modifier hubIsMintSideOf(bytes32 reqId) {
        require(HUB_ID == uint8(uint256(reqId) >> 112), EHubNotMintSide());
        _;
    }
}
