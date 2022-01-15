import { ListItemText } from "@mui/material"

import { useState, useEffect } from "react"


interface RealTimeBalanceProps {
    initialBalance: number,
    incrPerSec: number
}


export const RealTimeBalance = ({ initialBalance, incrPerSec }: RealTimeBalanceProps) => {
    const [realTimeBalance, setRealTimeBalance] = useState(initialBalance)
    const [incr, setIncr] = useState(incrPerSec)

    useEffect(() => {
        setRealTimeBalance(initialBalance)
        setIncr(incrPerSec)
    }, [initialBalance, incrPerSec])

    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeBalance(realTimeBalance => realTimeBalance + incr);
        }, 1000);
        return () => clearInterval(interval);
    }, [incr]);

    return (<ListItemText primary={realTimeBalance} />)
}