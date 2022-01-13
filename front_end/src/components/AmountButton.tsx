import {
    TextField,
} from "@mui/material"
import { StakeTokensButton } from "./StakeTokensButton"
import { UnstakeTokensButton } from "./UnstakeTokensButton"
import React, { useState } from "react"

export enum Functionality {
    Deposit = "deposit",
    Withdraw = "withdraw",
    Loan = "loan",
    Payback = "payback"
}

export interface AmountButtonProps {
    tokenAddress: string,
    functionality: Functionality
}

export const AmountButton = ({ tokenAddress, functionality }: AmountButtonProps) => {
    const [amount, setAmount] = useState<number>(0)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? 0 : Number(event.target.value)
        setAmount(newAmount)
    }

    return (
        <React.Fragment>
            <TextField
                id="outlined-basic"
                label="Amount"
                variant="standard"
                style={{ width: 80 }}
                onChange={handleInputChange}
            />
            {(functionality === Functionality.Deposit || functionality === Functionality.Payback) ?
                < StakeTokensButton tokenAddress={tokenAddress} amount={amount} functionality={functionality}></StakeTokensButton>
                : <UnstakeTokensButton tokenAddress={tokenAddress} amount={amount} functionality={functionality}></UnstakeTokensButton>}
        </React.Fragment>
    )
}