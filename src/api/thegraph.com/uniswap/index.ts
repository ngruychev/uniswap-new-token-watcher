import Pair from '../../../types/Pair';

const v2Url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const v3Url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

function graphQuery(apiUrl, query, variables) {
  return fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  }).then((res) => res.json());
}

async function paginatedPairsWithTxCount1(
  timestamp,
  isv3 = false,
  fromMinBlockNum = 0,
): [Pair[], number] {
  let minBlockNum = fromMinBlockNum;
  let blockHeight = -1;
  let all = [];
  for (;;) {
    const query = `
      query ${isv3 ? 'Pools' : 'Pairs'}WithTxCount1($timestamp: BigInt! $minBlockNum: BigInt! $blockHeight: Int!) {
        ${isv3 ? 'pools' : 'pairs'}(${blockHeight !== -1 ? 'block: { number: $blockHeight } ' : ''}first: 1000 orderBy: createdAtTimestamp orderDirection: desc where: { txCount: 1 createdAtBlockNumber_gt: $minBlockNum createdAtTimestamp_gt: $timestamp }) {
          id
          createdAtBlockNumber
          createdAtTimestamp
          token0Price
          token1Price
          token0 {
            id
            txCount
            name
            symbol
          }
          token1 {
            id
            txCount
            name
            symbol
          }
        }
        _meta {
          block {
            number
            hash
          }
        }
      }
    `;
    // eslint-disable-next-line no-await-in-loop
    const res = await graphQuery(isv3 ? v3Url : v2Url, query, {
      timestamp,
      minBlockNum,
      blockHeight,
    });
    all = all.concat(res.data[isv3 ? 'pools' : 'pairs']);
    if (res.data[isv3 ? 'pools' : 'pairs'].length === 0) break;
    // set the next query to seek after the newest token we have right now
    minBlockNum = res.data[isv3 ? 'pools' : 'pairs']
      .map((p) => p.createdAtBlockNumber)
      .map((block) => BigInt(block))
      .reduce((a, b) => (a > b ? a : b))
      .toString();
    // lock the block height to the one from the first query, for consistency
    // eslint-disable-next-line no-underscore-dangle
    if (blockHeight !== -1) blockHeight = res.data._meta.block.number;
    // The Graph limits queries to 1000 results
    // if we have less than 1000, it is safe to assume we don't have any more results
    // https://uniswap.org/docs/v2/API/queries/#:~:text=The%20Graph%20limits%20entity%20return%20amounts%20to%201000%20per%20query%20as%20of%20now
    if (res.data[isv3 ? 'pools' : 'pairs'].length < 1000) break;
  }
  return [all, minBlockNum];
}

export default async function newTokensSince(
  timestamp: number,
  isv3 = false,
  mbn = 0,
): [{ pair: Pair, token: Token }, number] {
  const [pairs, minBlockNum] = await paginatedPairsWithTxCount1(
    timestamp,
    isv3,
    mbn,
  );
  const res = pairs
    .filter((p) => p.token0.txCount === '1' || p.token1.txCount === '1')
    .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
    .map((pair) => (pair.token0.txCount === '1'
      ? { token: pair.token0, pair }
      : { token: pair.token1, pair }));
  return [res, minBlockNum];
}
