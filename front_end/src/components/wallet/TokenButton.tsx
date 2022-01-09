import {
    Button,
    TextField
    Input, CircularProgress, Snackbar
} from "@material-ui/core";

enum Functionality {
    Deposit,
    Loan
}

export interface TokenButtonProp {
    functionality: Functionality
}

export const TokenButton = ({ functionality }: TokenButtonProp) => {


    return (
        <>
            <div>
                <TextField
                    id="outlined-basic"
                    label="Token Address"
                    variant="standard"
                />
                <TextField id="outlined-basic" label="Amount" variant="standard" />
                <Button color="primary" size="large" onClick={handleStakeSubmit}>
                    Functionality[functionality]
                </Button>
            </div >
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved! Now approve the 2nd transaction.
                </Alert>
            </Snackbar>
            <Snackbar
                open={showStakeTokenSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens Staked!
                </Alert>
            </Snackbar>
        </>
    )
}