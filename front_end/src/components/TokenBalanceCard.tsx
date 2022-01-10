import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    TextField
} from "@mui/material"

import { shortenAddress } from "@usedapp/core"


interface TokenBalanceCardProp {
    tokenAddress: string
    balance: number
}

export const TokenBalanceCard = ({ tokenAddress, balance }: TokenBalanceCardProp) => {
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt="Token image" src="/token_image_placeholder.jpg" />
            </ListItemAvatar>
            <ListItemText primary={shortenAddress(tokenAddress)} />
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