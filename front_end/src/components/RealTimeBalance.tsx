import { ListItemText } from "@mui/material"

import { useState, useEffect } from "react"


interface RealTimeBalanceProp {
    initialBalance: number,
    incrPerSec: number
}


export const RealTimeBalance = ({ initialBalance, incrPerSec }: RealTimeBalanceProp) => {
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
    }, []);

    return (<ListItemText primary={realTimeBalance} />)
}