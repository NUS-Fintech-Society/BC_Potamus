from brownie import (
    network,
    accounts,
    config,
    interface
)

NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["hardhat", "development", "ganache"]
LOCAL_BLOCKCHAIN_ENVIRONMENTS = NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONMENTS + [
    "mainnet-fork",
    "binance-fork",
    "matic-fork",
]

def deposit_token(token_name, potamus_loan, account, amount):
    token_address = config["networks"][network.show_active()][token_name]

    token = interface.IERC20Metadata(token_address)

    decimals = token.decimals()
    
    tx = token.approve(potamus_loan.address, (amount * 1.1) * 10 ** decimals, {"from": account})
    tx.wait(1)

    tx = potamus_loan.deposit(
        token_address,
        amount * 10 ** decimals,
        {"from": account},
    )
    tx.wait(1)

def get_account(index=None, id=None):
    if index:
        return accounts[index]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    if id:
        return accounts.load(id)
    return accounts.add(config["wallets"]["from_key"])