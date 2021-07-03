import { useContext } from "preact/hooks";
import { html } from "htm/preact";
import { TimeAgo } from "./TimeAgo.js";
import { UniswapVersion } from "../contexts/UniswapVersion.js";

const urls = {
  token: {
    uniswap: {
      v2: (token) => `https://v2.info.uniswap.org/token/${token}`,
      v3: (token) => `https://v3.info.uniswap.org/#/tokens/${token}`,
    },
    etherscan: (token) => `https://etherscan.io/token/${token}`,
  },
  pair: {
    uniswap: {
      v2: (pair) => `https://v2.info.uniswap.org/pair/${pair}`,
      v3: (pair) => `https://v3.info.uniswap.org/#/pools/${pair}`,
    },
    etherscan: (pair) => `https://etherscan.io/address/${pair}#tokentxns`,
  },
};

export function TokenResult(
  {
    token,
    pair,
  },
) {
  const when = new Date(pair.createdAtTimestamp * 1000);
  const uniVer = useContext(UniswapVersion);
  return html`
  <div class="token-result">
    <div>
      <b>${token.symbol}</b> (${token.name})
      <br/>
      <b>ID:</b> <code>${token.id}</code>
      (<a href=${
    urls.token.uniswap[uniVer](token.id)
  } target="_blank">Uniswap</a>
      ${" "}
      <a href=${urls.token.etherscan(token.id)} target="_blank">Etherscan</a>)
    </div>
    <br/>
    <b>Pair:</b> ${pair.token0.symbol} / ${pair.token1.symbol} (${pair.token0.name} / ${pair.token1.name})
    <br/>
    <b>Pair ID:</b> <code>${pair.id}</code> (
      <a href=${urls.pair.uniswap[uniVer](pair.id)} target="_blank">Uniswap</a>
      ${" "}
      <a href=${urls.pair.etherscan(pair.id)} target="_blank">Etherscan</a>
      )
    <br/>
    <b>Date:</b> ${when.toString()} (<b><${TimeAgo} timestamp=${when}/></b>)
    <br/>
    <b>Block ID:</b> <code>${pair.createdAtBlockNumber}</code>
  </div>
  `;
}
