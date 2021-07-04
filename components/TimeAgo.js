import { useState } from "react";
import { useInterval } from "../hooks.js";
import * as timeago from "timeago.js";
import { html } from "../htmReact.js";

export function TimeAgo({ timestamp, update = 1000 }) {
  const [timeAgo, setTimeAgo] = useState(timeago.format(timestamp));
  useInterval(() => setTimeAgo(timeago.format(timestamp)), update);
  return html`${timeAgo}`;
}
