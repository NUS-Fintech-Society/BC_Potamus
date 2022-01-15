import {
    Paper,
    List,
    Box,
    Grid,
    TableRow,
    TableCell,
    TableContainer,
    TableHead,
    Table,
    TableBody,
} from "@mui/material"

import { useEthers } from "@usedapp/core"
import { constants } from "ethers"
import networkMapping from "../chain-info/deployments/map.json"
import { useAccountBalance, usePoolInfo } from "../hooks"

import { TokenBalanceCard } from "./TokenBalanceCard"
import { PoolCard } from "./PoolCard"
import { Functionality } from "./AmountButton"
import { AddressAmountButton } from "./AddressAmountButton"

export const Main = () => {
    const { account, chainId } = useEthers()
    const potamusLoanAddress = chainId ? networkMapping[String(chainId)]["PotamusLoan"][0] : constants.AddressZero

    //TODO: Fix this trick, you should get the user account from Main's props
    //After conditional rendering, if user logged in, then load up the main page or something
    const tokenBalanceArray = useAccountBalance(account ? account : constants.AddressZero, potamusLoanAddress)
    const poolArray = usePoolInfo(potamusLoanAddress)

    return (
        <div>
            <Box>
                <h1> Your Wallet </h1>
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <h2> Deposit Balance</h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {tokenBalanceArray.filter(tokenBalance => tokenBalance.rawBalance.gte(0)).map(tokenBalance =>
                                    <TokenBalanceCard key={tokenBalance.tokenAddress} {...{ ...tokenBalance, functionality: Functionality.Withdraw }}
                                    />)}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <h2> Loan Balance</h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {tokenBalanceArray.filter(tokenBalance => tokenBalance.rawBalance.lt(0)).map(tokenBalance =>
                                    <TokenBalanceCard key={tokenBalance.tokenAddress} {...{ ...tokenBalance, functionality: Functionality.Payback }}
                                    />)}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <h1> Create New Pool </h1>
                <AddressAmountButton functionality={Functionality.Deposit}></AddressAmountButton>
            </Box>
            <Box>
                <h1> Potamus Pools </h1>
                <Paper sx={{ width: '80%', overflow: 'hidden', margin: 'auto' }}>
                    <TableContainer sx={{ maxHeight: 340 }}>
                        <Table stickyHeader >
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell align="right"><h3>Token</h3></TableCell>
                                    <TableCell align="right"><h3>Interest Rate&nbsp;(per annum)</h3></TableCell>
                                    <TableCell align="right"><h3>Deposit Balance</h3></TableCell>
                                    <TableCell align="right"><h3>Loan Balance</h3></TableCell>
                                    <TableCell align="right"><h3>Util Rate</h3></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poolArray.map(poolInfo => (
                                    <PoolCard key={poolInfo.tokenAddress} {...poolInfo} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </div >
    )
}