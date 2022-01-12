import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    TextField
} from "@mui/material"

import { useTokenInfo } from "../hooks/useTokenInfo"
import { BigNumber } from "ethers"
import { formatUnits } from "@ethersproject/units"
import { useState, useEffect, useMemo } from "react"

export type TokenBalance = {
    tokenAddress: string
    rawBalance: BigNumber
    rawRatePerSec: BigNumber
    rawRatePerSecDecimals: BigNumber
    lastUpdated: BigNumber
}

interface TokenBalanceCardProp {
    tokenAddress: string
    rawBalance: BigNumber
    rawRatePerSec: BigNumber
    rawRatePerSecDecimals: BigNumber
    lastUpdated: BigNumber
}

let calculateCurrentBalance = (initialBalance: number, ratePerSec: number, secSince: number): number => {
    return initialBalance * Math.pow((ratePerSec + 1), secSince)
}

export const TokenBalanceCard = ({ tokenAddress, rawBalance, rawRatePerSec, rawRatePerSecDecimals, lastUpdated }: TokenBalanceCardProp) => {
    const { symbol, decimals, logoURL } = useTokenInfo(tokenAddress)

    const { initialBalance, incrPerSec } = useMemo(() => {
        const currentSeconds = Math.round(new Date().getTime() / 1000);

        const secSince = currentSeconds - Math.round(lastUpdated.toNumber())
        //orginalBalance: balance on the block
        const originalBalance = parseFloat(formatUnits(rawBalance, decimals))
        const ratePerSec = parseFloat(formatUnits(rawRatePerSec, rawRatePerSecDecimals))
        //initialBalance: balance from that last updated block
        const initialBalance = calculateCurrentBalance(originalBalance, ratePerSec, secSince)
        //Quick estimation
        const incrPerSec = initialBalance * ratePerSec
        console.log(rawRatePerSec)

        return { initialBalance, incrPerSec }
    }, [tokenAddress, rawBalance, rawRatePerSec, rawRatePerSecDecimals, lastUpdated])

    let [realTimeBalance, setRealTimeBalance] = useState(initialBalance);

    useEffect(() => {
        setRealTimeBalance(initialBalance)
    }, [tokenAddress, rawBalance, rawRatePerSec, rawRatePerSecDecimals, lastUpdated])

    //Update the balance every second
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeBalance(realTimeBalance += incrPerSec)
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt="Token image" src={logoURL} />
            </ListItemAvatar>
            <ListItemText primary={symbol} />
            <ListItemText primary={realTimeBalance} />
            <TextField
                id="outlined-basic"
                label="Amount"
                variant="standard"
                style={{ width: 80 }}
            />
            <Button color="primary" size="large">
                Deposit
            </Button>
        </ListItem>
    )
}