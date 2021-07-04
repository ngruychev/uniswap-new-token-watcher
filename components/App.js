import { useEffect, useRef, useState } from "react";
import { useInterval } from "../hooks.js";
import { Flatpickr } from "./Flatpickr.js";
import { TokenResults } from "./TokenResults.js";
import { UniswapVersion } from "../contexts/UniswapVersion.js";
import { newTokensSince } from "../api/index.js";
import { html } from "../htmReact.js";

const appStartTime = Math.floor(Date.now() / 1000);

export function App(
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

  useEffect(() => {
    update(true);
  }, [since, uniVer]);
  useInterval(update, refreshInterval * 1000);

  return html`
  <div className="app">
    <nav className="row">
      <div className="column">
        <label>
            Version: <select value=${uniVer} onChange=${(e) =>
    setUniVer(e.target.value)}>
            <option value="v2">v2</option>
            <option value="v3">v3</option>
          </select>
        </label>
      </div>
      <div className="column">
        <label>Since: <${Flatpickr} value=${since} onChange=${setSince}/></label>
      </div>
      <div className="column">
        <label htmlFor="refreshInterval" style=${{ marginBottom: "auto" }}>
        Update every:
        </label>
        <input id="refreshInterval" type="number" step=${1} min=${1} style=${{
    width: "auto",
  }} value=${refreshInterval} onChange=${(e) =>
    setRefreshInterval(+e.target.value)}/> seconds
      </div>
    </div>
    <main>
      <${UniswapVersion.Provider} value=${uniVer}>
        <${TokenResults} results=${data}/>
      <//>
    </main>
  </div>
  `;
}
