import "https://cdn.skypack.dev/preact@10.5.13/debug";
import { render } from "https://cdn.skypack.dev/preact@10.5.13";
import {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/preact@10.5.13/hooks";
import { html } from "https://cdn.skypack.dev/htm@3.0.4/preact";
import flatpickr from "https://cdn.skypack.dev/flatpickr@4.6.9";

const appStartTime = Math.floor(Date.now() / 1000);

const graphApiUrl =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

function graphQuery(query, variables) {
  return fetch(graphApiUrl, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  }).then((res) => res.json());
}

async function getNewTokensSince(timestamp) {
  return await graphQuery(
    `
  query NewTokenQuery($timestamp: BigInt!) {
    pairs(where: {createdAtTimestamp_gt: $timestamp}) {
      token0 {
        name
        symbol
        id
      }
      token1 {
        name
        symbol
        id
      }
      id
      createdAtTimestamp
      createdAtBlockNumber
      totalSupply
      token0Price
      token1Price
    }
  }`,
    { timestamp },
  );
}

function Pair(
  {
    token0,
    token1,
    id,
    createdAtTimestamp,
    createdAtBlocknumber,
    totalSuppy,
    token0Price,
    token1Price,
  },
) {
  const { symbol: token0Symbol, name: token0Name } = token0;
  const { symbol: token1Symbol, name: token1Name } = token1;
  return html`
  <div class="pair">
    <div>
      <b>${token0Symbol} - ${token1Symbol}</b>
      <br/>
      (${token0Name} / ${token1Name})
    <//>
    <br/>
    <b>ID:</b> ${id} (<a href=${`https://info.uniswap.org/pair/${id}`}>Uniswap</a>)
    <br/>
    <b>Date:</b> ${new Date(createdAtTimestamp * 1000).toString()}
  </div>
  `;
}

function Pairs({ pairs }) {
  return html`
  <div class="pairs">
    ${pairs.map((pair) => html`<${Pair} key=${pair.id} ...${pair}/>`)}
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

function UpdateInterval({ value, onChange }) {
  const [multiplier, setMultiplier] = useState(1000);
  const [val, setVal] = useState(value / multiplier);
  useEffect(() => {
    onChange(val * multiplier);
  }, [val, multiplier]);
  return html`
  <div class="row">
    <input class="column" value=${val} onchange=${(e) =>
    setVal(e.target.value)} step=${1}/>
    <select class="column" value=${multiplier} onchange=${(e) =>
    setMultiplier(e.target.value)}>
      <option value=${1000}>second(s)</option>
      <option value=${1000 * 60}>minute(s)</option>
      <option value=${1000 * 60 * 60}>hour(s)</option>
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
  const [data, setData] = useState({ pairs: [] });
  const [since, setSince] = useState(defaultSince);
  async function update() {
    const resData = await getNewTokensSince(since);
    setData(resData.data);
  }
  useEffect(() => {
    update();
    const interval = setInterval(update, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, since]);
  return html`
  <div class="app">
    <div class="row">
      <div class="column">
        Since: <${Flatpickr} value=${since} onChange=${setSince}/>
      </div>
      <div class="column">
        Update every:
        <${UpdateInterval} value=${refreshInterval} onChange=${setRefreshInterval}/>
      </div>
    </div>
    <${Pairs} pairs=${data.pairs}/>
  </div>
  `;
}

render(
  html`<${App} defaultRefreshInterval=${15_000}/>`,
  document.getElementById("rootDiv"),
);
