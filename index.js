// deno-lint-ignore no-unused-vars
let DEBUG_MODE = false;
if (new URLSearchParams(window.location.search).get("debug") !== null) {
  DEBUG_MODE = true;
  await import("preact/debug");
}
import { createContext, render } from "preact";
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { html } from "htm/preact";
import flatpickr from "flatpickr";
import * as timeago from "timeago.js";
import { newTokensSince } from "./api.js";

const appStartTime = Math.floor(Date.now() / 1000);

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

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Version = createContext("v3");

function TimeAgo({ timestamp, update = 1000 }) {
  const [timeAgo, setTimeAgo] = useState(timeago.format(timestamp));
  useInterval(() => setTimeAgo(timeago.format(timestamp)), update);
  return html`${timeAgo}`;
}

function Result(
  {
    token,
    pair,
  },
) {
  const when = new Date(pair.createdAtTimestamp * 1000);
  const uniVer = useContext(Version);
  return html`
  <div class="result">
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

function Results({ results }) {
  const uniVer = useContext(Version);
  return html`
  <div class="results">
    ${
    results.map((result) =>
      html`<${Result} key=${result.token.id} ...${result}/>`
    )
  }
  </div>`;
}

function Flatpickr({ value, onChange }) {
  const ref = useRef(null);
  const fpRef = useRef(null);
  useEffect(() => {
    fpRef.current = flatpickr(ref.current, {
      defaultDate: value * 1000,
      enableTime: true,
      time_24hr: true,
      disableMobile: true,
      onChange: ([val]) => onChange(Math.floor(val.getTime() / 1000)),
    });
    return () => fpRef.current.destroy();
  }, []);
  useEffect(() => {
    if (!fpRef.current) return;
    fpRef.current.setDate(value * 1000);
  }, [value]);
  return html`
  <div class="row">
    <input class="column" ref=${ref}/>
    <button class="button-clear" onclick=${() =>
    onChange(Math.floor(Date.now() / 1000))}>Set to now</button>
  </div>
  `;
}

function App(
  { defaultRefreshInterval = 5, defaultSince = appStartTime - 60 * 5 },
) {
  const [refreshInterval, setRefreshInterval] = useState(
    defaultRefreshInterval,
  );
  const [uniVer, setUniVer] = useState("v3");
  const [data, setData] = useState([]);
  const [since, setSince] = useState(defaultSince);
  const minBlockNum = useRef(0);

  async function update(doNotPaginate = false) {
    let res;
    [res, minBlockNum.current] = await newTokensSince(
      since,
      uniVer === "v3",
      doNotPaginate ? 0 : minBlockNum.current,
    );
    if (res.length !== 0 || doNotPaginate) {
      setData(res.concat(doNotPaginate ? [] : data));
    }
  }

  useEffect(() => update(true), [since, uniVer]);
  useInterval(update, refreshInterval * 1000);

  return html`
  <div class="app">
    <nav class="row">
      <div class="column">
        <label>
            Version: <select value=${uniVer} onChange=${(e) =>
    setUniVer(e.target.value)}>
            <option value="v2">v2</option>
            <option value="v3">v3</option>
          </select>
        </label>
      </div>
      <div class="column">
        <label>Since: <${Flatpickr} value=${since} onChange=${setSince}/></label>
      </div>
      <div class="column">
        <label for="refreshInterval" style=${{ "margin-bottom": "auto" }}>
        Update every:
        </label>
        <input id="refreshInterval" type="number" step=${1} min=${1} style=${{
    width: "auto",
  }} value=${refreshInterval} onchange=${(e) =>
    setRefreshInterval(+e.target.value)}/> seconds
      </div>
    </div>
    <main>
      <${Version.Provider} value=${uniVer}>
        <${Results} results=${data}/>
      <//>
    </main>
  </div>
  `;
}

render(
  html`<${App} defaultRefreshInterval=${5}/>`,
  document.getElementById("rootDiv"),
);
