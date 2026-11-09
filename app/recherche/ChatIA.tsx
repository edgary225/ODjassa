"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, Send, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import ModalDetailsCommerce, {
  type CommerceAvecDetails,
} from "./ModalDetailsCommerce";

type Magasin = {
  place_id: string | null;
  title: string;
  address?: string | null;
  rating?: number | null;
  reviews?: number | null;
  price?: string | null;
  thumbnail?: string | null;
  type?: string | string[] | null;
  open_state?: string | null;
  phone?: string | null;
  website?: string | null;
  hours?: string | Record<string, unknown> | null;
  description?: string | null;
  thumbnail_large?: string | null;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  } | null;
};

type AnalyseIntention = {
  intention: string;
  action: string;
  categorie: string;
  localisation: string;
  criteres: string[];
  recherche_serpapi: string;
  reponse_directe: string;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
  magasins?: Magasin[];
};

type MessageHistorique = {
  role: "assistant" | "user";
  content: string;
};

type ReponseAssistant = {
  answer?: string;
  magasins?: Magasin[];
  analyse?: AnalyseIntention;
  error?: string;
  code?: string;
};

type ErreurChat = {
  message: string;
  code: string;
};

type Props = {
  rechercheInitiale: string;
};

function messageErreur(code?: string) {
  switch (code) {
    case "RATE_LIMIT":
      return "La limite de requêtes a été atteinte. Patientez quelques instants, puis réessayez.";
    case "AI_UNAVAILABLE":
      return "L’assistant ne peut pas répondre pour le moment. Réessayez dans quelques instants.";
    case "SEARCH_UNAVAILABLE":
      return "Le service de recherche est temporairement indisponible. Réessayez un peu plus tard.";
    case "SERVICE_UNAVAILABLE":
      return "L’assistant est momentanément indisponible. Réessayez un peu plus tard.";
    case "INVALID_REQUEST":
      return "Votre message n’a pas pu être traité. Reformulez-le puis réessayez.";
    case "NETWORK":
      return "La connexion au service a échoué. Vérifiez votre connexion Internet puis réessayez.";
    default:
      return "Une erreur inattendue est survenue. Réessayez dans quelques instants.";
  }
}

function erreurTemporaire(code: string) {
  return [
    "RATE_LIMIT",
    "AI_UNAVAILABLE",
    "SEARCH_UNAVAILABLE",
    "SERVICE_UNAVAILABLE",
    "NETWORK",
    "INTERNAL_ERROR",
  ].includes(code);
}

export default function ChatIA({ rechercheInitiale }: Props) {
  const [messages, setMessages] = useState<Message[]>(() =>
    rechercheInitiale
      ? [{ id: 0, role: "user", content: rechercheInitiale }]
      : [
          {
            id: 0,
            role: "assistant",
            content:
              "Parlez-nous de votre recherche : quel commerce, service ou lieu souhaitez-vous trouver, et dans quel quartier ?",
          },
        ],
  );

  const [saisie, setSaisie] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<ErreurChat | null>(null);
  const [commerceSelectionne, setCommerceSelectionne] =
    useState<CommerceAvecDetails | null>(null);
  const [reponsesEtendues, setReponsesEtendues] = useState<Set<number>>(
    () => new Set(),
  );

  // Conserver la dernière analyse pour comprendre les messages suivants.
  const [contexteRecherche, setContexteRecherche] =
    useState<AnalyseIntention | null>(null);

  const prochainId = useRef(1);
  const rechercheInitialeLancee = useRef(false);
  const zoneConversation = useRef<HTMLDivElement>(null);
  const derniereRequete = useRef<MessageHistorique[] | null>(null);

  const rechercher = useCallback(
    async (historique: MessageHistorique[]) => {
      derniereRequete.current = historique;
      setChargement(true);
      setErreur(null);

      try {
        const reponse = await fetch("/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: historique,
            contexteRecherche,
          }),
        });

        const donnees: ReponseAssistant = await reponse.json();

        if (!reponse.ok) {
          const code = donnees.code ?? "INTERNAL_ERROR";
          setErreur({ code, message: messageErreur(code) });
          return;
        }

        setErreur(null);
        if (donnees.analyse) {
          setContexteRecherche(donnees.analyse);
        }

        const magasins = Array.isArray(donnees.magasins)
          ? donnees.magasins
          : [];

        setMessages((precedents) => [
          ...precedents,
          {
            id: prochainId.current++,
            role: "assistant",
            content:
              donnees.answer ||
              "Je n'ai pas pu formuler une réponse. Pouvez-vous reformuler votre demande ?",
            magasins,
          },
        ]);
      } catch {
        setErreur({ code: "NETWORK", message: messageErreur("NETWORK") });
      } finally {
        setChargement(false);
      }
    },
    [contexteRecherche],
  );

  // Lancer automatiquement la recherche initiale.
  useEffect(() => {
    if (!rechercheInitiale || rechercheInitialeLancee.current) return;

    rechercheInitialeLancee.current = true;

    void rechercher([
      {
        role: "user",
        content: rechercheInitiale,
      },
    ]);
  }, [rechercheInitiale, rechercher]);

  // Garder la conversation visible sur le dernier message.
  useEffect(() => {
    const zone = zoneConversation.current;
    if (!zone) return;

    zone.scrollTo({
      top: zone.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chargement]);

  async function envoyerMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = saisie.trim();

    if (!question || chargement) return;

    setSaisie("");
    setErreur(null);

    const nouveauMessage: Message = {
      id: prochainId.current++,
      role: "user",
      content: question,
    };

    const historique: MessageHistorique[] = [
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: question,
      },
    ];

    setMessages((precedents) => [...precedents, nouveauMessage]);

    await rechercher(historique);
  }

  return (
    <main className="flex h-[100svh] flex-col overflow-hidden bg-white">
      <header className="flex items-center gap-4 border-b border-slate-200 px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label="Retour à l’accueil"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#10243A]"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 text-white">
          <Sparkles size={21} />
        </div>

        <div>
          <h1 className="font-bold text-[#10243A]">Assistant ODJASSA</h1>
          <p className="text-xs text-slate-500">
            À votre écoute pour trouver près de vous
          </p>
        </div>

        <span className="ml-auto hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
          <span className="size-2 rounded-full bg-emerald-500" />
          En ligne
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={zoneConversation}
          aria-live="polite"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
            {messages.map((message) => (
            <article
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                  message.role === "user"
                    ? "rounded-br-md bg-[#10243A] text-white"
                    : "text-[#10243A]"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {message.content}
                </p>

                {message.magasins && message.magasins.length > 0 && (
                  <>
                    <div className="mt-3 grid gap-2">
                    {message.magasins
                      .slice(
                        0,
                        reponsesEtendues.has(message.id)
                          ? message.magasins.length
                          : 5,
                      )
                      .map((magasin, index) => (
                      <button
                        type="button"
                        key={magasin.place_id || `${magasin.title}-${index}`}
                        onClick={() => setCommerceSelectionne(magasin)}
                        aria-label={`Afficher les détails de ${magasin.title}`}
                        className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:shadow-sm"
                      >
                        {magasin.thumbnail ? (
                          <img
                            src={magasin.thumbnail}
                            alt=""
                            className="size-14 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <Store
                            size={18}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#10243A]">
                            {magasin.title}
                          </span>

                          {magasin.address && (
                            <span className="mt-1 flex items-start gap-1 text-xs leading-5 text-slate-500">
                              <MapPin size={13} className="mt-0.5 shrink-0" />
                              {magasin.address}
                            </span>
                          )}

                          {magasin.price && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {magasin.price}
                            </span>
                          )}

                          {magasin.open_state && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {magasin.open_state}
                            </span>
                          )}

                          {magasin.reviews != null && (
                            <span className="mt-1 block text-xs text-slate-400">
                              {magasin.reviews} avis
                            </span>
                          )}
                        </span>

                        {magasin.rating != null && (
                          <span className="shrink-0 text-xs font-semibold text-amber-600">
                            ★ {magasin.rating}
                          </span>
                        )}
                      </button>
                    ))}
                    </div>
                    {message.magasins.length > 5 && (
                      <button
                        type="button"
                        aria-expanded={reponsesEtendues.has(message.id)}
                        onClick={() =>
                          setReponsesEtendues((precedentes) => {
                            const suivantes = new Set(precedentes);
                            if (suivantes.has(message.id)) {
                              suivantes.delete(message.id);
                            } else {
                              suivantes.add(message.id);
                            }
                            return suivantes;
                          })
                        }
                        className="mt-3 text-sm font-semibold text-[#D97706] transition hover:text-[#10243A]"
                      >
                        {reponsesEtendues.has(message.id)
                          ? "Voir moins"
                          : `Voir plus (${message.magasins.length - 5} autres résultats)`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
            ))}

            {chargement && (
              <div className="flex items-center gap-2 self-start rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                <span className="size-2 animate-pulse rounded-full bg-blue-500" />
                ODJASSA analyse votre demande...
              </div>
            )}

            {erreur && (
              <div
                role="alert"
                className="self-start rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <p>{erreur.message}</p>
                {erreurTemporaire(erreur.code) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (derniereRequete.current) {
                        void rechercher(derniereRequete.current);
                      }
                    }}
                    className="mt-2 font-bold underline underline-offset-2 hover:text-red-900"
                  >
                    Réessayer
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white/95 px-4 pb-4 pt-3 backdrop-blur sm:px-6 sm:pb-5">
          <div className="mx-auto max-w-3xl">
            {messages.length === 1 && !rechercheInitiale && (
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {["Un restaurant à Cocody", "Un coiffeur à Abidjan"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setSaisie(suggestion)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-[#F39A27] hover:text-[#10243A]"
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>
            )}

            <form
              onSubmit={envoyerMessage}
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-[#F39A27] focus-within:shadow-md"
            >
              <input
                type="text"
                value={saisie}
                onChange={(event) => setSaisie(event.target.value)}
                placeholder="Décrivez ce que vous cherchez..."
                aria-label="Votre message à l’assistant"
                disabled={chargement}
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#10243A] outline-none placeholder:text-slate-400 disabled:opacity-60 sm:text-base"
              />

              <button
                type="submit"
                aria-label="Envoyer le message"
                disabled={!saisie.trim() || chargement}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F39A27] text-[#10243A] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Les adresses proposées sont issues de la recherche locale ODJASSA.
            </p>
          </div>
        </div>
      </div>
      {commerceSelectionne && (
        <ModalDetailsCommerce
          key={commerceSelectionne.place_id ?? commerceSelectionne.title}
          commerce={commerceSelectionne}
          onClose={() => setCommerceSelectionne(null)}
        />
      )}
    </main>
  );
}
