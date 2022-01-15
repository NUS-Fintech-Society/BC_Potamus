import { useEffect, useState } from "react"
import { useEthers, useContractFunction } from "@usedapp/core"
import { constants, utils } from "ethers"
import { Functionality } from "../constants/enums"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import ERC20 from "../chain-info/contracts/IERC20.json"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/deployments/map.json"

export const useStakeTokens = (tokenAddress: string, functionality: Functionality.Deposit | Functionality.Payback) => {
    // address
    // abi
    // chainId
    const { chainId } = useEthers()
    const { abi } = PotamusLoan
    const potamusLoanAddress = chainId ? networkMapping[String(chainId)]["PotamusLoan"][0] : constants.AddressZero
    const potamusLoanInterface = new utils.Interface(abi)
    const potamusLoanContract = new Contract(potamusLoanAddress, potamusLoanInterface)

    const erc20ABI = ERC20.abi
    const erc20Interface = new utils.Interface(erc20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)
    // approve hooks (basically just a way for you to call the contract)
    // ERC20.approve()
    const { send: approveErc20Send, state: approveAndStakeErc20State } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 transfer",
        })
    // send hooks
    const { send: stakeSend, state: stakeState } =
        useContractFunction(potamusLoanContract, functionality.toString(), {
            transactionName: "Stake Tokens",
        })

    //Function for the hooks user to call
    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveErc20Send(potamusLoanAddress, amount)
    }

    //useState to trigger useEffect
    const [amountToStake, setAmountToStake] = useState("0")

    //useEffect
    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            stakeSend(tokenAddress, amountToStake)
        }
    }, [approveAndStakeErc20State, amountToStake, tokenAddress, stakeSend])

    //useState to trigger useEffect
    //state for the hook user to call
    const [state, setState] = useState(approveAndStakeErc20State)

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveAndStakeErc20State)
        }
    }, [approveAndStakeErc20State, stakeState])

    return { approveAndStake, state }
}
