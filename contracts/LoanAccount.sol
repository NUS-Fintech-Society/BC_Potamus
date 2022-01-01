// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract LoanAccount {
    address userAddress;
    mapping (address => unint256) depositMap;
    mapping (address => unint256) loanMap;
    
    //TODO: maybe should make sure that only the main PotamusLoan contract
    //is able to call this function instead of everyone
    constructor(address _userAddress) {
        userAddress = _userAddress;
    }
    
    function deposit (address _token) {
    }

    function withdraw (address _token) {
    }

    function loan (uint256 _token) {

    }

    function payback (uint256 _token) {
        
    }
}
