// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ABDKMathQuad.sol";

contract LoanAccount {
    struct Balance {
        address tokenAddress;
        int256 balance;
        uint256 fsecondInterestRate; //interest rate per second
        bool isExist;
        uint256 lastInterestRateUpdated;
    }

    address userAddress;
    //Token Address => Balance
    mapping(address => Balance) balanceMap;

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
            balance.balance = getNewBalance(
                balance.balance,
                balance.fsecondInterestRate, //calculate with the old interest rate
                currentTime - balance.lastInterestRateUpdated
            );
            balance.lastInterestRateUpdated = currentTime;
            balance.fsecondInterestRate = _fSecondInterestRate;
        }
    }

    function getNewBalance(
        int256 _oldBalance,
        uint256 _fRatePerSecond,
        uint256 _secondInterval
    ) private pure returns (int256) {
        //TODO: We have the below ugly implementation cos ABDKMathQuad doesn't have
        //function to calculate x^n given x and n
        //ABDKMath64x64 has support for that, but I used ABDKMathQuad in LoanPool so just
        //wanna keep the same library. We should do gas optimization here if possible by changing
        //library.
        //The math trick used below: (1+rate)^(interval) = 2^(interval.log_2(1+rate))
        return
            ABDKMathQuad.toInt(
                ABDKMathQuad.mul(
                    ABDKMathQuad.fromInt(_oldBalance),
                    ABDKMathQuad.pow_2(
                        ABDKMathQuad.mul(
                            //interval
                            ABDKMathQuad.fromUInt(_secondInterval),
                            //log_2^(1+rate)
                            ABDKMathQuad.log_2(
                                ABDKMathQuad.add(
                                    ABDKMathQuad.fromUInt(1),
                                    ABDKMathQuad.div(
                                        ABDKMathQuad.fromUInt(_fRatePerSecond),
                                        ABDKMathQuad.fromUInt(10**18)
                                    )
                                )
                            )
                        )
                    )
                )
            );
    }

    function deposit(
        address _token,
        int128 _amount,
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
    }
}
