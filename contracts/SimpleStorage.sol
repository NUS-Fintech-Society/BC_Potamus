// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0;

contract SimpleStorage {
    
    uint256 public favoriteNumber =  5;

    function store(uint256 _favoriteNumber) public {
        favoriteNumber = _favoriteNumber;
    }
}