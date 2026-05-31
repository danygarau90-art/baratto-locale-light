import { MessageCircle } from "lucide-react";
import { getCityName } from "../lib/config";
import { getTelegramUrl } from "../lib/telegram";
import type { Item } from "../lib/types";

export function ItemCard({ item }: { item: Item }) {
  const telegramUrl = getTelegramUrl(item.telegramUsername);

  return (
    <article className="card itemCard">
      <a className="imageBox" href={`/item/${item.id}`} aria-label={`Apri ${item.title}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} />
        ) : (
          <span>Nessuna foto</span>
        )}
      </a>

      <div>
        <p className="eyebrow">
          {item.category} · {getCityName(item.city)}
        </p>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <p>
          <strong>Cerco:</strong> {item.wants}
        </p>

        <div className="cardActions">
          <a className="button small" href={`/item/${item.id}`}>
            Apri annuncio
          </a>

          {telegramUrl ? (
            <a
              className="button small secondary"
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              Contatta su Telegram
            </a>
          ) : (
            <span className="inactiveBadge">Contatto demo non attivo</span>
          )}
        </div>

        <p className="safetyNote">
          Accordi diretti su Telegram. Nessuna chat interna, nessun pagamento,
          nessuna spedizione gestita dal sito.
        </p>
      </div>
    </article>
  );
}
