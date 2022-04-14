// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./wSMRXToken.sol";
import "./utils/Bridge.sol";

contract wSMRXBridge is Bridge {
    wSMRXToken public token;

    constructor(address tokenAddress, uint256 tax) Bridge(tax) {
        token = wSMRXToken(tokenAddress);
    }

    function renounceTokenOwnership() public onlyOwner {
        token.transferOwnership(owner());
    }

    function _deposit(uint256 amount) internal override {
        token.burnFrom(_msgSender(), amount);
    }

    function _withdraw(address account, uint256 amount) internal override {
        token.mintTo(account, amount);
    }
}
