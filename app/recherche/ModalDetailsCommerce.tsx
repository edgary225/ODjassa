"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  Globe,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Store,
  X,
} from "lucide-react";
import { suivreInteraction } from "@/app/analytics";

export type CommerceAvecDetails = {
  place_id: string | null;
  title: string;
  address?: string | null;
  rating?: number | null;
  reviews?: number | null;
  price?: string | null;
  thumbnail?: string | null;
  thumbnail_large?: string | null;
  phone?: string | null;
  website?: string | null;
  hours?: string | Record<string, unknown> | null;
  description?: string | null;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  } | null;
};

type Props = {
  commerce: CommerceAvecDetails;
  onClose: () => void;
};

type ReponseDetails = Partial<CommerceAvecDetails> & {
  erreur?: string;
};

function formaterHoraires(horaires: CommerceAvecDetails["hours"]) {
  if (!horaires) return "";
  if (typeof horaires === "string") return horaires;

  const jours: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };
  const lignes: string[] = [];

  function ajouterLigne(jour: string, horaire: unknown) {
    if (typeof horaire === "object" && horaire !== null) {
      if (Array.isArray(horaire)) {
        lignes.push(`${jours[jour.toLowerCase()] ?? jour} : ${horaire.join(", ")}`);
        return;
      }

      for (const [jourInterne, horaireInterne] of Object.entries(horaire)) {
        ajouterLigne(jourInterne, horaireInterne);
      }
      return;
    }

    const nomJour =
      jours[jour.toLowerCase()] ??
      (Number.isInteger(Number(jour)) ? "" : jour);
    const valeur = String(horaire)
      .replace(/\bOpen 24 hours\b/gi, "Ouvert 24 h/24")
      .replace(/\bOpen\b/gi, "Ouvert")
      .replace(/\bCloses\b/gi, "Ferme")
      .replace(/\bClosed\b/gi, "Fermé")
      .replace(
        /\(National Peace Day might affect these hours\)/gi,
        "(la Journée nationale de la paix peut modifier ces horaires)",
      );

    lignes.push(nomJour ? `${nomJour} : ${valeur}` : valeur);
  }

  for (const [jour, horaire] of Object.entries(horaires)) {
    ajouterLigne(jour, horaire);
  }

  return lignes.join("\n");
}

export default function ModalDetailsCommerce({ commerce, onClose }: Props) {
  const placeId = commerce.place_id;
  const [details, setDetails] = useState<ReponseDetails | null>(null);
  const [chargement, setChargement] = useState(Boolean(placeId));
  const [erreur, setErreur] = useState(
    placeId ? "" : "Identifiant de cet établissement indisponible.",
  );

  useEffect(() => {
    if (!placeId) return;
    const id = placeId;

    const controleur = new AbortController();

    async function chargerDetails() {
      try {
        const reponse = await fetch(
          `/api/recherche?place_id=${encodeURIComponent(id)}`,
          { cache: "no-store", signal: controleur.signal },
        );
        const donnees: ReponseDetails = await reponse.json();

        if (!reponse.ok) {
          throw new Error(
            donnees.erreur ?? "Impossible de récupérer les détails.",
          );
        }

        setDetails(donnees);
      } catch (cause) {
        if (controleur.signal.aborted) return;
        setErreur(
          cause instanceof Error ? cause.message : "Une erreur est survenue.",
        );
      } finally {
        if (!controleur.signal.aborted) setChargement(false);
      }
    }

    void chargerDetails();
    return () => controleur.abort();
  }, [placeId]);

  const fiche = {
    ...commerce,
    ...details,
    address: details?.address ?? commerce.address,
    rating: details?.rating ?? commerce.rating,
    reviews: details?.reviews ?? commerce.reviews,
    price: details?.price ?? commerce.price,
    thumbnail: details?.thumbnail ?? commerce.thumbnail,
    thumbnail_large: details?.thumbnail_large ?? commerce.thumbnail_large,
    phone: details?.phone ?? commerce.phone,
    website: details?.website ?? commerce.website,
    hours: details?.hours ?? commerce.hours,
    description: details?.description ?? commerce.description,
    gps_coordinates: details?.gps_coordinates ?? commerce.gps_coordinates,
  };
  const telephone = fiche.phone;
  const siteWeb = fiche.website;
  const lienWhatsApp =
    siteWeb?.includes("wa.me") || siteWeb?.includes("api.whatsapp.com")
      ? siteWeb
      : null;
  const coordonnees = fiche.gps_coordinates;
  const urlMaps =
    coordonnees?.latitude != null && coordonnees.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${coordonnees.latitude},${coordonnees.longitude}`
      : fiche.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fiche.address)}`
        : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-commerce"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <p className="text-sm font-bold text-[#10243A]">Fiche du commerce</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        {chargement && (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4">
            <LoaderCircle
              size={35}
              className="animate-spin text-[#F39A27]"
            />
            <p className="text-sm font-semibold text-[#10243A]">
              Chargement de la fiche du commerce...
            </p>
          </div>
        )}

        {!chargement && erreur && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <p className="mt-3 text-sm text-red-600">{erreur}</p>
          </div>
        )}

        {!chargement && !erreur && (
          <div>
            <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-72">
              {fiche.thumbnail_large || fiche.thumbnail ? (
                <Image
                  src={fiche.thumbnail_large || fiche.thumbnail || ""}
                  alt={fiche.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 672px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Store size={45} className="text-slate-300" />
                </div>
              )}
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div>
                <h2
                  id="titre-commerce"
                  className="text-2xl font-extrabold text-[#10243A]"
                >
                  {fiche.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {fiche.rating != null && (
                    <span className="flex items-center gap-1 text-sm font-bold text-[#10243A]">
                      <Star
                        size={16}
                        className="fill-[#F39A27] text-[#F39A27]"
                      />
                      {fiche.rating}
                      {fiche.reviews != null && (
                        <span className="font-normal text-slate-500">
                          ({fiche.reviews.toLocaleString("fr-FR")} avis)
                        </span>
                      )}
                    </span>
                  )}
                  {fiche.price && (
                    <span className="text-sm font-bold text-[#10243A]">
                      {fiche.price}
                    </span>
                  )}
                </div>
              </div>

              {fiche.description && (
                <p className="text-sm leading-6 text-slate-600">
                  {fiche.description}
                </p>
              )}

              <div className="space-y-4">
                {fiche.address && (
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 shrink-0 text-[#F39A27]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Adresse
                      </p>
                      <p className="mt-1 text-sm text-[#10243A]">
                        {fiche.address}
                      </p>
                    </div>
                  </div>
                )}
                {telephone && (
                  <div className="flex gap-3">
                    <Phone className="shrink-0 text-[#F39A27]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Téléphone
                      </p>
                      <a
                        href={`tel:${telephone}`}
                        onClick={() =>
                          suivreInteraction("store_action_clicked", {
                            action: "phone",
                          })
                        }
                        className="mt-1 block text-sm font-semibold text-[#10243A]"
                      >
                        {telephone}
                      </a>
                    </div>
                  </div>
                )}
                {siteWeb && !lienWhatsApp && (
                  <div className="flex gap-3">
                    <Globe className="shrink-0 text-[#F39A27]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Site web
                      </p>
                      <a
                        href={siteWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          suivreInteraction("store_action_clicked", {
                            action: "website",
                          })
                        }
                        className="mt-1 block break-all text-sm font-semibold text-[#10243A]"
                      >
                        {siteWeb}
                      </a>
                    </div>
                  </div>
                )}
                {fiche.hours && (
                  <div className="flex gap-3">
                    <Clock className="shrink-0 text-[#F39A27]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Horaires
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#10243A]">
                        {formaterHoraires(fiche.hours)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                {telephone && (
                  <a
                    href={`tel:${telephone}`}
                    onClick={() =>
                      suivreInteraction("store_action_clicked", {
                        action: "phone",
                      })
                    }
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10243A] px-4 text-sm font-bold text-white"
                  >
                    <Phone size={17} />
                    Appeler
                  </a>
                )}
                {lienWhatsApp && (
                  <a
                    href={lienWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      suivreInteraction("store_action_clicked", {
                        action: "whatsapp",
                      })
                    }
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white"
                  >
                    <MessageCircle size={17} />
                    WhatsApp
                  </a>
                )}
                {urlMaps && (
                  <a
                    href={urlMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      suivreInteraction("store_action_clicked", {
                        action: "maps",
                      })
                    }
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F39A27] px-4 text-sm font-bold text-[#10243A]"
                  >
                    <MapPin size={17} />
                    Voir sur Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
