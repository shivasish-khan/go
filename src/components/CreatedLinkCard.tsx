import { Copy } from "lucide-react";
import type { ShortenResponse } from "../types";
import { formatDate } from "../lib/format";

type CreatedLinkCardProps = {
  link: ShortenResponse;
  onCopy: (value: string) => void;
  timezone: string;
};

export function CreatedLinkCard({ link, onCopy, timezone }: CreatedLinkCardProps) {
  return (
    <section className="resultBox">
      <div>
        <span>Your short link</span>
        <a href={link.shortUrl} target="_blank" rel="noreferrer">
          {link.shortUrl}
        </a>
        <small>
          {link.type} · {link.status}
          {link.title ? ` · ${link.title}` : ""}
          {link.expiresAt ? ` · expires ${formatDate(link.expiresAt, timezone)}` : ""}
        </small>
      </div>

      <button className="outlineButton" onClick={() => onCopy(link.shortUrl)}>
        <Copy size={15} strokeWidth={2.25} />
        Copy
      </button>
    </section>
  );
}
