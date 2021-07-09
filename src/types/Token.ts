export default interface Token {
  id: number;
  createdAtBlockNumber: number;
  createdAtTimestamp: number;
  token0Price: number;
  token1Price: number;
  token0: {
    id: number;
    txCount: number;
    name: string;
    symbol: string;
  }
}
