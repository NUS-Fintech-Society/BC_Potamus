import { useContractFunction, useEthers } from "@usedapp/core"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import { utils, constants } from "ethers"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/deployments/map.json"
import { Functionality } from "../components/AmountButton"

/**
 * Expose { send, state } object to facilitate unstaking the user's tokens from the LoanPool contract
 */
export const useUnstakeTokens = (functionality: Functionality.Loan | Functionality.Withdraw) => {
    const { chainId } = useEthers()

    const { abi } = PotamusLoan
    const potamusLoanContractAddress = chainId ? networkMapping[String(chainId)]["PotamusLoan"][0] : constants.AddressZero
    const potamusLoanInterface = new utils.Interface(abi)

    const potamusLoanContract = new Contract(
        potamusLoanContractAddress,
        potamusLoanInterface
    )

    return useContractFunction(potamusLoanContract, functionality.toString(), {
        transactionName: "Unstake tokens",
    })
}
