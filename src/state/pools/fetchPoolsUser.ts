import psionicFarmABI from '../../constants/abi/psionicFarmABI.json'
import erc20ABI from '../../constants/abi/erc20.json'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import { getAddress } from '../../utils/addressHelpers'
import { ethers } from 'ethers';

export const fetchPoolsAllowance = async (account, chainId, pools) => {
    console.log('account:', account);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (!account) return {};
  
    const allowances = {};
  
    for (let pool of pools) {
      try {
        const tokenContract = new ethers.Contract(pool.stakingToken.address, erc20ABI, provider);
        const allowance = await tokenContract.allowance(account, getAddress(pool.contractAddress));
        allowances[pool.contractAddress] = new BigNumber(allowance.toString()).toJSON();
        } catch (error) {
        console.error(`Failed to fetch allowance for contract ${pool.contractAddress}`, error);
      }
    }
  
    return allowances;
  }



  export const fetchUserBalances = async (account, chainId, pools) => {
    if (!account) return {};
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokens = uniq(pools.map((pool) => pool.stakingToken.address));
    const tokenBalances = {};
    const poolTokenBalances = {};

    for (let token of tokens) {
        try {
            const tokenContract = new ethers.Contract(token as string, erc20ABI, provider);
            const balance = await tokenContract.balanceOf(account);
            tokenBalances[token as string] = balance;
        } catch (error) {
            console.error(`Failed to fetch balance for token ${token}`, error);
        }
    }

    for (let pool of pools) {
        try {
            poolTokenBalances[pool.contractAddress] = new BigNumber(tokenBalances[pool.stakingToken.address].toString()).toJSON();
        } catch (error) {
            console.error(`Failed to convert balance for pool ${pool.contractAddress}`, error);
        }
    }
    console.log('Returned poolTokenBalances:', poolTokenBalances);

    return poolTokenBalances;
}

export const fetchUserStakeBalances = async (account, chainId, pools) => {
    const balances = {};
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    for (let p of pools) {
      try {
        const poolContract = new ethers.Contract(getAddress(p.contractAddress), psionicFarmABI, provider);
        const userInfo = await poolContract.userInfo(account);
        balances[p.contractAddress] = new BigNumber(userInfo.amount._hex.toString()).toJSON();
      } catch (error) {
        console.error(`Failed to fetch balance for contract ${p.contractAddress}`, error);
      }
    }
    
    console.log('Returned balances:', balances);
    return balances;
  }

  export const fetchUserPendingRewards = async (account, chainId, pools) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const pendingRewards = {};

    for (let pool of pools) {
        try {
            const poolContract = new ethers.Contract(getAddress(pool.contractAddress), psionicFarmABI, provider);
            const reward = await poolContract.pendingReward(account);
            pendingRewards[pool.contractAddress] = new BigNumber(reward.toString()).toJSON();
        } catch (error) {
            console.error(`Failed to fetch pending reward for pool ${pool.contractAddress}`, error);
        }
    }

    console.log('Returned pendingRewards:', pendingRewards);
    return pendingRewards;
}
