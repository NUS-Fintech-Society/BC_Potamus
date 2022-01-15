import { BigNumber } from "ethers";

export type TokenBalance = {
  tokenAddress: string;
  rawBalance: BigNumber;
  rawRatePerSec: BigNumber;
  rawRatePerSecDecimals: BigNumber;
  lastUpdated: BigNumber;
};

export type PoolInfo = {
  tokenAddress: string;
  rawAnnualRate: BigNumber;
  rawRateDecimals: BigNumber;
  rawDepositBalance: BigNumber;
  rawLoanBalance: BigNumber;
};

