// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//TODO: Fixed interest rate function for now
//can extends to account for different interest rate function
//with different kink value and slopes 

contract LoanPool {
    address tokenAddress;
    uint256 depositBalance = 0;
    uint256 loanBalance = 0;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function deposit () public {
        
    }

    function loan () public {
        
    }

    function getInterestRate() view public {

    }
}