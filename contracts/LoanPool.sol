// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./ABDKMathQuad.sol";
import "./PotamusUtils.sol";

import "./IERC20.sol";

//LoanPool is the one holding the actual money
contract LoanPool {
    //TODO: Fixed interest rate function for now
    //can extends to account for different interest rate function
    //with different kink value and slopes
    //TODO: Right now all floating point are hard coded with `PotamusUtils.FLOAT_DECIMALS` decimal place after the dot
    //The float-like variable representing ratios will be marked as fCamelCase
    //So if you see 0.2 * 10 ** 18 (0.2x10^18, this represents 0.2)
    //Can consider to use external libraries or something to be more readable
    //Oh also, It's compounded secondly

    //Note that all these rate are per anual basis
    uint256 fFIRST_ANNUAL_INTEREST_RATE =
        (2 * 10**PotamusUtils.FLOAT_DECIMALS) / 10; //0.2
    uint256 fSECOND_ANNUAL_INTEREST_RATE =
        (20 * 10**PotamusUtils.FLOAT_DECIMALS) / 10; // 2
    uint256 fCRITICAL_UTIL_RATE = (8 * 10**PotamusUtils.FLOAT_DECIMALS) / 10; //0.8

    address public tokenAddress;
    uint256 public depositBalance = 0;
    uint256 public loanBalance = 0;
    uint256 public fSecondInterestRate = 0;
    uint256 public fAnnualInteretRate = 0;

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
    function deposit(
        int256 _depositBalanceAdjustment,
        int256 _loanBalanceAdjustment
    ) public {
        depositBalance = uint256(
            int256(depositBalance) + _depositBalanceAdjustment
        );
        loanBalance = uint256(int256(loanBalance) + _loanBalanceAdjustment);
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
    function loan(
        address _userAddress,
        uint256 _amount,
        int256 _depositBalanceAdjustment,
        int256 _loanBalanceAdjustment
    ) public onlyMoneyOut(_userAddress, _amount) {
        //If transfer is succesful, update the pool balance
        depositBalance = uint256(
            int256(depositBalance) + _depositBalanceAdjustment
        );
        loanBalance = uint256(int256(loanBalance) + _loanBalanceAdjustment);
        updateAccountListBalance();
    }

    function payback(uint256 _amount) public {
        loanBalance -= _amount;
        updateAccountListBalance();
    }

    function updateAccountListBalance() private {
        fAnnualInteretRate = PotamusUtils.getAnnualInterestRate(
            loanBalance,
            depositBalance,
            fCRITICAL_UTIL_RATE,
            fFIRST_ANNUAL_INTEREST_RATE,
            fSECOND_ANNUAL_INTEREST_RATE
        );
        fSecondInterestRate = PotamusUtils.getEquivalentSecRate(
            fAnnualInteretRate
        );
        for (uint256 i = 0; i < accountMap.loanAccountAddressList.length; i++) {
            address loanAccountAddress = accountMap.loanAccountAddressList[i];
            if (accountMap.boolMap[loanAccountAddress]) {
                LoanAccount(loanAccountAddress).recalculateBalance(
                    tokenAddress,
                    fSecondInterestRate
                );
            }
        }
    }
}
