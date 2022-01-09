import { useContractFunction, useEthers } from "@usedapp/core"
import PotamusLoan from "../chain-info/PotamusLoan.json"
import { utils, constants } from "ethers"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/map.json"

/**
 * Expose { send, state } object to facilitate unstaking the user's tokens from the TokenFarm contract
 */
export const useUnstakeTokens = () => {
  const { chainId } = useEthers()

  const { abi } = PotamusLoan
  const potamusLoanContractAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero

  const potamusLoanInterface = new utils.Interface(abi)

  const potamusLoanContract = new Contract(
    potamusLoanContractAddress,
    potamusLoanInterface
  )

  return useContractFunction(potamusLoanContract, "unstakeTokens", {
    transactionName: "Unstake tokens",
  })
}
