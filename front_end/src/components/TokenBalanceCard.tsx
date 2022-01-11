import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    TextField
} from "@mui/material"

import { useTokenInfo } from "../hooks/useTokenInfo"

export type TokenBalance = {
    address: string
    balance: number
}

interface TokenBalanceCardProp {
    tokenAddress: string
    balance: number
}

export const TokenBalanceCard = ({ tokenAddress, balance }: TokenBalanceCardProp) => {

    const { symbol, decimals, logoURL } = useTokenInfo(tokenAddress)

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt="Token image" src={logoURL} />
            </ListItemAvatar>
            <ListItemText primary={symbol} />
            <ListItemText primary={balance} />
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