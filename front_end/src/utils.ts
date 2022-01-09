import ERC20 from "../chain-info/contracts/MockERC20Detailed.json"
import { utils } from "ethers"
import { useContractCall } from "@usedapp/core"

export enum TokenInFunction {
    Deposit,
    Payback
}

export enum TokenOutFunction {
    Withdraw,
    Loan
}

export function getTokenDetails(tokenAddress: string): { symbol: string, imgSrc: string, decimals: number } {
    //Constructing the ierc token
    const erc20ABI = ERC20.abi
    const erc20Interface = new utils.Interface(erc20ABI)

    //Get back symbol, decimals of ERC20 Token
    const [symbol] = useContractCall({ abi: erc20Interface, address: tokenAddress, method: 'symbol', args: [] }) ?? []
    const [decimals] = useContractCall({ abi: erc20Interface, address: tokenAddress, method: 'decimals', args: [] }) ?? []

    //TODO: Right now token image is dummy image, maybe find away to get it from reliable sources
    let imgSrc = "../../dog.jpg"

    return { symbol, imgSrc, decimals }
}

//Accounting for decimals in bigInt
//num = 20000, decimal = 2
//returns 200
export function bigInt2Number(num: bigint, decimals: number): number {
    let number: string = num.toString()
    let len: number = number.length
    let result: string
    if (decimals <= len) {
        result = number.substring(0, len - decimals) + "." + number.substring(len - decimals, len)
    } else {
        result = "." + "0".repeat(decimals - len) + number
    }
    return parseFloat(result)
}

export function number2BigInt(num: number, decimals: number): bigint {
    let number: string = num.toString()
    let index = number.indexOf(".")

    //If not a float
    if (index === -1) {
        let result = number + "0".repeat(decimals)
        return BigInt(result)
    }

    let noDotNumber = number.substring(0, index) + number.substring(index + 1, number.length)
    let noDotLen: number = noDotNumber.length
    if (decimals <= noDotLen - index) {
        let newDotIndex = index + decimals
        let result = noDotNumber.substring(0, newDotIndex) + "." + noDotNumber.substring(newDotIndex, noDotLen)
        return BigInt(result)
    } else {
        let result = noDotNumber + "0".repeat(decimals - (noDotLen - index))
        return BigInt(result)
    }
}