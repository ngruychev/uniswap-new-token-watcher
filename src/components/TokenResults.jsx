/** @jsx jsx */
import { TokenResult } from "./TokenResult.jsx";
import { css, jsx } from "@emotion/react";

const tokenResultsCss = css`
  &:empty {
    display: flex;
    width: 100%;
    height: 20em;
  }
  &:empty::before {
    content: "New tokens will appear here";
    margin: auto;
  }
`;

export function TokenResults({ results }) {
  return (
    <div css={tokenResultsCss}>
      {results.map((result) =>
        <TokenResult key={result.token.id} {...result} />
      )}
    </div>
  );
}
