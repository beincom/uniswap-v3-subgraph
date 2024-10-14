# Uniswap V3 Subgraph

### Subgraph Endpoint 

Synced at: https://thegraph.com/hosted-service/subgraph/ianlapham/uniswap-v3-subgraph?selected=playground

Pending Changes at same URL


# Deploy
- yarn codegen
- yarn build --network arbitrumSepolia
- graph deploy uniswapv3-subgraph \             
  --version-label v0.0.2 \
  --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
  --deploy-key yourkey \
  --ipfs https://ipfs.satsuma.xyz