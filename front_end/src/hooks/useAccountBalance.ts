import { useContractCall, useContractCalls, ContractCall } from "@usedapp/core"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import { utils, BigNumber } from "ethers"
import { TokenBalance } from "../constants/types";

export const useAccountBalance = (userAddress: string, potamusLoanAddress: string): Array<TokenBalance> => {
    //Load up Potamus Loan Interface
    const potamusLoanABI = PotamusLoan.abi
    const potamusLoanInterface = new utils.Interface(potamusLoanABI)

    const [tokenListLength] = useContractCall({ abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenListLength', args: [userAddress] }) ?? [BigNumber.from(0)]

    const indexArray: number[] = Array.from(Array(tokenListLength.toNumber()).keys())

    const calls: ContractCall[] = indexArray.map((index): ContractCall => { return { abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenBalanceInfo', args: [userAddress, BigNumber.from(index)] } })

    const resultArray = useContractCalls(calls)

    const tokenBalanceArray = new Array<TokenBalance>()

    for (let i = 0; i < resultArray.length; i += 1) {
        let [tokenAddress, balance, secondRate, secondRateDecimals, lastUpdated, isExist] = resultArray[i] ?? [];
        if (tokenAddress && balance && secondRate && secondRateDecimals && lastUpdated && isExist) {
            tokenBalanceArray.push({ tokenAddress: tokenAddress, rawBalance: balance, rawRatePerSec: secondRate, rawRatePerSecDecimals: secondRateDecimals, lastUpdated: lastUpdated })
        }
    }
    return tokenBalanceArray
}