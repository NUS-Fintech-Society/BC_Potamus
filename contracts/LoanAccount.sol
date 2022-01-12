// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ABDKMathQuad.sol";
import "./PotamusUtils.sol";

contract LoanAccount {
    //If balance is so minute, i.e falls within -epsilon to epsilon
    //Set the balance to 0
    int256 constant EPSILON = 5;

    struct Balance {
        address tokenAddress;
        int256 balance;
        uint256 fsecondInterestRate; //interest rate per second
        bool isExist;
        uint256 lastInterestRateUpdated;
    }

    address public userAddress;
    //Token Address => Balance
    mapping(address => Balance) balanceMap;
    //Token Address List
    address[] tokenAddressList;

    function getTokenListLength() public view returns (uint256) {
        return tokenAddressList.length;
    }

    function getTokenBalanceInfo(address _userAddress, uint256 _index)
        public
        view
        returns (
            address _tokenAddress,
            int256 _balance,
            uint256 _secondRate,
            uint256 _secondRateDecimals,
            uint256 lastUpdated,
            bool _isExist
        )
    {
        address tokenAddress = tokenAddressList[_index];
        return (
            tokenAddress,
            balanceMap[tokenAddress].balance,
            balanceMap[tokenAddress].fsecondInterestRate,
            PotamusUtils.FLOAT_DECIMALS,
            balanceMap[tokenAddress].lastInterestRateUpdated,
            balanceMap[tokenAddress].isExist
        );
    }

    //TODO: maybe should make sure that only the main PotamusLoan contract
    //is able to call this function instead of everyone
    constructor(address _userAddress) {
        userAddress = _userAddress;
    }

    //Recalculate Deposit Balance and Loan Balance for that particular token
    function recalculateBalance(address _token, uint256 _fSecondInterestRate)
        public
    {
        Balance storage balance = balanceMap[_token];
        uint256 currentTime = block.timestamp;
        if (balance.isExist) {
            balance.balance = PotamusUtils.getNewBalance(
                balance.balance,
                balance.fsecondInterestRate, //calculate with the old interest rate
                currentTime - balance.lastInterestRateUpdated
            );
            balance.lastInterestRateUpdated = currentTime;
            balance.fsecondInterestRate = _fSecondInterestRate;
        }
    }

    function tokenBalance(address _token) public view returns (int256) {
        return balanceMap[_token].balance;
    }

    function deposit(
        address _token,
        int256 _amount,
        uint256 _fUpdatedSecondInterestRate
    ) public {
        require(_amount > 0, "Amount must be > 0");
        //Update the balance
        Balance storage balance = balanceMap[_token];
        if (balance.isExist) {
            balance.balance += _amount;
        } else {
            balanceMap[_token] = Balance(
                _token,
                _amount,
                _fUpdatedSecondInterestRate,
                true,
                block.timestamp
            );
            //Add the address token to list of token
            tokenAddressList.push(_token);
        }
    }

    function withdraw(address _token, int256 _amount) public {
        require(_amount > 0, "Amount must be > 0");
        //TODO: Oracle: Implement check on how much you can withdraw
        Balance storage balance = balanceMap[_token];
        require(balance.isExist, "Your Loan account doesn't have this coin");
        require(
            balance.balance > 0,
            "Your balance for this token is not positive"
        );
        require(
            _amount <= balance.balance,
            "You have insufficient balance for this token"
        );

        balance.balance -= _amount;

        //If balance almost zero, remove it
        removeBalanceIfZero(_token);
    }

    function loan(
        address _token,
        int256 _amount,
        uint256 _fUpdatedSecondInterestRate
    ) public {
        require(_amount > 0, "Amount must be > 0");
        //TODO: Oracle: Implement check on how much you can withdraw
        Balance storage balance = balanceMap[_token];
        if (balance.isExist) {
            balance.balance -= _amount;
        } else {
            balanceMap[_token] = Balance(
                _token,
                -_amount,
                _fUpdatedSecondInterestRate,
                true,
                block.timestamp
            );
            //Add the address token to list of token
            tokenAddressList.push(_token);
        }
    }

    function payback(address _token, int256 _amount) public {
        require(_amount > 0, "Amount must be > 0");
        Balance storage balance = balanceMap[_token];
        //TODO: Oracle: Implement check on how much you can withdraw
        require(balance.isExist, "Your Loan account doesn't have this coin");
        require(balance.balance < 0, "You don't owe any for this token");
        require(
            _amount <= -balance.balance,
            "You are overpaying for what you owe"
        );
        balance.balance += _amount;

        //If balance almost zero, remove it
        removeBalanceIfZero(_token);
    }

    function removeBalanceIfZero(address _token) private {
        Balance storage balance = balanceMap[_token];
        if (
            balance.isExist &&
            balance.balance < EPSILON &&
            balance.balance > -EPSILON
        ) {
            balance.balance = 0;
            balance.isExist = false;
        }
    }

    function hasDepositOrLoan(address _token) public view returns (bool) {
        //Return trues if the user deposit or loan in this token
        return balanceMap[_token].isExist;
    }
}
