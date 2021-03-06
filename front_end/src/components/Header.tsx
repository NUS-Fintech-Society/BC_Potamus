import { makeStyles } from "@mui/styles"
import { Button } from "@mui/material";
import { useEthers } from "@usedapp/core"

const useStyles = makeStyles((theme) => ({
    container: {
        // padding: theme.spacing(4),
        display: "flex",
        justifyContent: "flex-end",
        // gap: theme.spacing(1)
    }
}));

export const Header = () => {
    const classes = useStyles();

    const { account, activateBrowserWallet, deactivate } = useEthers();

    return (
        <div className={classes.container}>
            {account ? (
                <Button variant="contained" onClick={() => deactivate()}>
                    Disconnect
                </Button>
            ) : (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => activateBrowserWallet()}
                >
                    Connect
                </Button>
            )}
        </div>
    );
};
