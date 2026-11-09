"use client";

import Image from "next/image";
import { MapPin, Star, Store, ArrowRight } from "lucide-react";

export type MagasinGoogle = {
  place_id: string;
  title: string;
  address?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  thumbnail?: string;
  type?: string | string[];
  open_state?: string;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  phone?: string;
  website?: string;
  hours?: string | Record<string, unknown>;
  description?: string;
  thumbnail_large?: string;
};

type Props = {
  magasins: MagasinGoogle[];
  onSelectionner: (magasin: MagasinGoogle) => void;
};

export default function OffresExternes({ magasins, onSelectionner }: Props) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Store size={19} className="text-[#F39A27]" />

            <h2 className="text-lg font-extrabold text-[#10243A]">
              Commerces à découvrir
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Découvrez les établissements qui correspondent à votre recherche.
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#10243A] shadow-sm">
          {magasins.length} commerces
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5">
        {magasins.map((magasin) => {
          const categorie = Array.isArray(magasin.type)
            ? magasin.type[0]
            : magasin.type;

          return (
            <button
              key={magasin.place_id}
              type="button"
              onClick={() => onSelectionner(magasin)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-[#F39A27]/60 hover:shadow-xl"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
                {magasin.thumbnail ? (
                  <Image
                    src={magasin.thumbnail}
                    alt={magasin.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Store size={35} className="text-slate-300" />
                )}

                {magasin.open_state && (
                  <span className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-bold text-[#10243A] shadow-sm">
                    {magasin.open_state}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                {categorie && (
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#F39A27]">
                    {categorie}
                  </p>
                )}

                <h3 className="mt-1 line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#10243A] sm:text-sm">
                  {magasin.title}
                </h3>

                <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
                  <MapPin
                    size={13}
                    className="mt-0.5 shrink-0 text-[#F39A27]"
                  />

                  <span className="line-clamp-2">
                    {magasin.address || "Adresse non disponible"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  {magasin.price && (
                    <span className="truncate text-sm font-extrabold text-[#10243A]">
                      {magasin.price}
                    </span>
                  )}

                  {magasin.rating !== undefined && (
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#10243A] sm:text-xs">
                      <Star
                        size={13}
                        className="fill-[#F39A27] text-[#F39A27]"
                      />

                      {magasin.rating}

                      {magasin.reviews !== undefined && (
                        <span className="font-normal text-slate-400">
                          ({magasin.reviews.toLocaleString("fr-FR")})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 mt-4 text-[11px] font-bold text-[#F39A27] transition group-hover:text-[#10243A]">
                  Voir les détails
                  <ArrowRight size={13} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
