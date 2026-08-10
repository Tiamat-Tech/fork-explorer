interface ContactTwitterProps {
  twitterHandle: string;
}

export default function ContactTwitter({ twitterHandle }: ContactTwitterProps) {
  if (!twitterHandle) {
    return null;
  }

  return (
    <p class="contact-twitter">
      Twitter:{" "}
      <a target="_blank" href={`https://twitter.com/${twitterHandle}`}>
        @{twitterHandle}
      </a>
    </p>
  );
}
