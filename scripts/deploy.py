from scripts.helpful_scripts import get_account, deposit_token
from brownie import PotamusLoan, PotamusUtils
from web3 import Web3
import yaml
import json
import os
import shutil
import time


def deploy_token_farm_and_dapp_token(front_end_update=False):
    account = get_account()
    potamus_utils = PotamusUtils.deploy({"from": account})
    potamus_loan = PotamusLoan.deploy({"from": account})
    time.sleep(5)

    deposit_token("bat_token", potamus_loan, account, 15)
    deposit_token("comp_token", potamus_loan, account, 0.8)
    deposit_token("dai_token", potamus_loan, account, 14)
    deposit_token("usdc_token", potamus_loan, account, 100)

    if front_end_update:
        update_front_end()
    return potamus_utils, potamus_loan


def update_front_end():
    # Send the build folder
    copy_folders_to_front_end("./build", "./front_end/src/chain-info")

    # Sending the front end our config in JSON format
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
        with open("./front_end/src/brownie-config.json", "w") as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
    print("Front end updated!")


def copy_folders_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def main():
    deploy_token_farm_and_dapp_token(front_end_update=True)
