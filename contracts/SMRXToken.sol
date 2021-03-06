// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SMRXToken is ERC20 {
    constructor(uint256 supply) ERC20("Samsara", "SMRX") {
        _mint(_msgSender(), supply * (10**decimals()));
    }
}
