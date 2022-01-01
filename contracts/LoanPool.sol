// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";

contract LoanPool {
    //TODO: Fixed interest rate function for now
    //can extends to account for different interest rate function
    //with different kink value and slopes
    //TODO: Right now all floating point are hard coded with 18 decimal place after the dot
    //The float-like variable representing ratios will be marked as _fCamelCase
    //So if you see 0.2 * 10 ** 18 (0.2x10^18, this represents 0.2)
    //Can consider to use external libraries or something to be more readable

    //Note that all these rate are per anual basis
    uint256 constant FIRST_INTEREST_RATE = 0.2 * 10**18;
    uint256 constant SECOND_INTEREST_RATE = 2.0 * 10**18;
    uint256 constant CRITICAL_UTIL_RATE = 0.8 * 10**18;

    address tokenAddress;
    uint256 depositBalance = 0;
    uint256 loanBalance = 0;
    LoanAccount[] loanAccountList; //List of Loan Account that has loan or deposit in this pool

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    //TODO: remember to trigger recalculation for both deposit and loan function
    function deposit(uint256 _deposit) public {
        depositBalance += _deposit;
    }

    //Have check to make sure the amount loan out doesn't cause more loan amount than deposit
    function loan(uint256 _loan) public {
        loanBalance += _loan;
    }

    //TODO: Write test for this function
    function getInterestRate() public view returns (uint256 _fInterestRate) {
        uint256 _fUtilRate = (10**18 * loanBalance) / depositBalance;

        if (_fUtilRate < _fCRITICAL_UTIL_RATE) {
            return
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(_fUtilRate),
                            ABDKMathQuad.fromUInt(_fCRITICAL_UTIL_RATE)
                        ),
                        ABDKMathQuad.fromUInt(_fFIRST_INTEREST_RATE)
                    )
                );
        } else if (_fUtilRate >= _fCRITICAL_UTIL_RATE) {
            return
                _fFIRST_INTEREST_RATE +
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(
                                _fUtilRate - _fCRITICAL_UTIL_RATE
                            ),
                            ABDKMathQuad.fromUInt(
                                1 * 10**18 - _fCRITICAL_UTIL_RATE
                            )
                        ),
                        ABDKMathQuad.fromUInt(
                            _fSECOND_INTEREST_RATE - _fFIRST_INTEREST_RATE
                        )
                    )
                );
        }
    }
}
