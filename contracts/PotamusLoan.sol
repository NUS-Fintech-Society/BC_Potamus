// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./LoanPool.sol";

contract PotamusLoan {
    uint256 public reserve;
    LoanAccount[] public activeLoanAccountList;
    
    address[] public availablePool;
    LoanPool[] public loanPoolList;
}