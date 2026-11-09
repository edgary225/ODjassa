import { NextRequest, NextResponse } from "next/server";


type MagasinGoogle = {
  position?: number;
  place_id?: string;
  title?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  thumbnail?: string;
  thumbnail_large?: string;
  phone?: string;
  website?: string;

  links?: {
    phone?: string;
    website?: string;
  };

  type?: string | string[];
  open_state?: string;

  hours?: string | Record<string, unknown>;

  description?: string;
  service_options?: unknown;
  about?: unknown;
  extensions?: unknown;

  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };

  photos?: Array<{
    thumbnail?: string;
    image?: string;
    title?: string;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const recherche = request.nextUrl.searchParams.get("q")?.trim();
    const placeId = request.nextUrl.searchParams.get("place_id")?.trim();

    const cleApi = process.env.SERPAPI_KEY;

    if (!cleApi) {
      return NextResponse.json(
        { erreur: "La clé API SerpApi est introuvable." },
        { status: 500 },
      );
    }

    // recuperation des details d'un etablissement
    if (placeId) {
      const parametres = new URLSearchParams({
        engine: "google_maps",
        type: "place",
        place_id: placeId,
        api_key: cleApi,
      });

      const reponse = await fetch(
        `https://serpapi.com/search.json?${parametres.toString()}`,
        {
          next: {
            revalidate: 1800,
          },
        },
      );

      const donnees = await reponse.json();

      if (!reponse.ok || donnees.error) {
        console.error("Erreur details Google Maps :", donnees.error);

        return NextResponse.json(
          {
            erreur: "Impossible de récupérer les détails de cet établissement.",
          },
          { status: 502 },
        );
      }

      const etablissement: MagasinGoogle = donnees.place_results ?? {};

      return NextResponse.json({
        place_id: etablissement.place_id ?? placeId,
        title: etablissement.title ?? "Établissement sans nom",
        address: etablissement.address,
        rating: etablissement.rating,
        reviews: etablissement.reviews,
        price: etablissement.price,
        thumbnail: etablissement.thumbnail,
        thumbnail_large: etablissement.thumbnail_large,
        phone: etablissement.phone,
        website: etablissement.website,
        type: etablissement.type,
        open_state: etablissement.open_state,
        hours: etablissement.hours,
        description: etablissement.description,
        service_options: etablissement.service_options,
        about: etablissement.about,
        extensions: etablissement.extensions,
        gps_coordinates: etablissement.gps_coordinates,
      });
    }

    // recherche generale des etablissements
    if (!recherche) {
      return NextResponse.json(
        { erreur: "Veuillez saisir une recherche ou un place_id." },
        { status: 400 },
      );
    }

    const parametres = new URLSearchParams({
      engine: "google_maps",
      type: "search",
      q: `${recherche} Côte d'Ivoire`,
      api_key: cleApi,
    });

    const reponse = await fetch(
      `https://serpapi.com/search.json?${parametres.toString()}`,
      {
        next: {
          revalidate: 1800,
        },
      },
    );

    const donnees = await reponse.json();

    if (!reponse.ok || donnees.error) {
      console.error("Erreur recherche Google Maps :", donnees.error);

      return NextResponse.json(
        {
          erreur: "Impossible de récupérer les établissements locaux.",
        },
        { status: 502 },
      );
    }

    const magasins: MagasinGoogle[] = (donnees.local_results ?? []).map(
      (magasin: MagasinGoogle) => ({
        position: magasin.position,
        place_id: magasin.place_id,
        title: magasin.title ?? "Établissement sans nom",
        address: magasin.address ?? "Adresse non disponible",
        rating: magasin.rating,
        reviews: magasin.reviews,
        price: magasin.price,
        thumbnail: magasin.thumbnail ?? "",
        thumbnail_large: magasin.thumbnail_large ?? magasin.thumbnail ?? "",
        phone: magasin.phone ?? magasin.links?.phone,
        website: magasin.website ?? magasin.links?.website,
        type: magasin.type,
        open_state: magasin.open_state,
        hours: magasin.hours,
        description: magasin.description,
        service_options: magasin.service_options,
        about: magasin.about,
        extensions: magasin.extensions,
        gps_coordinates: magasin.gps_coordinates,
      }),
    );

    return NextResponse.json({
      recherche,
      total: magasins.length,
      magasins,
    });
  } catch (erreur) {
    console.error("Erreur Google Maps :", erreur);

    return NextResponse.json(
      { erreur: "Une erreur interne est survenue." },
      { status: 500 },
    );
  }
}
