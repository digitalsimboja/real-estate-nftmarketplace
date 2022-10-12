import { ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SUBGRAPH_URL } from "../constants";


const polygonChain = {
  id: 80001,
  name: "Mumbai Testnet",
  network: "polygon",
  nativeCurrency: {
    decimals: 18,
    name: "Matic",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: "  https://rpc-mumbai.maticvigil.com/",
  },
  blockExplorers: {
    default: {
      name: "polygonscan",
      url: "https://polygonscan.com/",
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
          throw new Error("Error! Switch your network to Polygon Mainnnet");
          return null;
        };
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Eth NFTMarketplace",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const appolloClient = new ApolloClient({
  uri: SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={appolloClient}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
      
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
        
      </RainbowKitProvider>
    </WagmiConfig>
    </ApolloProvider>
  );
}

export default MyApp;