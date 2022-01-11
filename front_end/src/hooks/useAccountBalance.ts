import { useContractCall, useContractCalls, useEthers, ContractCall } from "@usedapp/core"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import { utils, BigNumber, constants } from "ethers"
import { formatUnits } from "@ethersproject/units"
import { TokenBalance } from "../components/TokenBalanceCard"


export const useAccountBalance = (userAddress: string, potamusLoanAddress: string): Array<TokenBalance> => {
    //Load up Potamus Loan Interface
    const potamusLoanABI = PotamusLoan.abi
    const potamusLoanInterface = new utils.Interface(potamusLoanABI)

    const [tokenListLength] = useContractCall({ abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenListLength', args: [userAddress] }) ?? [BigNumber.from(0)]

    const indexArray: number[] = Array.from(Array(tokenListLength.toNumber()).keys())

    const calls: ContractCall[] = indexArray.map((index): ContractCall => { return { abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenAddressAndBalance', args: [userAddress, BigNumber.from(index)] } })

    const resultArray = useContractCalls(calls)

    const tokenBalanceArray = new Array<TokenBalance>()

    for (let i = 0; i < resultArray.length; i += 1) {
        let [address, balance, isExist] = resultArray[i] ?? [constants.AddressZero, BigNumber.from(0), false];
        let addr = address ?? constants.AddressZero
        let bal = balance ?? BigNumber.from(0);
        let exists = isExist ?? false;

        //TODO: still hardcode in number 18 here, need to fix this now
        if (addr !== constants.AddressZero && !bal.eq(BigNumber.from(0)) && exists) {

            tokenBalanceArray.push({ address: addr, balance: parseFloat(formatUnits(bal, 18)) })
        }
    }
    return tokenBalanceArray
}