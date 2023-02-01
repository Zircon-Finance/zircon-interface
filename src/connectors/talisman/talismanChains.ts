type Chain = {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testNet?: boolean;
};

export const talismanChains: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [process.env.RPC_URL_1],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  {
    id: 4,
    name: "Rinkeby",
    nativeCurrency: {
      name: "GLMR",
      symbol: "GLMR",
      decimals: 18,
    },
    rpcUrls: [process.env.RPC_URL_4],
    blockExplorerUrls: ["https://rinkeby.etherscan.io/"],
    testNet: true,
  },
  {
    id: 1284,
    name: "Moonbeam",
    nativeCurrency: {
      name: "GLMR",
      symbol: "GLMR",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.api.moonbeam.network"],
    blockExplorerUrls: ["https://moonbeam.moonscan.io/"],
  },
  {
    id: 1285,
    name: "Moonriver",
    nativeCurrency: {
      name: "MOVR",
      symbol: "MOVR",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.api.moonriver.moonbeam.network"],
    blockExplorerUrls: ["https://moonriver.moonscan.io/"],
  },
  {
    id: 1287,
    name: "Moonbase Alpha",
    nativeCurrency: {
      name: "DEV",
      symbol: "DEV",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
    blockExplorerUrls: ["https://moonbase.moonscan.io/"],
  },
  {
    id: 592,
    name: "Astar",
    nativeCurrency: {
      name: "ASTR",
      symbol: "ASTR",
      decimals: 18,
    },
    rpcUrls: ["https://evm.astar.network"],
    blockExplorerUrls: ["https://blockscout.com/astar/"],
  },
  {
    id: 81,
    name: "Shibuya",
    nativeCurrency: {
      name: "SBY",
      symbol: "SBY",
      decimals: 18,
    },
    rpcUrls: ["https://evm.shibuya.astar.network"],
    blockExplorerUrls: ["https://shibuya.subscan.io/"],
    testNet: true,
  },
  {
    id: 336,
    name: "Shiden",
    nativeCurrency: {
      name: "SDN",
      symbol: "SDN",
      decimals: 18,
    },
    rpcUrls: ["https://evm.shiden.astar.network"],
    blockExplorerUrls: ["https://blockscout.com/shiden/"],
  },
];
