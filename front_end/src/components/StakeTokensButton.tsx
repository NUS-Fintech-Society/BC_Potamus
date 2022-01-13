import { useState, useEffect } from "react"
import { useNotifications } from "@usedapp/core"
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material"
import { useStakeTokens, useTokenInfo } from "../hooks"
import { utils } from "ethers"
import { Functionality } from "./AmountButton"

export interface StakeTokensButtonProps {
    tokenAddress: string,
    amount: number,
    functionality: Functionality.Deposit | Functionality.Payback
}

export const StakeTokensButton = ({ tokenAddress, amount, functionality }: StakeTokensButtonProps) => {
    //Get token information first
    const { decimals } = useTokenInfo(tokenAddress)

    const { notifications } = useNotifications()

    const { approveAndStake, state: approveAndStakeErc20State } = useStakeTokens(tokenAddress, functionality)
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseUnits(amount.toString(), decimals)
        return approveAndStake(amountAsWei.toString())
    }

    const isMining = approveAndStakeErc20State.status === "Mining"
    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showStakeTokenSuccess, setShowStakeTokenSuccess] = useState(false)
    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setShowStakeTokenSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 transfer").length > 0) {
            setShowErc20ApprovalSuccess(true)
            setShowStakeTokenSuccess(false)
        }
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Stake Tokens"
        ).length > 0) {
            setShowErc20ApprovalSuccess(false)
            setShowStakeTokenSuccess(true)
        }
    }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess])

    return (
        <>
            <Button
                onClick={handleStakeSubmit}
                color="primary"
                size="large"
                disabled={isMining}>
                {isMining ? <CircularProgress size={26} /> : functionality.toString()}
            </Button>
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
