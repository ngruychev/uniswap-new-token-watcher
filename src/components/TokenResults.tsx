/* eslint-disable react/jsx-props-no-spreading */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import TokenResult from './TokenResult';

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

type TokenResultsProps = {
  results: any[]
};

export default function TokenResults({ results }: TokenResultsProps) {
  return (
    <div css={tokenResultsCss}>
      {results.map((result) => <TokenResult key={result.token.id} {...result} />)}
    </div>
  );
}
