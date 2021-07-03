import { useState } from "preact/hooks";
import { useInterval } from "../hooks.js";
import { html } from "htm/preact";
import * as timeago from "timeago.js";

export function TimeAgo({ timestamp, update = 1000 }) {
  const [timeAgo, setTimeAgo] = useState(timeago.format(timestamp));
  useInterval(() => setTimeAgo(timeago.format(timestamp)), update);
  return html`${timeAgo}`;
}
