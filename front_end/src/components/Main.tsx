import {
    Paper,
    List,
    Box,
    Button,
    TextField,
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
                <h1> Your Balance </h1>
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <h2> Deposit </h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {tokenBalanceArray.filter(tokenBalance => tokenBalance.rawBalance.gte(0)).map(tokenBalance =>
                                    <TokenBalanceCard {...tokenBalance}
                                    />)}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <h2> Loan </h2>
                        <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                            <List>
                                {tokenBalanceArray.filter(tokenBalance => tokenBalance.rawBalance.lt(0)).map(tokenBalance =>
                                    <TokenBalanceCard {...tokenBalance}
                                    />)}
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
                                    <TableCell align="right">Interest Rate&nbsp;(per annum)</TableCell>
                                    <TableCell align="right">Deposit Balance</TableCell>
                                    <TableCell align="right">Loan Balance</TableCell>
                                    <TableCell align="right">Util Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poolArray.map(poolInfo => (
                                    <PoolCard {...poolInfo} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </div >
    )
}