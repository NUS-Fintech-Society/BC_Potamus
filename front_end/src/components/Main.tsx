import {
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Box,
    Input,
    Button,
    TextField,
    Grid,
    Typography,
    TableRow,
    TableCell,
    IconButton,
    TableContainer,
    TableHead,
    Table,
    Collapse,
    TableBody,
    CardHeader
} from "@mui/material"

import { useContractCall, useContractCalls, useEthers, ContractCall } from "@usedapp/core"
import PotamusLoan from "../chain-info/contracts/PotamusLoan.json"
import LoanAccount from "../chain-info/contracts/LoanAccount.json"
import { utils, BigNumber, constants } from "ethers"
import { formatUnits } from "@ethersproject/units"
import networkMapping from "../chain-info/deployments/map.json"

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { TokenBalanceCard } from "./TokenBalanceCard"

import { useState, useEffect } from "react"
import * as React from 'react';

type TokenBalance = {
    address: string
    balance: number
}

function useAccountBalance(userAddress: string, potamusLoanAddress: string): Array<TokenBalance> {
    //Load up Potamus Loan Interface
    const potamusLoanABI = PotamusLoan.abi
    const potamusLoanInterface = new utils.Interface(potamusLoanABI)

    const [tokenListLength] = useContractCall({ abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenListLength', args: [userAddress] }) ?? [BigNumber.from(0)]

    const indexArray: number[] = Array.from(Array(tokenListLength.toNumber()).keys())

    const calls: ContractCall[] = indexArray.map((index): ContractCall => { return { abi: potamusLoanInterface, address: potamusLoanAddress, method: 'getTokenAddressAndBalance', args: [userAddress, BigNumber.from(index)] } })

    const resultArray = useContractCalls(calls)

    const tokenBalanceArray = new Array<TokenBalance>()

    for (let i = 0; i < resultArray.length; i += 1) {
        let [address, balance, isExist] = resultArray[i] ?? [constants.AddressZero, BigNumber.from(0), false];
        let addr = address ?? constants.AddressZero
        let bal = balance ?? BigNumber.from(0);
        let exists = isExist ?? false;

        //TODO: still hardcode in number 18 here, need to fix this now
        if (addr !== constants.AddressZero && !bal.eq(BigNumber.from(0)) && exists) {

            tokenBalanceArray.push({ address: addr, balance: parseFloat(formatUnits(bal, 18)) })
        }
    }
    return tokenBalanceArray
}

export const Main = () => {
    let dummyList = [1, 2, 3, 4, 4, 5, 5, 5, 5]

    const { account, chainId } = useEthers()
    const potamusLoanAddress = chainId ? networkMapping[String(chainId)]["PotamusLoan"][0] : constants.AddressZero

    //TODO: Fix this trick, you should get the user account from Main's props
    //After conditional rendering, if user logged in, then load up the main page or something
    const tokenBalanceArray = useAccountBalance(account ? account : constants.AddressZero, potamusLoanAddress)

    return (
        <div>
            <Box>
                <h1> Your Balance </h1>
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <h2> Deposit </h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {tokenBalanceArray.filter(tokenBalance => tokenBalance.balance > 0).map(tokenBalance =>
                                    <TokenBalanceCard tokenAddress={tokenBalance.address} balance={tokenBalance.balance} />)}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <h2> Loan </h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {dummyList.map(() => {
                                    return (
                                        <TokenBalanceCard tokenAddress="0x66b29afd67e44E42D0fD8Acd5852E8eCCBc5C5b1" balance={10} />
                                    )
                                })}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <h1> Potamus Pool </h1>
                <Grid container>
                    <Grid item xs={3}>
                        <p> Create New Pool </p>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                            id="outlined-basic"
                            label="Token Address"
                            variant="standard"
                        />
                        <TextField id="outlined-basic" label="Amount" variant="standard" />
                        <Button color="primary" size="large">
                            Deposit
                        </Button>
                    </Grid>
                </Grid>
                <Paper style={{ maxHeight: 300, overflow: "auto" }}>
                    <TableContainer component={Paper}>
                        <Table stickyHeader >
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell align="right">Token</TableCell>
                                    <TableCell align="right">Interest Rate&nbsp;(% per anum)</TableCell>
                                    <TableCell align="right">Deposit Balance</TableCell>
                                    <TableCell align="right">Loan Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dummyList.map(() => (
                                    <Row />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </div >
    )
}


export const Row = () => {
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
                                src="/token_image_placeholder.jpg"
                            />
                        }
                        title='DAI'
                    />
                </TableCell>
                <TableCell align="right">13</TableCell>
                <TableCell align="right">13</TableCell>
                <TableCell align="right">13</TableCell>
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
