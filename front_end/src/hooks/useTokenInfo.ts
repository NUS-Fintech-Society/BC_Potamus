import { useEthers, shortenAddress } from "@usedapp/core"
import tokenList from "../processed.compound.tokenlist.json"

//Wrapper class of useToken.ts from usedapp with extra functionality
//TODO: Add a check if the supplied address follows ERC20 standard and return a isERC20 for hooks users to decide what to do
//This wrapper automatically check the current chain that it's on

//TODO: Right now the image is from local json file, add an option to download a new json file every time the app start
//TODO: Use `useToken` from `@usedapp/core` to take information directly from the contract instead of this quick hardcode


//Should return
//Image link: (if not return our link image) 
//Symbol (if not return shortened address)
//Decimals (if not return 18)
export const useTokenInfo = (tokenAddress: string) => {
    const { chainId } = useEthers()

    const { tokens } = tokenList

    let defaultInfo = {
        symbol: shortenAddress(tokenAddress),
        decimals: 18,
        logoURI: "/token_image_placeholder.jpg"
    }

    //If can find info in the local json file, return it, else return default value
    if (String(chainId) in tokens && tokenAddress in tokens[String(chainId)]) {
        let results = tokens[String(chainId)][tokenAddress]

        return { symbol: results.symbol, decimals: results.decimals, logoURI: results.logoURI }
    }

    return defaultInfo
}