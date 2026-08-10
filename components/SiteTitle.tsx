interface SiteTitleProps {
  forkName: string;
}

export default function SiteTitle({ forkName }: SiteTitleProps) {
  return (
    <h1 class="site-title">
      {forkName} activation
      <a class="txt-link" href="/index.txt">Text version</a>
    </h1>
  );
}
