// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract LoanAccount {
    address userAddress;
    mapping (address => uint256) depositMap;
    mapping (address => uint256) loanMap;
    
    //TODO: maybe should make sure that only the main PotamusLoan contract
    //is able to call this function instead of everyone
    constructor(address _userAddress) {
        userAddress = _userAddress;
    }
    
    function deposit (address _token) public {
    }

    function withdraw (address _token) public {
    }

    function loan (uint256 _token) public {
    }

    function payback (uint256 _token) public {
        
    }

    //when the account is at critical value
    //will liquidate the entire deposit, return the left-over
    function liquidate () public {

    }
}
