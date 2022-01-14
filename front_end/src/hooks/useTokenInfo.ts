import { useEthers, shortenAddress, useToken } from "@usedapp/core"
import tokenList from "../processed.compound.tokenlist.json"

//Wrapper class of useToken.ts from usedapp with extra functionality
//TODO: Add a check if the supplied address follows ERC20 standard and return a isERC20 for hooks users to decide what to do
//BUG: For some reason, after useToken is added, there's weird error in runtime about MetaMask, the app still work, reloading is okai
//But just got some red error after awhile

//Should return
//Image link: (if not return our link image) 
//Symbol (if not return shortened address)
//Decimals (if not return 18)
export const useTokenInfo = (tokenAddress: string) => {
    //Current Implementation
    //Image link: get from json file, return default image if cannot find
    //Symbol, decimals: get directly from contracts, return default if cannot find
    const { chainId } = useEthers()

    //Getting logo URL of the image
    const { tokens } = tokenList
    let logoURL = "/token_image_placeholder.jpg"
    if (String(chainId) in tokens && tokenAddress in tokens[String(chainId)]) {
        let result = tokens[String(chainId)][tokenAddress]
        logoURL = result.logoURI;
    }

    //Getting symbol name and decimals
    const tokenInfo = useToken(tokenAddress)
    if (tokenInfo) {
        const symbol = tokenInfo.symbol ?? shortenAddress(tokenAddress)
        const decimals = tokenInfo.decimals ?? 18
        return { symbol: symbol, decimals: decimals, logoURL: logoURL }
    } else {
        return { symbol: shortenAddress(tokenAddress), decimals: 18, logoURL: logoURL }
    }
}