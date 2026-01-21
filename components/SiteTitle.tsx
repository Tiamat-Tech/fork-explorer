import { clientConfig } from "../shared/client-config.ts";

export default function SiteTitle() {
  return (
    <h1 class="site-title">
      {clientConfig.fork.name} activation
      <a class="txt-link" href="/index.txt">Text version</a>
    </h1>
  );
}
