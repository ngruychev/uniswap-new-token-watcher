import { html } from "htm/preact";
import { TokenResult } from "./TokenResult.js";

export function TokenResults({ results }) {
  return html`
  <div class="token-results">
    ${
    results.map((result) =>
      html`<${TokenResult} key=${result.token.id} ...${result}/>`
    )
  }
  </div>`;
}
