// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/IWERC20.sol";

contract wSMRXToken is IWERC20, ERC20, Ownable {
    constructor() ERC20("Samsara", "SMRX") Ownable() {}

    function mintTo(address account, uint256 amount) external onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    function burnFrom(address account, uint256 amount) external onlyOwner returns (bool) {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
        return true;
    }
}
