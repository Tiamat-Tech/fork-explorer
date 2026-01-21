import { clientConfig } from "../shared/client-config.ts";

export default function ContactTwitter() {
  if (!clientConfig.frontend.twitterHandle) {
    return null;
  }

  return (
    <p class="contact-twitter">
      Twitter:{" "}
      <a target="_blank" href={`https://twitter.com/${clientConfig.frontend.twitterHandle}`}>
        @{clientConfig.frontend.twitterHandle}
      </a>
    </p>
  );
}
