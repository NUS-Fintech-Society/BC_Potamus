import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
} from "@material-ui/core";
import { useEffect, useState, useMemo } from "react"
import ImageIcon from "@mui/icons-material/Image";
import { getTokenDetails, bigInt2Number } from "../../utils";

export interface TokenBalanceCardProp {
    tokenAddress: string
    balance: bigint
    ratePerSec: bigint
    ratePerSecDecimals: number
}

//Balance should be the raw balance of the token, we will handle the decimal inside here
export const TokenBalanceCard = ({ tokenAddress, balance, ratePerSec, ratePerSecDecimals }: TokenBalanceCardProp) => {
    let { symbol, imgSrc, decimals } = getTokenDetails(tokenAddress)

    // Use memo here
    let { initialBalance, incrPerSec } = useMemo(() => {
        let initialBalance = bigInt2Number(balance, decimals)
        let incrPerSec = initialBalance * bigInt2Number(ratePerSec, ratePerSecDecimals)
        return { initialBalance, incrPerSec }
    }, [balance, ratePerSec, ratePerSecDecimals])

    let [realTimeBalance, setRealTimeBalance] = useState(initialBalance);

    //Update the balance every second
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeBalance(realTimeBalance + incrPerSec)
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (<ListItem>
        <ListItemAvatar>
            <Avatar>
                <ImageIcon />
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={symbol} />
        <ListItemText primary={realTimeBalance} />
        <Button color="primary" size="large">
            Withdraw
        </Button>
    </ListItem>)
}