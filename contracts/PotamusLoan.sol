// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoanAccount.sol";
import "./LoanPool.sol";

import "./IERC20.sol";

contract PotamusLoan {
    struct SearchableLoanAccount {
        bool isExist;
        address loanAccountAddress; //Address of LoanAccount
    }

    struct SearchableLoanPool {
        bool isExist;
        address loanPoolAddress; //Address of LoanPool
    }

    uint256 public reserve;
    //UserAccount Address => Address of LoanAccount
    mapping(address => SearchableLoanAccount) public loanAccountMap;
    //Token Address => Address of LoanPool
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
            _amount <
                LoanPool(loanPoolMap[_token].loanPoolAddress).availableFund(),
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
                LoanAccount(loanAccountMap[_userAddress].loanAccountAddress)
                    .tokenBalance(_token),
            "Pool of this token doesn't have sufficient available fund for this operation"
        );
        _;
    }

    function deposit(address _token, uint256 _amount) public {
        //Require checks
        require(
            IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
            "User approved amount is insufficient"
        );
        //TODO: There are a lot of requirement check missing here

        //Creating LoanPool or Loan Account if they don't exist yet
        if (!loanPoolMap[_token].isExist) {
            loanPoolMap[_token] = SearchableLoanPool(
                true,
                address(new LoanPool(_token))
            );
        }
        if (!loanAccountMap[msg.sender].isExist) {
            loanAccountMap[msg.sender] = SearchableLoanAccount(
                true,
                address(new LoanAccount(msg.sender))
            );
        }
        LoanPool loanPool = LoanPool(loanPoolMap[_token].loanPoolAddress);
        LoanAccount loanAccount = LoanAccount(
            loanAccountMap[msg.sender].loanAccountAddress
        );

        //Transferring money from user account to loan pool account
        require(
            IERC20(_token).transferFrom(msg.sender, address(loanPool), _amount),
            "Transfer of token failed"
        );

        //Update Loan Pool
        loanPool.deposit(_amount);
        loanPool.addLoanAccount(address(loanAccount));

        //Update Loan Account
        loanAccount.deposit(
            _token,
            int256(_amount),
            loanPool.fSecondInterestRate()
        );
    }

    function withdraw(address _token, uint256 _amount)
        public
        onlyAccountExist(msg.sender)
        onlyPoolExist(_token)
        onlyAccountSufficientFund(msg.sender, _token, _amount)
        onlyPoolSufficientFund(_token, _amount)
    {
        //TODO: Some other requirements
        //TODO: Need to check from Oracle how much you can withdraw
        LoanPool loanPool = LoanPool(loanPoolMap[_token].loanPoolAddress);
        LoanAccount loanAccount = LoanAccount(
            loanAccountMap[msg.sender].loanAccountAddress
        );
        //Do the actual fund transfer to Pool, this is done within the pool since the pool own that fund
        loanPool.withdraw(msg.sender, _amount);
        loanAccount.withdraw(_token, int256(_amount));

        //If user withdraw all, remove LoanAccount from corresponding pool's watch list
        if (!loanAccount.hasDepositOrLoan(_token)) {
            loanPool.removeLoanAccount(address(loanAccount));
        }
    }

    function loan(address _token, uint256 _amount)
        public
        onlyAccountExist(msg.sender)
        onlyPoolExist(_token)
        onlyPoolSufficientFund(_token, _amount)
    {
        LoanPool loanPool = LoanPool(loanPoolMap[_token].loanPoolAddress);
        LoanAccount loanAccount = LoanAccount(
            loanAccountMap[msg.sender].loanAccountAddress
        );

        //TODO: Some other requirements

        //Do the actual fund transfer to Pool
        loanPool.loan(msg.sender, _amount);

        loanAccount.loan(
            _token,
            int256(_amount),
            loanPool.fSecondInterestRate() //Get the most udpated interest rate
        );

        //Add the loan account into loan pool watch list
        loanPool.addLoanAccount(address(loanAccount));
    }

    function payback(address _token, uint256 _amount)
        public
        onlyAccountExist(msg.sender)
        onlyPoolExist(_token)
    {
        //TODO: Some other requirement here, like it should fail if the user
        //overpay for what they owe

        LoanPool loanPool = LoanPool(loanPoolMap[_token].loanPoolAddress);
        LoanAccount loanAccount = LoanAccount(
            loanAccountMap[msg.sender].loanAccountAddress
        );

        //Transferring money from user account to loan pool account
        require(
            IERC20(_token).transferFrom(msg.sender, address(loanPool), _amount),
            "Transfer of token failed"
        );

        //Update Loan Pool
        loanPool.payback(_amount);

        //Update Loan Account
        loanAccount.payback(_token, int256(_amount));

        //If user paid back all, remove LoanAccount from corresponding pool
        if (!loanAccount.hasDepositOrLoan(_token)) {
            loanPool.removeLoanAccount(address(loanAccount));
        }
    }
}
