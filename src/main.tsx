import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, MessageCircle, Trash2 } from "lucide-react";
import { Header } from "./components/Header";
import { ItemCard } from "./components/ItemCard";
import { categories, cities, getCityName, siteConfig } from "./lib/config";
import { mockItems } from "./lib/mock-items";
import type { Item } from "./lib/types";
import "./styles.css";

const LOCAL_ITEMS_KEY = "baratto_locale_demo_items";
const LOCAL_REPORTS_KEY = "baratto_locale_demo_reports";
const ADMIN_DEMO_KEY =
  import.meta.env.VITE_ADMIN_DEMO_KEY || "baratto-demo-admin";
const ADMIN_DEMO_URL = `/admin?key=${encodeURIComponent(ADMIN_DEMO_KEY)}`;

type DemoReport = {
  id: string;
  itemId: string;
  reason: string;
  details: string;
  createdAt: string;
};

function loadJsonArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredItems() {
  return loadJsonArray<Item>(LOCAL_ITEMS_KEY);
}

function saveStoredItems(items: Item[]) {
  localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
}

function loadStoredReports() {
  return loadJsonArray<DemoReport>(LOCAL_REPORTS_KEY);
}

function saveStoredReports(reports: DemoReport[]) {
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
}

function cleanTelegramUsername(value: FormDataEntryValue | string | null) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/t\.me\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/\/+$/, "");
}

function isKnownCitySlug(slug: string) {
  return cities.some((city) => city.slug === slug);
}

function App() {
  const [storedItems, setStoredItems] = useState<Item[]>(loadStoredItems);
  const [reports, setReports] = useState<DemoReport[]>(loadStoredReports);
  const items = useMemo(() => [...storedItems, ...mockItems], [storedItems]);
  const path = window.location.pathname;

  function createItem(item: Item) {
    const nextStoredItems = [item, ...loadStoredItems()];
    saveStoredItems(nextStoredItems);
    setStoredItems(nextStoredItems);
  }

  function createReport(report: DemoReport) {
    const nextStoredReports = [report, ...loadStoredReports()];
    saveStoredReports(nextStoredReports);
    setReports(nextStoredReports);
  }

  function clearStoredItems() {
    localStorage.removeItem(LOCAL_ITEMS_KEY);
    setStoredItems([]);
  }

  function clearReports() {
    localStorage.removeItem(LOCAL_REPORTS_KEY);
    setReports([]);
  }

  return (
    <>
      <Header />

      {path === "/" && <Home items={items} onClearStoredItems={clearStoredItems} />}
      {path === "/publish" && <Publish onCreate={createItem} />}
      {path === "/rules" && <Rules />}
      {path === "/privacy" && <Privacy />}
      {path === "/report" && (
        <Report items={items} onCreateReport={createReport} />
      )}
      {path === "/admin" &&
        (new URLSearchParams(window.location.search).get("key") ===
        ADMIN_DEMO_KEY ? (
          <Admin reports={reports} items={items} onClearReports={clearReports} />
        ) : (
          <AdminLocked />
        ))}
      {path.startsWith("/item/") && <ItemDetail items={items} />}
      {isCityPath(path) && <CityPage items={items} />}
    </>
  );
}

function Home({
  items,
  onClearStoredItems,
}: {
  items: Item[];
  onClearStoredItems: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesRegion = selectedRegion === "all" || item.city === selectedRegion;
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const haystack = [
        item.title,
        item.description,
        item.category,
        getCityName(item.city),
        item.wants,
      ]
        .join(" ")
        .toLowerCase();

      return matchesRegion && matchesCategory && (!query || haystack.includes(query));
    });
  }, [items, search, selectedRegion, selectedCategory]);

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">Demo gratuita no profit</p>
        <h1>Baratto locale tra amici, vicini e conoscenti.</h1>
        <p>
          Pubblica cio che non usi, indica cosa cerchi e contatta l'altra
          persona su Telegram. Il sito non gestisce chat, pagamenti o spedizioni.
        </p>

        <div className="actions">
          <a className="button" href={`/${siteConfig.defaultCitySlug}`}>
            Apri {siteConfig.defaultCityName}
          </a>
          <a className="button secondary" href="/publish">
            Pubblica annuncio
          </a>
          <a className="button ghost" href={ADMIN_DEMO_URL}>
            Admin demo
          </a>
        </div>
      </section>

      <section>
        <h2>Regioni disponibili</h2>
        <div className="chips">
          {cities.map((region) => (
            <a key={region.slug} href={`/${region.slug}`}>
              {region.name}
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="sectionTitleRow">
          <div>
            <h2>Annunci demo</h2>
            <p className="resultCount">
              {filteredItems.length} risultati su {items.length} annunci visibili
            </p>
          </div>

          <button className="textButton" type="button" onClick={onClearStoredItems}>
            Svuota annunci creati
          </button>
        </div>

        <div className="filterPanel" aria-label="Filtri annunci">
          <label>
            Cerca nella bacheca
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Es. libri, zaino, cuffie, giochi"
            />
          </label>

          <label>
            Regione
            <select
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
            >
              <option value="all">Tutte le regioni</option>
              {cities.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Categoria
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">Tutte le categorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="Nessun annuncio trovato"
            text="Prova a cambiare ricerca, regione o categoria. Puoi anche pubblicare tu il primo annuncio."
          />
        ) : (
          <div className="grid">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CityPage({ items }: { items: Item[] }) {
  const citySlug = window.location.pathname.replace("/", "");
  const cityName = getCityName(citySlug);
  const cityItems = useMemo(
    () => items.filter((item) => item.city === citySlug),
    [items, citySlug]
  );

  return (
    <main className="container">
      <section className="pageHead">
        <p className="eyebrow">Zona locale</p>
        <h1>Baratto in {cityName}</h1>
        <p>
          Annunci gratuiti, contatto Telegram esterno e scambi tra persone
          vicine. Nessuna chat interna, nessun pagamento.
        </p>
        <a className="button" href="/publish">
          Pubblica per questa regione
        </a>
      </section>

      <p className="resultCount">
        {cityItems.length} annunci disponibili in {cityName}
      </p>

      {cityItems.length === 0 ? (
        <EmptyState
          title={`Nessun annuncio in ${cityName}`}
          text="Quando qualcuno pubblichera un annuncio per questa regione, comparira qui."
        />
      ) : (
        <div className="grid">
          {cityItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="card emptyState">
      <AlertTriangle size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
      <a className="button small" href="/publish">
        Pubblica annuncio
      </a>
    </div>
  );
}

function Publish({ onCreate }: { onCreate: (item: Item) => void }) {
  const [done, setDone] = useState(false);
  const [lastItemId, setLastItemId] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const imageUrl = String(data.get("imageUrl") || "").trim();
    const telegramUsername = cleanTelegramUsername(data.get("telegram"));

    const item: Item = {
      id: crypto.randomUUID(),
      title: title || "Oggetto senza titolo",
      description: String(data.get("description") || "").trim(),
      city: String(data.get("city") || siteConfig.defaultCitySlug).toLowerCase(),
      category: String(data.get("category") || "Altro").trim(),
      wants: String(data.get("wants") || "Proposte di scambio").trim(),
      telegramUsername,
      imageUrl: imageUrl || undefined,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    onCreate(item);
    setDone(true);
    setLastItemId(item.id);
    form.reset();
  }

  return (
    <main className="container narrow">
      <section className="pageHead">
        <p className="eyebrow">Annuncio gratuito</p>
        <h1>Pubblica annuncio</h1>
        <p>
          La demo salva gli annunci nel localStorage del browser. Non usa
          Supabase, pagamenti o chat interna.
        </p>
      </section>

      {done && (
        <div className="notice">
          Annuncio creato.
          {lastItemId && (
            <a className="inlineLink" href={`/item/${lastItemId}`}>
              Aprilo ora
            </a>
          )}
        </div>
      )}

      <form className="card form" onSubmit={submit}>
        <label>
          Titolo
          <input
            name="title"
            required
            placeholder="Es. Libri, zaino, cuffie, giochi da tavolo"
          />
        </label>

        <label>
          Regione
          <select name="city" defaultValue={siteConfig.defaultCitySlug} required>
            {cities.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Categoria
          <select name="category" defaultValue="Altro" required>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          URL immagine opzionale
          <input name="imageUrl" type="url" placeholder="https://..." />
        </label>

        <label>
          Descrizione
          <textarea
            name="description"
            required
            placeholder="Condizioni, dettagli utili e zona indicativa. Non inserire dati sensibili."
          />
        </label>

        <label>
          Cosa cerchi in cambio
          <textarea
            name="wants"
            required
            placeholder="Es. libri, mouse, giochi, accessori casa"
          />
        </label>

        <label>
          Username Telegram
          <input
            name="telegram"
            required
            placeholder="@nomeutente, nomeutente oppure https://t.me/nomeutente"
          />
        </label>

        <div className="warning">
          Avviso: niente chat interna, niente pagamenti e niente spedizioni
          gestite dal sito. Il contatto avviene solo su Telegram.
        </div>

        <button className="button" type="submit">
          Crea annuncio demo
        </button>
      </form>
    </main>
  );
}

function ItemDetail({ items }: { items: Item[] }) {
  const id = window.location.pathname.split("/").pop() || "";
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return (
      <main className="container narrow">
        <EmptyState
          title="Annuncio non trovato"
          text="L'annuncio potrebbe essere stato rimosso o creato in un altro browser."
        />
      </main>
    );
  }

  const tg = cleanTelegramUsername(item.telegramUsername);

  return (
    <main className="container narrow">
      <article className="card detail">
        <div className="detailImageBox">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} />
          ) : (
            <span>Nessuna foto</span>
          )}
        </div>

        <p className="eyebrow">
          {item.category} · {getCityName(item.city)}
        </p>
        <h1>{item.title}</h1>
        <p>{item.description}</p>

        <dl className="detailList">
          <div>
            <dt>Regione</dt>
            <dd>{getCityName(item.city)}</dd>
          </div>
          <div>
            <dt>Cerca in cambio</dt>
            <dd>{item.wants}</dd>
          </div>
          <div>
            <dt>Stato</dt>
            <dd>{item.status === "available" ? "Disponibile" : item.status}</dd>
          </div>
        </dl>

        <div className="warning">
          Regole: incontrarsi in luogo pubblico, controllare l'oggetto dal vivo,
          non anticipare soldi e non condividere dati sensibili.
        </div>

        <div className="actions">
          <a
            className="button"
            href={`https://t.me/${tg}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Contatta su Telegram
          </a>
          <a className="button ghost" href={`/report?item=${item.id}`}>
            Segnala
          </a>
        </div>

        <a className="textLink" href="/rules">
          Leggi tutte le regole di scambio sicuro
        </a>
      </article>
    </main>
  );
}

function Rules() {
  return (
    <main className="container narrow">
      <section className="card">
        <h1>Regole di scambio sicuro</h1>
        <ul>
          <li>Scambia preferibilmente a mano e in luoghi pubblici.</li>
          <li>Controlla l'oggetto prima di concludere.</li>
          <li>Non inviare soldi, documenti o dati sensibili.</li>
          <li>Gli accordi avvengono direttamente tra utenti su Telegram.</li>
          <li>Segnala annunci sospetti dalla pagina dettaglio.</li>
        </ul>
      </section>
    </main>
  );
}

function Privacy() {
  return (
    <main className="container narrow">
      <section className="card">
        <h1>Privacy semplice</h1>
        <p>
          Questa demo gratuita e no profit salva annunci e segnalazioni solo nel
          localStorage del browser. Non legge e non conserva chat Telegram.
        </p>
        <p>
          Quando il progetto avra un backend reale, la privacy andra aggiornata
          con cancellazione dati e moderazione lato server.
        </p>
      </section>
    </main>
  );
}

function Report({
  items,
  onCreateReport,
}: {
  items: Item[];
  onCreateReport: (report: DemoReport) => void;
}) {
  const [sent, setSent] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("item") || "";
  const item = items.find((entry) => entry.id === itemId);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const report: DemoReport = {
      id: crypto.randomUUID(),
      itemId: itemId || "annuncio-non-specificato",
      reason: String(data.get("reason") || "altro"),
      details: String(data.get("details") || "").trim(),
      createdAt: new Date().toISOString(),
    };

    onCreateReport(report);
    setSent(true);
    form.reset();
  }

  return (
    <main className="container narrow">
      <section className="pageHead">
        <p className="eyebrow">Moderazione community</p>
        <h1>Segnala annuncio</h1>
        <p>
          Usa questa pagina per contenuti sospetti, offensivi o non adatti a
          una bacheca no profit di scambio locale.
        </p>
      </section>

      {sent && (
        <div className="notice">
          Segnalazione demo salvata. La trovi nella pagina Admin demo.
        </div>
      )}

      <form className="card form" onSubmit={submit}>
        <label>
          Annuncio
          <input value={item ? `${item.title} (${item.id})` : itemId || "Non specificato"} readOnly />
        </label>

        <label>
          Motivo
          <select name="reason" required defaultValue="">
            <option value="" disabled>
              Scegli un motivo
            </option>
            <option value="truffa">Sospetta truffa</option>
            <option value="oggetto-vietato">Oggetto vietato o pericoloso</option>
            <option value="spam">Spam o annuncio falso</option>
            <option value="offensivo">Contenuto offensivo</option>
            <option value="telegram-sospetto">Contatto Telegram sospetto</option>
            <option value="altro">Altro</option>
          </select>
        </label>

        <label>
          Dettagli
          <textarea
            name="details"
            required
            placeholder="Scrivi cosa hai notato. Non inserire dati sensibili."
          />
        </label>

        <div className="warning">
          Le segnalazioni sono salvate solo nel browser per questa demo. Le chat
          Telegram restano fuori dalla piattaforma.
        </div>

        <button className="button" type="submit">
          Invia segnalazione demo
        </button>
      </form>
    </main>
  );
}

function Admin({
  reports,
  items,
  onClearReports,
}: {
  reports: DemoReport[];
  items: Item[];
  onClearReports: () => void;
}) {
  return (
    <main className="container">
      <section className="pageHead">
        <p className="eyebrow">Pannello locale demo</p>
        <h1>Admin demo</h1>
        <p>
          Qui vedi annunci e segnalazioni salvati nel browser. Non e un pannello
          di produzione.
        </p>
      </section>

      <section className="adminStats">
        <div className="card statCard">
          <span>Annunci visibili</span>
          <strong>{items.length}</strong>
        </div>
        <div className="card statCard">
          <span>Segnalazioni</span>
          <strong>{reports.length}</strong>
        </div>
        <div className="card statCard">
          <span>Pagamenti gestiti</span>
          <strong>0</strong>
        </div>
      </section>

      <section>
        <div className="sectionTitleRow">
          <h2>Segnalazioni ricevute</h2>
          <button className="textButton dangerButton" type="button" onClick={onClearReports}>
            <Trash2 size={16} />
            Svuota segnalazioni
          </button>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title="Nessuna segnalazione"
            text="Quando un utente segnala un annuncio, la scheda comparira qui."
          />
        ) : (
          <div className="reportList">
            {reports.map((report) => {
              const item = items.find((entry) => entry.id === report.itemId);

              return (
                <article className="card reportCard" key={report.id}>
                  <p className="eyebrow">
                    {new Date(report.createdAt).toLocaleString("it-IT")}
                  </p>
                  <h3>{item?.title || "Annuncio non trovato"}</h3>
                  <p>
                    <strong>ID annuncio:</strong> {report.itemId}
                  </p>
                  <p>
                    <strong>Motivo:</strong> {report.reason}
                  </p>
                  <p>
                    <strong>Dettagli:</strong> {report.details}
                  </p>
                  <a className="textLink" href={`/item/${report.itemId}`}>
                    Apri annuncio segnalato
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function AdminLocked() {
  return (
    <main className="container narrow">
      <section className="card lockedCard">
        <p className="eyebrow">Accesso limitato</p>
        <h1>Area admin demo protetta</h1>
        <p>Aggiungi la chiave all'URL per accedere.</p>
        <code>/admin?key=baratto-demo-admin</code>
        <div className="warning">
          Questa e solo una protezione demo. La versione reale usera login e
          permessi.
        </div>
      </section>
    </main>
  );
}

function isCityPath(path: string) {
  const slug = path.replace("/", "");
  return isKnownCitySlug(slug);
}

createRoot(document.getElementById("root")!).render(<App />);
