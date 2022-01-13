import {
    TextField,
} from "@mui/material"
import { useState } from "react"
import { AmountButton, Functionality } from "./AmountButton"
import { constants } from "ethers"


export interface AddressAmountButtonProps {
    functionality: Functionality
}

export const AddressAmountButton = ({ functionality }: AddressAmountButtonProps) => {
    const [tokenAddress, setTokenAddress] = useState<string>(constants.AddressZero)
    console.log("Hi")

    const handleInputChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAddress = event.target.value === "" ? constants.AddressZero : event.target.value
        setTokenAddress(newAddress)
    }

    return (
        <div>
            <TextField
                id="outlined-basic"
                label="Token Address"
                variant="standard"
                style={{ width: 450 }}
                onChange={handleInputChangeAddress}
            />
            <AmountButton tokenAddress={tokenAddress} functionality={functionality}></AmountButton>
        </div >
    )
}