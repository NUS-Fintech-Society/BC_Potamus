import {
    Avatar,
    Button,
    TextField,
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    CardHeader
} from "@mui/material"

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { BigNumber } from "ethers"

import React, { useState } from "react"
import { useTokenInfo } from "../hooks"
import { formatUnits } from "@ethersproject/units"

export type PoolInfo = {
    tokenAddress: string
    rawAnnualRate: BigNumber
    rawRateDecimals: BigNumber
    rawDepositBalance: BigNumber
    rawLoanBalance: BigNumber
}

interface PoolCardProp {
    tokenAddress: string
    rawAnnualRate: BigNumber
    rawRateDecimals: BigNumber
    rawDepositBalance: BigNumber
    rawLoanBalance: BigNumber
}

export const PoolCard = ({ tokenAddress, rawAnnualRate, rawRateDecimals, rawDepositBalance, rawLoanBalance }: PoolCardProp) => {

    const { symbol, decimals, logoURL } = useTokenInfo(tokenAddress)
    const annualRatePercent = parseFloat(formatUnits(rawAnnualRate, rawRateDecimals)) * 100
    const depositBalance = parseFloat(formatUnits(rawDepositBalance, decimals))
    const loanBalance = parseFloat(formatUnits(rawLoanBalance, decimals))
    const utilRatePercent = loanBalance * 100 / depositBalance

    const [open, setOpen] = useState(false);


    return (
        <React.Fragment>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <CardHeader
                        avatar={
                            <Avatar
                                alt="Token Image"
                                src={logoURL}
                            />
                        }
                        title={symbol}
                    />
                </TableCell>
                <TableCell align="right">{annualRatePercent.toFixed(2)}%</TableCell>
                <TableCell align="right">{depositBalance}</TableCell>
                <TableCell align="right">{loanBalance}</TableCell>
                <TableCell align="right">{utilRatePercent.toFixed(1)}%</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <TextField
                            id="outlined-basic"
                            label="Amount"
                            variant="standard"
                        />
                        <Button color="primary" size="large">
                            Deposit
                        </Button>
                        <TextField
                            id="outlined-basic"
                            label="Amount"
                            variant="standard"
                        />
                        <Button color="primary" size="large">
                            Withdraw
                        </Button>
                    </Collapse>
                </TableCell>
            </TableRow >
        </React.Fragment >
    )
}
