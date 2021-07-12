import {
  useEffect, useRef, useState,
} from 'react';
import { css } from '@emotion/react';
import { useId } from 'react-id-generator';
import useInterval from '../hooks/useInterval';
import Flatpickr from './Flatpickr';
import TokenResults from './TokenResults';
import UniswapVersion from '../contexts/UniswapVersion';
import newTokensSince from '../api/thegraph.com/uniswap';

const appStartTime = Math.floor(Date.now() / 1000);

interface AppProps {
  defaultRefreshInterval?: number;
  defaultSince?: number;
}

export default function App(
  { defaultRefreshInterval = 5, defaultSince = appStartTime - 60 * 5 }: AppProps,
) {
  const [refreshInterval, setRefreshInterval] = useState(
    defaultRefreshInterval,
  );
  const [uniVer, setUniVer] = useState('v3');
  const [data, setData] = useState([]);
  const [since, setSince] = useState(defaultSince);
  const minBlockNum = useRef(0);

  const [versionSelectId] = useId();
  const [sincePickerId] = useId();
  const [refreshIntervalId] = useId();

  async function update(doNotPaginate = false) {
    let res;
    [res, minBlockNum.current] = await newTokensSince(
      since,
      uniVer === 'v3',
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

  return (
    <div css={css`margin: 0 5%;`}>
      <nav className="row">
        <div className="column">
          <label htmlFor={versionSelectId}>
            Version:
            {' '}
            <select id={versionSelectId} value={uniVer} onChange={(e) => setUniVer(e.target.value)}>
              <option value="v2">v2</option>
              <option value="v3">v3</option>
            </select>
          </label>
        </div>
        <div className="column">
          <label htmlFor={sincePickerId}>
            Since:
            {' '}
            <Flatpickr id={sincePickerId} value={since} onChange={setSince} />
          </label>
        </div>
        <div className="column">
          <label htmlFor={refreshIntervalId} css={css`margin-bottom: auto;`}>
            Update every:
          </label>
          <input
            id={refreshIntervalId}
            type="number"
            step={1}
            min={1}
            css={css`width: auto !important;`}
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(+e.target.value)}
          />
          {' '}
          seconds
        </div>
      </nav>
      <main>
        <UniswapVersion.Provider value={uniVer}>
          <TokenResults results={data} />
        </UniswapVersion.Provider>
      </main>
    </div>
  );
}

App.defaultProps = {
  defaultRefreshInterval: 5,
  defaultSince: appStartTime - 60 * 5,
};
