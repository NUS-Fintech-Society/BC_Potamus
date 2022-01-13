import { useContractCall, useContractCalls, ContractCall } from "@usedapp/core"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import { utils, BigNumber } from "ethers"
import { PoolInfo } from "../components/PoolCard"


export const usePoolInfo = (potamusLoanAddress: string): Array<PoolInfo> => {
    //Load up Potamus Loan Interface
    const potamusLoanABI = PotamusLoan.abi
    const potamusLoanInterface = new utils.Interface(potamusLoanABI)

    const [poolListLength] = useContractCall({ abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getNumPool', args: [] }) ?? [BigNumber.from(0)]

    const indexArray: number[] = Array.from(Array(poolListLength.toNumber()).keys())

    const calls: ContractCall[] = indexArray.map((index): ContractCall => { return { abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getPoolInfo', args: [BigNumber.from(index)] } })

    const resultArray = useContractCalls(calls)

    const poolArray = new Array<PoolInfo>()

    for (let i = 0; i < resultArray.length; i += 1) {
        let [tokenAddress, annualRate, rateDecimals, depositBalance, loanBalance] = resultArray[i] ?? [];
        if (tokenAddress && annualRate && rateDecimals && depositBalance && loanBalance) {
            poolArray.push({ tokenAddress: tokenAddress, rawAnnualRate: annualRate, rawRateDecimals: rateDecimals, rawDepositBalance: depositBalance, rawLoanBalance: loanBalance })
        }
    }
    return poolArray
}