// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IWERC20 is IERC20, IERC20Metadata {
    /** @dev Creates `amount` tokens and assigns them to an `account`,
     * increasing the total supply.
     *
     * See {ERC20-_mint}.
     */
    function mintTo(address account, uint256 amount) external returns (bool);

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn}.
     */
    function burnFrom(address account, uint256 amount) external returns (bool);
}
