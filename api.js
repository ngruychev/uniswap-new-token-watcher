const v2Url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
const v3Url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

function graphQuery(apiUrl, query, variables) {
  return fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  }).then((res) => res.json());
}

async function paginatedPairsWithTxCount1(
  timestamp,
  isv3 = false,
  minBlockNum = 0,
) {
  let all = [];
  timestamp = Math.floor(timestamp);
  while (true) {
    const res = await graphQuery(
      isv3 ? v3Url : v2Url,
      `
      query ${
        isv3 ? "Pools" : "Pairs"
      }WithTxCount1($timestamp: BigInt! $minBlockNum: BigInt!) {
        ${
        isv3 ? "pools" : "pairs"
      }(first: 1000 orderBy: createdAtTimestamp orderDirection: desc where: { txCount: 1 createdAtBlockNumber_gt: $minBlockNum createdAtTimestamp_gt: $timestamp }) {
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
      }
      `,
      {
        timestamp,
        minBlockNum,
      },
    );
    all = all.concat(res.data[isv3 ? "pools" : "pairs"]);
    if (res.data[isv3 ? "pools" : "pairs"].length === 0) break;
    minBlockNum = res.data[isv3 ? "pools" : "pairs"]
      .map((p) => p.createdAtBlockNumber)
      .map((block) => BigInt(block))
      .reduce((a, b) => a > b ? a : b)
      .toString();
    if (res.data[isv3 ? "pools" : "pairs"].length < 1000) break;
  }
  return [all, minBlockNum];
}

export async function newTokensSince(timestamp, isv3 = false, mbn = 0) {
  const [pairs, minBlockNum] = await paginatedPairsWithTxCount1(
    timestamp,
    isv3,
    mbn,
  );
  const res = pairs
    .filter((p) => p.token0.txCount === "1" || p.token1.txCount === "1")
    .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
    .map((pair) =>
      pair.token0.txCount === "1"
        ? { token: pair.token0, pair }
        : { token: pair.token1, pair }
    );
  return [res, minBlockNum];
}
