// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./LoanPool.sol";

import "./IERC20.sol";

contract PotamusLoan {
    struct SearchableLoanAccount {
        bool isExist;
        LoanAccount loanAccount;
    }

    struct SearchableLoanPool {
        bool isExist;
        LoanPool loanPool;
    }

    uint256 public reserve;
    //UserAccount Address => LoanAccount
    mapping(address => SearchableLoanAccount) public loanAccountMap;
    //Token Address => LoanPool
    mapping(address => SearchableLoanPool) public loanPoolMap;

    modifier onlyPoolExist(address _token) {
        require(
            loanPoolMap[_token].isExist,
            "Pool of this token doesn't exist"
        );
        _;
    }

    modifier onlyAccountExist(address _userAddress) {
        require(
            loanAccountMap[_userAddress].isExist,
            "Account of this user doesn't exist in the system"
        );
        _;
    }

    modifier onlyPoolSufficientFund(address _token, uint256 _amount) {
        require(
            _amount < loanPoolMap[_token].loanPool.availableFund(),
            "Pool of this token doesn't have sufficient available fund for this operation"
        );
        _;
    }

    modifier onlyAccountSufficientFund(
        address _userAddress,
        address _token,
        uint256 _amount
    ) {
        require(
            //TODO: Come back at this ugly conversion again
            int256(_amount) <
                loanAccountMap[_userAddress].loanAccount.tokenBalance(_token),
            "Pool of this token doesn't have sufficient available fund for this operation"
        );
        _;
    }

    function deposit(address _token, uint256 _amount) public payable {
        //Require checks
        //TODO: There are a lot of requirement check missing here

        //Creating LoanPool or Loan Account if they don't exist yet
        if (!loanPoolMap[_token].isExist) {
            loanPoolMap[_token] = SearchableLoanPool(
                true,
                new LoanPool(_token)
            );
        }
        if (!loanAccountMap[msg.sender].isExist) {
            loanAccountMap[msg.sender] = SearchableLoanAccount(
                true,
                new LoanAccount(msg.sender)
            );
        }
        LoanPool loanPool = loanPoolMap[_token].loanPool;
        LoanAccount loanAccount = loanAccountMap[msg.sender].loanAccount;

        //Transferring money from user account to loan pool account
        IERC20(_token).transferFrom(
            msg.sender,
            address(loanPoolMap[_token].loanPool),
            _amount
        );

        //Update Loan Pool
        loanPool.deposit(_amount);
        loanPool.addLoanAccount(loanAccount);

        //Update Loan Account
        loanAccount.deposit(
            _token,
            int256(_amount),
            loanPoolMap[_token].loanPool.fSecondInterestRate()
        );
    }

    function withdraw(address _token, uint256 _amount)
        public
        onlyAccountExist(msg.sender)
        onlyPoolExist(_token)
        onlyAccountSufficientFund(msg.sender, _token, _amount)
        onlyPoolSufficientFund(_token, _amount)
    {
        //Must be in this order
        //Do the actual fund transfer to Pool
        //Update LoanPool (LoanPool will also call to update all related LoanAccount to the lastest state)
        //Update LoanAccount
        //TODO: Need to check from Oracle how much you can withdraw
    }

    function loan() public {}

    function payback() public {}
}
