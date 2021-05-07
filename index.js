import "https://cdn.skypack.dev/preact@10.5.13/debug";
import { render } from "https://cdn.skypack.dev/preact@10.5.13";
import {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/preact@10.5.13/hooks";
import { html } from "https://cdn.skypack.dev/htm@3.0.4/preact";
import flatpickr from "https://cdn.skypack.dev/flatpickr@4.6.9";
import * as timeago from "https://cdn.skypack.dev/timeago.js@4.0.2";
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
      v3: (pair) => `https://v2.info.uniswap.org/#/pools/${pair}`,
    },
  },
};

function TimeAgo({ timestamp, update = 1000 }) {
  const [timeAgo, setTimeAgo] = useState("");
  useEffect(() => {
    const interval = setInterval(() => setTimeAgo(timeago.format(timestamp)));
    return () => clearInterval(interval);
  }, []);
  return html`${timeAgo}`;
}

function Result(
  {
    token,
    pair,
    uniswapVersion = "v2",
  },
) {
  return html`
  <div class="result">
    <div>
      <b>${token.symbol}</b> (${token.name})
      <br/>
      <b>ID:</b> ${token.id} (<a href=${
    urls.token.uniswap[uniswapVersion](token.id)
  }>Uniswap</a> <a href=${urls.token.etherscan(token.id)}>Etherscan</a>)
    <//>
    <br/>
    <b>Pair:</b> ${pair.token0.symbol} / ${pair.token1.symbol} (${pair.token0.name} / ${pair.token1.name})
    <br/>
    <b>Pair ID:</b> ${pair.id} (<a href=${
    urls.pair.uniswap[uniswapVersion](pair.id)
  }>Uniswap</a>)
    <br/>
    <b>Date:</b> ${
    new Date(pair.createdAtTimestamp * 1000).toString()
  } (<b><${TimeAgo} timestamp=${pair.createdAtTimestamp * 1000}/></b>)
  </div>
  `;
}

function Results({ results, uniswapVersion = "v2" }) {
  return html`
  <div class="results">
    ${
    results.map((result) =>
      html
        `<${Result} key=${result.token.id} ...${result} uniswapVersion=${uniswapVersion}/>`
    )
  }
  </div>`;
}

function VersionPicker(
  { versions = [["v2", "v2"], ["v3", "v3"]], version, onChange },
) {
  return html`
  <select value=${version} onchange=${(e) => onChange(e.target.value)}>
    ${versions.map((v) => html`<option value=${v[0]}>${v[1]}</option>`)}
  </select>
  `;
}

function Flatpickr({ value, onChange }) {
  const ref = useRef(null);
  const fpRef = useRef(null);
  useEffect(() => {
    fpRef.current = flatpickr(ref.current, {
      defaultDate: value * 1000,
      enableTime: true,
      time_24hr: true,
      onChange: ([val]) => onChange(Math.floor(val.getTime() / 1000)),
    });
    return () => fpRef.current.destroy();
  }, []);
  useEffect(() => {
    if (!fpRef.current) return;
    fpRef.current.setDate(value * 1000);
  }, [value]);
  return html`<input ref=${ref}/>`;
}

function UpdateInterval(
  {
    defaultMul = 1000,
    multipliers = [
      [1000, "second(s)"],
      [1000 * 60, "minute(s)"],
      [1000 * 60 * 60, "hour(s)"],
    ],
    value,
    onChange,
  },
) {
  const [mul, setMul] = useState(defaultMul);
  const [val, setVal] = useState(value / mul);
  useEffect(() => {
    onChange(val * mul);
  }, [val, mul]);
  return html`
  <div class="row">
    <input class="column" value=${val} step=${1} min=${1} onchange=${(e) =>
    setVal(e.target.value)}/>
    <select class="column" value=${mul} onchange=${(e) =>
    setMul(e.target.value)}>
      ${multipliers.map((m) => html`<option value=${m[0]}>${m[1]}</option>`)}
    </select>
  </div>
  `;
}

function App(
  { defaultRefreshInterval = 3000, defaultSince = appStartTime - 60 * 60 },
) {
  const [refreshInterval, setRefreshInterval] = useState(
    defaultRefreshInterval,
  );
  const [uniswapVersion, setUniswapVersion] = useState("v2");
  const [data, setData] = useState([]);
  const [since, setSince] = useState(defaultSince);

  async function update() {
    const [resData, minBlockNum] = await newTokensSince(since, uniswapVersion === "v3", 0);
    setData(resData);
  }
  
  useEffect(() => {
    update();
    const interval = setInterval(update, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, since, uniswapVersion]);

  return html`
  <div class="app">
    <div class="row">
      <div class="column">
        Version: <${VersionPicker} version=${uniswapVersion} onChange=${setUniswapVersion}/>
      </div>
      <div class="column">
        Since: <${Flatpickr} value=${since} onChange=${setSince}/>
      </div>
      <div class="column">
        Update every:
        <${UpdateInterval} value=${refreshInterval} onChange=${setRefreshInterval}/>
      </div>
    </div>
    <${Results} results=${data} uniswapVersion=${uniswapVersion}/>
  </div>
  `;
}

render(
  html`<${App} defaultRefreshInterval=${15_000}/>`,
  document.getElementById("rootDiv"),
);
