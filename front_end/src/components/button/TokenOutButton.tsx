import { number2BigInt } from "../../utils"
import {
    Snackbar,
    Button,
    Alert,
    CircularProgress
} from "@material-ui/core";
import { useState, useEffect } from "react";
import { useNotifications } from "@usedapp/core";
import { useUnstakeTokens } from "../../hooks";


export interface TokenOutButtonProp {
    tokenAddress: string,
    amount: number, //amount before decimals, if user enter 10, we will find out
    //the decimal of that token (let's say 2), so the actual token number is 10 * 10^2 = 1000
    targetAddress: string
}

export const TokenOutButton = ({ tokenAddress, amount, targetAddress }: TokenOutButtonProp) => {

    const { image, address: tokenAddress, name } = token

    const { notifications } = useNotifications()

    const balance = useStakingBalance(tokenAddress)

    const formattedBalance: number = balance
        ? parseFloat(formatUnits(balance, 18))
        : 0

    const { send: unstakeTokensSend, state: unstakeTokensState } =
        useUnstakeTokens()

    const handleUnstakeSubmit = () => {
        return unstakeTokensSend(tokenAddress)
    }

    const [showUnstakeSuccess, setShowUnstakeSuccess] = useState(false)

    const handleCloseSnack = () => {
        showUnstakeSuccess && setShowUnstakeSuccess(false)
    }

    useEffect(() => {
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Unstake tokens"
            ).length > 0
        ) {
            !showUnstakeSuccess && setShowUnstakeSuccess(true)
        }
    }, [notifications, showUnstakeSuccess])

    const isMining = unstakeTokensState.status === "Mining"

    return (
        <>
            <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={handleUnstakeSubmit}
                disabled={isMining}
            >
                {isMining ? <CircularProgress size={26} /> : `Unstake all ${name}`}
            </Button>
            <Snackbar
                open={showUnstakeSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens unstaked successfully!
                </Alert>
            </Snackbar>
        </>
    )
}