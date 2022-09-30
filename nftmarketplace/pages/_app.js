import { ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import "../styles/globals.css";

// set up the connection to Polygon Mumbai testnet
const polygonChain = {
  id: 80001,
  name: "Mumbai",
  network: "polygon",
  nativeCurrency: {
    decimals: 18,
    name: "Matic",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: "https://matic-mumbai.chainstacklabs.com",
  },
  blockExplorers: {
    default: {
      name: "polygonscan",
      url: "https://mumbai.polygonscan.com",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [polygonChain],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== polygonChain.id) {
          throw new Error(
            "Error! Switch your network to Polygon Mumbai Testnet"
          );
          return null;
        }
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "NFT Marketplace",
  chains,
});

// Initialize the wagmi client
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider>
          <Component {...pageProps} />;
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
