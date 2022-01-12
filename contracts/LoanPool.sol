// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./ABDKMathQuad.sol";

import "./IERC20.sol";

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
    uint256 constant FLOAT_DECIMALS = 18;
    uint256 constant fFIRST_ANNUAL_INTEREST_RATE = 0.2 * 10**FlOAT_DECIMALS;
    uint256 constant fSECOND_ANNUAL_INTEREST_RATE = 2.0 * 10**FlOAT_DECIMALS;
    uint256 constant fCRITICAL_UTIL_RATE = 0.8 * 10**FlOAT_DECIMALS;

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
        address[] loanAccountAddressList;
        //LoanAccount address to corresponding bool
        mapping(address => bool) boolMap;
    }

    ListableAccountMap accountMap;

    constructor(address _token) {
        tokenAddress = _token;
    }

    function isContain(address _loanAccountAddress) public view returns (bool) {
        return accountMap.boolMap[_loanAccountAddress];
    }

    function addLoanAccount(address _loanAccountAddress) public {
        if (!this.isContain(_loanAccountAddress)) {
            accountMap.loanAccountAddressList.push(_loanAccountAddress);
            accountMap.boolMap[_loanAccountAddress] = true;
        }
    }

    function removeLoanAccount(address _loanAccountAddress) public {
        if (this.isContain(_loanAccountAddress)) {
            accountMap.boolMap[_loanAccountAddress] = false;
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

    //Returns if this money transfer is successful
    modifier onlyMoneyOut(address _userAddress, uint256 _amount) {
        //Make sure that the pool has sufficient ERC20
        require(
            IERC20(tokenAddress).balanceOf(address(this)) >= _amount,
            "Pool has insufficient fund"
        );
        require(availableFund() >= _amount, "Pool has insufficient fund");
        //Make the transfer
        require(
            IERC20(tokenAddress).transfer(_userAddress, _amount),
            "Transfer of token failed"
        );
        _;
    }

    function withdraw(address _userAddress, uint256 _amount)
        public
        onlyMoneyOut(_userAddress, _amount)
    {
        //If transfer is succesful, update the pool balance
        depositBalance -= _amount;
        updateAccountListBalance();
    }

    //Have check to make sure the amount loan out doesn't cause more loan amount than deposit
    function loan(address _userAddress, uint256 _amount)
        public
        onlyMoneyOut(_userAddress, _amount)
    {
        //If transfer is succesful, update the pool balance
        loanBalance += _amount;
        updateAccountListBalance();
    }

    function payback(uint256 _amount) public {
        loanBalance -= _amount;
        updateAccountListBalance();
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
    function getAnnualInterestRate()
        public
        view
        returns (uint256 fInterestRate)
    {
        uint256 fUtilRate = (10**FLOAT_DECIMALS * loanBalance) / depositBalance;

        if (fUtilRate < fCRITICAL_UTIL_RATE) {
            return
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(fUtilRate),
                            ABDKMathQuad.fromUInt(fCRITICAL_UTIL_RATE)
                        ),
                        ABDKMathQuad.fromUInt(fFIRST_ANNUAL_INTEREST_RATE)
                    )
                );
        } else if (fUtilRate >= fCRITICAL_UTIL_RATE) {
            return
                fFIRST_ANNUAL_INTEREST_RATE +
                ABDKMathQuad.toUInt(
                    ABDKMathQuad.mul(
                        ABDKMathQuad.div(
                            ABDKMathQuad.fromUInt(
                                fUtilRate - fCRITICAL_UTIL_RATE
                            ),
                            ABDKMathQuad.fromUInt(
                                1 * 10**FLOAT_DECIMALS - fCRITICAL_UTIL_RATE
                            )
                        ),
                        ABDKMathQuad.fromUInt(
                            fSECOND_ANNUAL_INTEREST_RATE - fFIRST_ANNUAL_INTEREST_RATE
                        )
                    )
                );
        }
    }
}
