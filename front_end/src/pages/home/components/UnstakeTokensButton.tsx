import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useUnstakeTokens, useTokenInfo } from "../../../hooks";
import { useNotifications } from "@usedapp/core";
import { Functionality } from "../../../constants/enums";
import { utils } from "ethers";

interface UnstakeTokensButtonProps {
  tokenAddress: string;
  amount: number;
  functionality: Functionality.Loan | Functionality.Withdraw;
}

export const UnstakeTokensButton = ({
  tokenAddress,
  amount,
  functionality,
}: UnstakeTokensButtonProps) => {
  //Get token information first
  const { decimals } = useTokenInfo(tokenAddress);

  const { notifications } = useNotifications();

  const { send: unstakeTokensSend, state: unstakeTokensState } =
    useUnstakeTokens(functionality);

  const handleUnstakeSubmit = () => {
    return unstakeTokensSend(
      tokenAddress,
      utils.parseUnits(amount.toString(), decimals)
    );
  };

  const [showUnstakeSuccess, setShowUnstakeSuccess] = useState(false);

  const handleCloseSnack = () => {
    showUnstakeSuccess && setShowUnstakeSuccess(false);
  };

  useEffect(() => {
    if (
      notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Unstake tokens"
      ).length > 0
    ) {
      !showUnstakeSuccess && setShowUnstakeSuccess(true);
    }
  }, [notifications, showUnstakeSuccess]);

  const isMining = unstakeTokensState.status === "Mining";

  return (
    <React.Fragment>
      <Button
        color="primary"
        size="large"
        onClick={handleUnstakeSubmit}
        disabled={isMining}
      >
        {isMining ? <CircularProgress size={26} /> : functionality.toString()}
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
    </React.Fragment>
  );
};
