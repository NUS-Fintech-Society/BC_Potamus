// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ABDKMathQuad.sol";

//TODO: Make another library called PotamusRequirement
//to house all the requirements as function
library PotamusUtils {
    uint256 public constant FLOAT_DECIMALS = 18;

    function depositDBLB(int256 _balance, int256 _amount)
        public
        pure
        returns (int256 _DBAdjustment, int256 _LBAdjustment)
    {
        require(_amount >= 0, "Amount mustn't be negative");
        if (_balance < 0) {
            if (_amount < -_balance) {
                return (0, -_amount);
            } else {
                return (_amount + _balance, _balance);
            }
        } else {
            return (_amount, 0);
        }
    }

    function loanDBLB(int256 _balance, int256 _amount)
        public
        pure
        returns (int256 _DBAdjustment, int256 _LBAdjustment)
    {
        require(_amount >= 0, "Amount mustn't be negative");
        if (_balance > 0) {
            if (_amount < _balance) {
                return (-_amount, 0);
            } else {
                return (-_balance, _amount - _balance);
            }
        } else {
            return (0, _amount);
        }
    }

    //Calculate new balance with interest rate compounded per sec
    function getNewBalance(
        int256 _oldBalance,
        uint256 _fRatePerSecond,
        uint256 _secondInterval
    ) public pure returns (int256) {
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

    //Convert annually compounded interest into equivalent secondly compounded rate
    function getEquivalentSecRate(uint256 _annualRate)
        public
        pure
        returns (uint256)
    {
        return
            ABDKMathQuad.toUInt(
                ABDKMathQuad.mul(
                    ABDKMathQuad.sub(
                        ABDKMathQuad.pow_2(
                            ABDKMathQuad.div(
                                ABDKMathQuad.log_2(
                                    ABDKMathQuad.add(
                                        ABDKMathQuad.div(
                                            ABDKMathQuad.fromUInt(_annualRate),
                                            ABDKMathQuad.fromUInt(
                                                1 * 10**FLOAT_DECIMALS
                                            )
                                        ),
                                        ABDKMathQuad.fromUInt(1)
                                    )
                                ),
                                ABDKMathQuad.fromUInt(365 * 1 days)
                            )
                        ),
                        ABDKMathQuad.fromUInt(1)
                    ),
                    ABDKMathQuad.fromUInt(1 * 10**FLOAT_DECIMALS)
                )
            );
    }

    //TODO: Write test for this function
    function getAnnualInterestRate(
        uint256 _loanBalance,
        uint256 _depositBalance,
        uint256 _fCRITICAL_UTIL_RATE,
        uint256 _fFIRST_ANNUAL_INTEREST_RATE,
        uint256 _fSECOND_ANNUAL_INTEREST_RATE
    ) public pure returns (uint256 fInterestRate) {
        uint256 fUtilRate = (10**FLOAT_DECIMALS * _loanBalance) /
            _depositBalance;

        if (fUtilRate < _fCRITICAL_UTIL_RATE) {
            return
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(fUtilRate),
                            ABDKMathQuad.fromUInt(_fCRITICAL_UTIL_RATE)
                        ),
                        ABDKMathQuad.fromUInt(_fFIRST_ANNUAL_INTEREST_RATE)
                    )
                );
        } else if (fUtilRate >= _fCRITICAL_UTIL_RATE) {
            return
                _fFIRST_ANNUAL_INTEREST_RATE +
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(
                                fUtilRate - _fCRITICAL_UTIL_RATE
                            ),
                            ABDKMathQuad.fromUInt(
                                1 * 10**FLOAT_DECIMALS - _fCRITICAL_UTIL_RATE
                            )
                        ),
                        ABDKMathQuad.fromUInt(
                            _fSECOND_ANNUAL_INTEREST_RATE -
                                _fFIRST_ANNUAL_INTEREST_RATE
                        )
                    )
                );
        }
    }
}
