"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  nom: string;
};

export default function GalerieProduit({ images, nom }: Props) {
  const [imageActive, setImageActive] = useState(images[0]);

  return (
    <div className="w-full">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F5F7FA]">
        <Image
          src={imageActive}
          alt={nom}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8"
        />

        <span className="absolute left-4 top-4 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
          Disponible
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setImageActive(image)}
              aria-label={`Afficher l'image ${index + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F5F7FA] transition ${
                imageActive === image
                  ? "border-[#F39A27]"
                  : "border-transparent hover:border-slate-300"
              }`}
            >
              <Image
                src={image}
                alt={`${nom} - vue ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
