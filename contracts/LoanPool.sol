// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./ABDKMathQuad.sol";

//LoanPool is the one holding the actual money
contract LoanPool {
    //TODO: Fixed interest rate function for now
    //can extends to account for different interest rate function
    //with different kink value and slopes
    //TODO: Right now all floating point are hard coded with 18 decimal place after the dot
    //The float-like variable representing ratios will be marked as fCamelCase
    //So if you see 0.2 * 10 ** 18 (0.2x10^18, this represents 0.2)
    //Can consider to use external libraries or something to be more readable
    //Oh also, It's compounded secondly

    //Note that all these rate are per anual basis
    uint256 constant fFIRST_INTEREST_RATE = 0.2 * 10**18;
    uint256 constant fSECOND_INTEREST_RATE = 2.0 * 10**18;
    uint256 constant fCRITICAL_UTIL_RATE = 0.8 * 10**18;

    address public tokenAddress;
    uint256 public depositBalance = 0;
    uint256 public loanBalance = 0;
    uint256 public fSecondInterestRate = 0;

    //The combination of both of these will give a data structure
    //Operation     Time complexity
    //Contains            O(1)
    //Insert              O(1)
    //Delete              O(1)
    //List                O(k) with k >= n
    struct ListableAccountMap {
        LoanAccount[] accountList;
        //User address to corresponding bool
        mapping(address => bool) boolMap;
    }

    ListableAccountMap accountMap;

    constructor(address _token) {
        tokenAddress = _token;
    }

    function isContain(LoanAccount _loanAccount) public view returns (bool) {
        return accountMap.boolMap[_loanAccount.userAddress()];
    }

    function addLoanAccount(LoanAccount _loanAccount) public {
        if (!this.isContain(_loanAccount)) {
            accountMap.accountList.push(_loanAccount);
            accountMap.boolMap[_loanAccount.userAddress()] = true;
        }
    }

    function removeLoanAccount(LoanAccount _loanAccount) public {
        if (this.isContain(_loanAccount)) {
            accountMap.boolMap[_loanAccount.userAddress()] = false;
        }
    }

    function availableFund() public view returns (uint256) {
        return depositBalance - loanBalance;
    }

    //TODO: remember to trigger recalculation for both deposit and loan function
    function deposit(uint256 _amount) public {
        depositBalance += _amount;
        updateAccountListBalance();
    }

    function withdraw(uint256 _amount) public {
        depositBalance -= _amount;
        updateAccountListBalance();
    }

    //Have check to make sure the amount loan out doesn't cause more loan amount than deposit
    function loan(uint256 _amount) public {
        loanBalance += _amount;
        updateAccountListBalance();
    }

    function payback(uint256 _amount) public {
        loanBalance -= _amount;
        updateAccountListBalance();
    }

    function updateAccountListBalance() private {
        fSecondInterestRate = getAnnualInterestRate() / (365 * 1 days);
        for (uint256 i = 0; i < accountMap.accountList.length; i++) {
            LoanAccount loanAccount = accountMap.accountList[i];
            if (accountMap.boolMap[loanAccount.userAddress()]) {
                loanAccount.recalculateBalance(
                    tokenAddress,
                    fSecondInterestRate
                );
            }
        }
    }

    //TODO: Write test for this function
    function getAnnualInterestRate()
        public
        view
        returns (uint256 fInterestRate)
    {
        uint256 fUtilRate = (10**18 * loanBalance) / depositBalance;

        if (fUtilRate < fCRITICAL_UTIL_RATE) {
            return
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(fUtilRate),
                            ABDKMathQuad.fromUInt(fCRITICAL_UTIL_RATE)
                        ),
                        ABDKMathQuad.fromUInt(fFIRST_INTEREST_RATE)
                    )
                );
        } else if (fUtilRate >= fCRITICAL_UTIL_RATE) {
            return
                fFIRST_INTEREST_RATE +
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(
                                fUtilRate - fCRITICAL_UTIL_RATE
                            ),
                            ABDKMathQuad.fromUInt(
                                1 * 10**18 - fCRITICAL_UTIL_RATE
                            )
                        ),
                        ABDKMathQuad.fromUInt(
                            fSECOND_INTEREST_RATE - fFIRST_INTEREST_RATE
                        )
                    )
                );
        }
    }
}
