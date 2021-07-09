import Token from './Token';

export default interface Pair {
  id: number;
  createdAtBlockNumber: number;
  createdAtTimestamp: number;
  token0Price: number;
  token1Price: number;
  token0: Token;
  token1: Token;
}
