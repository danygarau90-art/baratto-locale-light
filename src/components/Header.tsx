import { Handshake, ShieldCheck } from "lucide-react";
import { siteConfig } from "../lib/config";

export function Header() {
  return (
    <header className="header">
      <a className="brand" href="/">
        <span className="brandIcon"><Handshake size={20} /></span>
        <span>{siteConfig.name}</span>
      </a>
      <nav>
        <a href="/publish">Pubblica</a>
        <a href="/rules">Regole</a>
        <a href="/privacy"><ShieldCheck size={16} /> Privacy</a>
      </nav>
    </header>
  );
}
