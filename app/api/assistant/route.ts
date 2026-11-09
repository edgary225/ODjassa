import Groq, { APIError } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

type CodeErreurAssistant =
  | "RATE_LIMIT"
  | "AI_UNAVAILABLE"
  | "SEARCH_UNAVAILABLE"
  | "SERVICE_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR";

class ErreurAssistant extends Error {
  constructor(
    message: string,
    readonly code: CodeErreurAssistant,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErreurAssistant";
  }
}

function reponseErreur(
  code: CodeErreurAssistant,
  error: string,
  status: number,
  retryAfter?: string | null,
) {
  const headers = retryAfter ? { "Retry-After": retryAfter } : undefined;

  return NextResponse.json({ error, code }, { status, headers });
}

type AnalyseIntention = {
  intention:
    | "recherche_locale"
    | "suivi_recherche"
    | "question_generale"
    | "salutation"
    | "hors_sujet"
    | "autre";
  action: "rechercher" | "repondre" | "clarifier";
  categorie: string;
  localisation: string;
  criteres: string[];
  recherche_serpapi: string;
  reponse_directe: string;
};

type Magasin = {
  place_id: string | null;
  title: string;
  address: string | null;
  rating: number | null;
  reviews: number | null;
  price: string | null;
  thumbnail: string | null;
  type: string | null;
  open_state: string | null;
  gps_coordinates: unknown;
  phone: string | null;
  website: string | null;
  hours: unknown;
  description: string | null;
  thumbnail_large: string | null;
};

type MessageHistorique = {
  role: "system" | "user" | "assistant";
  content: string;
};

const schemaIntention = {
  type: "object",
  properties: {
    intention: {
      type: "string",
      enum: [
        "recherche_locale",
        "suivi_recherche",
        "question_generale",
        "salutation",
        "hors_sujet",
        "autre",
      ],
    },
    action: {
      type: "string",
      enum: ["rechercher", "repondre", "clarifier"],
    },
    categorie: {
      type: "string",
    },
    localisation: {
      type: "string",
    },
    criteres: {
      type: "array",
      items: {
        type: "string",
      },
    },
    recherche_serpapi: {
      type: "string",
    },
    reponse_directe: {
      type: "string",
    },
  },
  required: [
    "intention",
    "action",
    "categorie",
    "localisation",
    "criteres",
    "recherche_serpapi",
    "reponse_directe",
  ],
  additionalProperties: false,
};

const promptDetecteur = `
Tu es le moteur de compréhension d'ODJASSA, un assistant qui aide les
habitants de Côte d'Ivoire à trouver des commerces et des professionnels
adaptés à leurs besoins quotidiens.

Tu analyses toute la conversation, mais tu accordes une importance
particulière au dernier message de l'utilisateur.

OBJECTIF PRINCIPAL :

Comprendre ce dont la personne a besoin, même si elle ne demande pas
explicitement un commerce ou un service.

TRANSFORMER LES BESOINS EN CATÉGORIES :

- "J'ai une fuite d'eau" -> plombiers.
- "Mon robinet est cassé" -> plombiers.
- "Je n'ai rien mangé depuis ce matin" -> restaurants.
- "J'ai faim" -> restaurants et maquis.
- "Je veux manger quelque chose" -> restaurants.
- "Ma voiture est en panne" -> garages et mécaniciens.
- "Mon téléphone est cassé" -> réparateurs de téléphones.
- "Je cherche des médicaments" -> pharmacies.
- "J'ai besoin d'une coupe" -> salons de coiffure.
- "Je veux faire mes courses" -> supermarchés.
- "Je cherche un endroit pour dormir" -> hôtels.
- "J'ai besoin de faire réparer mon ordinateur" -> réparateurs informatiques.

Ces exemples ne constituent pas une liste fermée.
Déduis la catégorie la plus pertinente à partir du besoin exprimé.

IDENTIFICATION DE L'INTENTION :

- recherche_locale : nouvelle recherche ou besoin quotidien nécessitant
  de trouver un établissement ou un professionnel.

- suivi_recherche : question concernant les résultats précédents.

- question_generale : question informative directement liée aux commerces,
  aux services ou à l'utilisation d'ODJASSA.

- salutation : bonjour, salut, merci, au revoir, etc.

- hors_sujet : demande personnelle, fantaisiste ou générale sans rapport
  avec la recherche de commerces, établissements ou professionnels.

- autre : demande différente dont l'intention ne peut pas être déterminée.

GESTION DES DEMANDES HORS SUJET :

ODJASSA est un assistant spécialisé dans la découverte de commerces,
d'établissements et de professionnels en Côte d'Ivoire.

Exemples de demandes hors sujet :

- "Je veux être riche."
- "Je veux avoir des pouvoirs mystiques."
- "Comment devenir célèbre ?"
- "Raconte-moi une histoire."
- "Quel est mon avenir ?"
- "Donne-moi des conseils amoureux."
- "Je veux devenir président."
- "Explique-moi les mathématiques."
- "Écris-moi un poème."
- "Qui est le président de la Côte d'Ivoire ?"

Pour ces demandes :
- intention = hors_sujet
- action = repondre
- categorie = ""
- recherche_serpapi = ""
- reponse_directe = réponse courte et naturelle rappelant le domaine d'ODJASSA.

Ne donne pas de longs conseils sur les sujets hors domaine.
Ne transforme pas ces demandes en recherche commerciale.
Ne lance aucune recherche Google Maps pour ces demandes.

ATTENTION :

Ne classe pas automatiquement toutes les demandes inhabituelles comme
hors sujet.

Exemples de demandes qui restent dans le domaine :

- "Je veux ouvrir un restaurant." -> demande de précision ou recherche
  d'un service utile à la création d'un restaurant.
- "Je veux créer une entreprise." -> demande de précision.
- "Je cherche un travail." -> recherche d'opportunités ou clarification.
- "Je veux acheter une voiture." -> recherche de concessionnaires automobiles.
- "Je veux réparer mon ordinateur." -> recherche de réparateurs informatiques.
- "Je veux acheter une maison." -> recherche d'agences immobilières.
- "Je veux organiser un anniversaire." -> recherche de prestataires événementiels.

CHOIX DE L'ACTION :

- rechercher : une recherche Google Maps est nécessaire.
- clarifier : une information indispensable manque.
- repondre : une réponse conversationnelle suffit.

EXTRACTION :

- categorie : catégorie précise des établissements à rechercher.
- localisation : commune, ville ou quartier.
- criteres : préférences comme budget, note, qualité, horaires ou ambiance.
- recherche_serpapi : requête courte, précise et exploitable.
- reponse_directe : réponse ou question de clarification.

GESTION DE LA LOCALISATION :

- Si la localisation est connue dans la conversation, réutilise-la.
- Si elle manque, demande simplement dans quel quartier ou quelle commune
  effectuer la recherche.
- Ne prétends jamais connaître la position actuelle de l'utilisateur.
- Ne redemande jamais une localisation déjà fournie.
- Si l'utilisateur demande une recherche "près de moi" mais que sa position
  n'est pas disponible, demande-lui son quartier.

GESTION DU CONTEXTE :

- "Et les moins chers ?" conserve la catégorie et la localisation précédentes.
- "Et les mieux notés ?" conserve la catégorie et la localisation précédentes.
- "Parmi eux, lequel est le meilleur ?" concerne les résultats précédents.
- Une question sur "son numéro", "son adresse" ou "ses horaires" concerne
  le commerce mentionné précédemment.
- Un nouveau besoin indépendant remplace l'ancienne recherche.
- Exemple : après une recherche de restaurants, "j'ai une fuite d'eau"
  déclenche une nouvelle recherche de plombiers.
- Ne conserve pas les anciens critères de classement lorsqu'un nouveau
  classement est demandé.
- Ne mélange jamais deux catégories indépendantes.
- Ne redemande jamais une information déjà connue.
- Une demande hors sujet ne doit jamais hériter du contexte d'une ancienne
  recherche.

RÈGLES DE RECHERCHE :

- Une catégorie et une localisation connues permettent de rechercher.
- Si la catégorie est comprise mais que la localisation manque, demande
  uniquement la localisation.
- Si le besoin est trop vague pour identifier une catégorie, demande
  une précision.
- La requête doit contenir la catégorie, la localisation et Côte d'Ivoire.
- N'invente aucune information.

IMPORTANT :

Tu dois comprendre les besoins exprimés naturellement, et pas seulement
les demandes qui contiennent les mots "chercher", "trouver" ou "rechercher".
`;

function validerContexte(value: unknown): AnalyseIntention | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const contexte = value as Record<string, unknown>;

  const intentions = [
    "recherche_locale",
    "suivi_recherche",
    "question_generale",
    "salutation",
    "hors_sujet",
    "autre",
  ];

  if (
    typeof contexte.intention !== "string" ||
    !intentions.includes(contexte.intention) ||
    typeof contexte.categorie !== "string" ||
    typeof contexte.localisation !== "string" ||
    !Array.isArray(contexte.criteres) ||
    !contexte.criteres.every((critere) => typeof critere === "string")
  ) {
    return null;
  }

  return {
    intention: contexte.intention as AnalyseIntention["intention"],
    action: "rechercher",
    categorie: contexte.categorie.slice(0, 120),
    localisation: contexte.localisation.slice(0, 120),
    criteres: contexte.criteres
      .slice(0, 10)
      .map((critere) => critere.slice(0, 120)),
    recherche_serpapi:
      typeof contexte.recherche_serpapi === "string"
        ? contexte.recherche_serpapi.slice(0, 300)
        : "",
    reponse_directe: "",
  };
}

async function analyserDemande(
  historique: MessageHistorique[],
  contexte: AnalyseIntention | null,
): Promise<AnalyseIntention> {
  const messages: MessageHistorique[] = [
    {
      role: "system",
      content: promptDetecteur,
    },
  ];

  if (contexte) {
    messages.push({
      role: "system",
      content: `
CONTEXTE STRUCTURÉ DE LA RECHERCHE PRÉCÉDENTE :

Catégorie : ${contexte.categorie}
Localisation : ${contexte.localisation}
Critères précédents : ${contexte.criteres.join(", ") || "Aucun"}

RÈGLES PRIORITAIRES :

- Si le dernier message est un suivi, conserve la catégorie.
- Si le dernier message est un suivi, conserve la localisation.
- Si un nouveau critère de classement est exprimé, remplace l'ancien.
- Si le dernier message présente un besoin indépendant, considère-le
  comme une nouvelle recherche.
- Un besoin indépendant peut correspondre à une catégorie différente.
- Ne mélange jamais deux recherches indépendantes.
- Si le dernier message est une nouvelle recherche indépendante,
  analyse cette nouvelle demande normalement.
- Si le dernier message est hors sujet, classe-le comme hors_sujet.
  N'utilise pas le contexte précédent pour le transformer en recherche.
`,
    });
  }

  messages.push(...historique);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "analyse_intention_odjassa",
        strict: true,
        schema: schemaIntention,
      },
    },
    max_completion_tokens: 1200,
  });

  const contenu = completion.choices[0]?.message?.content;

  if (!contenu) {
    throw new Error("Le détecteur d'intention n'a retourné aucun résultat.");
  }

  return JSON.parse(contenu) as AnalyseIntention;
}

function fusionnerContexte(
  analyse: AnalyseIntention,
  contexte: AnalyseIntention | null,
): AnalyseIntention {
  if (!contexte || analyse.intention !== "suivi_recherche") {
    return analyse;
  }

  const categorie = analyse.categorie.trim() || contexte.categorie;

  const localisation = analyse.localisation.trim() || contexte.localisation;

  const criteres = analyse.criteres.length
    ? analyse.criteres
    : contexte.criteres;

  return {
    ...analyse,
    intention: "suivi_recherche",
    action: "rechercher",
    categorie,
    localisation,
    criteres,
    recherche_serpapi: [categorie, ...criteres, localisation, "Côte d'Ivoire"]
      .filter(Boolean)
      .join(" "),
    reponse_directe: "",
  };
}

function construireRequeteSerpApi(analyse: AnalyseIntention): string {
  const morceaux = [
    analyse.categorie,
    ...analyse.criteres,
    analyse.localisation,
    "Côte d'Ivoire",
  ];

  const requete = morceaux.filter(Boolean).join(" ").trim();

  if (!requete) {
    throw new Error("La requête reformulée est vide.");
  }

  return requete.slice(0, 300);
}

async function rechercherCommerces(requete: string): Promise<Magasin[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new ErreurAssistant(
      "Le service de recherche est momentanément indisponible.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  const params = new URLSearchParams({
    engine: "google_maps",
    type: "search",
    q: requete,
    api_key: apiKey,
  });

  let response: Response;
  try {
    response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      {
        cache: "no-store",
      },
    );
  } catch {
    throw new ErreurAssistant(
      "Le service de recherche est temporairement inaccessible.",
      "SEARCH_UNAVAILABLE",
      502,
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new ErreurAssistant(
        "La recherche a atteint sa limite temporaire.",
        "RATE_LIMIT",
        429,
      );
    }

    throw new ErreurAssistant(
      "Le service de recherche est momentanément indisponible.",
      "SEARCH_UNAVAILABLE",
      502,
    );
  }

  let data: { error?: unknown; local_results?: unknown };
  try {
    data = await response.json();
  } catch {
    throw new ErreurAssistant(
      "Le service de recherche a retourné une réponse invalide.",
      "SEARCH_UNAVAILABLE",
      502,
    );
  }

  if (data.error) {
    const erreurFournisseur = String(data.error);
    if (/rate.?limit|too many requests|quota/i.test(erreurFournisseur)) {
      throw new ErreurAssistant(
        "La recherche a atteint sa limite temporaire.",
        "RATE_LIMIT",
        429,
      );
    }

    throw new ErreurAssistant(
      "Le service de recherche est momentanément indisponible.",
      "SEARCH_UNAVAILABLE",
      502,
    );
  }

  const resultats = Array.isArray(data.local_results) ? data.local_results : [];

  return resultats.map(
    (item: Record<string, unknown>): Magasin => ({
      place_id: (item.place_id as string) ?? null,
      title: (item.title as string) ?? "Établissement sans nom",
      address: (item.address as string) ?? null,
      rating: (item.rating as number) ?? null,
      reviews: (item.reviews as number) ?? null,
      price: (item.price as string) ?? null,
      thumbnail: (item.thumbnail as string) ?? null,
      type: Array.isArray(item.type)
        ? item.type.join(", ")
        : ((item.type as string) ?? null),
      open_state: (item.open_state as string) ?? null,
      gps_coordinates: item.gps_coordinates ?? null,
      phone: (item.phone as string) ?? null,
      website: (item.website as string) ?? null,
      hours: item.hours ?? null,
      description: (item.description as string) ?? null,
      thumbnail_large: (item.thumbnail_large as string) ?? null,
    }),
  );
}


function trierSelonCriteres(
  magasins: Magasin[],
  criteres: string[],
): Magasin[] {
  const texte = criteres.join(" ").toLowerCase();

  const demandeMeilleuresNotes =
    /meilleur|meilleures? notes?|mieux notés?|bien notés?|notes élevées|meilleure note|top|classement/.test(
      texte,
    );

  if (!demandeMeilleuresNotes) {
    return magasins;
  }

  // Calculer la note moyenne des établissements ayant une note.
  const magasinsNotes = magasins.filter(
    (magasin) =>
      typeof magasin.rating === "number" &&
      magasin.rating > 0 &&
      typeof magasin.reviews === "number" &&
      magasin.reviews >= 0,
  );

  if (magasinsNotes.length === 0) {
    return magasins;
  }

  const moyenne =
    magasinsNotes.reduce((total, magasin) => total + magasin.rating!, 0) /
    magasinsNotes.length;

  // Nombre minimal d'avis utilisé pour stabiliser le classement.
  const seuilAvis = 20;

  // Calculer un score pondéré pour chaque établissement.
  const calculerScore = (magasin: Magasin): number => {
    if (typeof magasin.rating !== "number" || magasin.rating <= 0) {
      return -1;
    }

    const nombreAvis = magasin.reviews ?? 0;

    return (
      (nombreAvis / (nombreAvis + seuilAvis)) * magasin.rating +
      (seuilAvis / (nombreAvis + seuilAvis)) * moyenne
    );
  };

  return magasins
    .map((magasin, index) => ({
      magasin,
      index,
      score: calculerScore(magasin),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      return (
        (b.magasin.reviews ?? 0) - (a.magasin.reviews ?? 0) || a.index - b.index
      );
    })
    .map((element) => element.magasin);
}


async function formulerReponse(
  historique: MessageHistorique[],
  analyse: AnalyseIntention,
  magasins: Magasin[],
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `
Tu es ODJASSA, un assistant intelligent de proximité en Côte d'Ivoire.

Tu aides les utilisateurs à trouver des commerces, des professionnels
et des services adaptés à leurs besoins.

TON STYLE :

- Réponds en français naturel et convivial.
- Fais généralement 2 à 4 phrases maximum.
- Va directement à l'essentiel.
- Évite les longues introductions.
- Ne répète pas les informations déjà visibles sur les cartes.
- Ne transforme pas chaque réponse en rapport.
- Ne répète pas inutilement la question de l'utilisateur.
- Ne propose pas systématiquement de nouvelles questions.

COMPRÉHENSION :

- Réponds précisément à la dernière demande.
- Tiens compte des messages précédents.
- Comprends les références comme "eux", "celui-là", "son numéro"
  ou "parmi eux".
- Si l'utilisateur exprime un besoin, aide-le à trouver le professionnel
  ou l'établissement adapté.

FIABILITÉ :

- Utilise uniquement les informations présentes dans les résultats.
- N'invente jamais un commerce, un prix, un numéro ou une adresse.
- Ne présente jamais une information inconnue comme vérifiée.
- Si aucune information sur les prix n'est disponible, indique-le
  simplement.
- Si aucun établissement n'est trouvé, explique-le brièvement.

RÉSULTATS :

- Les établissements sont déjà affichés dans des cartes sous ta réponse.
- Ton texte sert uniquement à introduire les résultats.
- Ne donne jamais les noms des établissements.
- Ne donne jamais les numéros de téléphone.
- Ne donne jamais les adresses.
- Ne donne jamais les notes ou le nombre d'avis.
- Ne répète jamais les prix, horaires ou autres informations affichées dans les cartes.
- Ne fais aucune liste d'établissements dans ta réponse.
- Présente simplement ce que l'utilisateur va trouver dans les cartes.
- Si l'utilisateur demande un classement, annonce le classement sans détailler les établissements.
- Si aucun résultat n'est trouvé, explique-le brièvement.

EXEMPLES :

Demande : "Restaurants ouverts 24h/24 à Abobo."

Réponse : "Voici les restaurants ouverts 24h/24 à Abobo où vous pouvez vous restaurer rapidement."

Demande : "Les meilleurs plombiers à Cocody."

Réponse : "Voici les plombiers les mieux notés que j'ai trouvés à Cocody."

Demande : "Des restaurants pas chers."

Réponse : "Voici les restaurants proposant des options abordables parmi les résultats disponibles."

Demande : "Des pharmacies ouvertes maintenant."

Réponse : "Voici les pharmacies indiquées comme ouvertes actuellement."

OBJECTIF :

Une introduction courte, naturelle et pertinente. Les cartes font le reste.

Donner l'impression de discuter avec un véritable assistant,
pas de lire un rapport automatisé.
`,
      },
      ...historique,
      {
        role: "user",
        content: `
DEMANDE ANALYSÉE :
${JSON.stringify(analyse)}

NOMBRE D'ÉTABLISSEMENTS TROUVÉS :
${magasins.length}

Réponds uniquement à la dernière demande de l'utilisateur.
Sois concis, naturel et utile.
`,
      },
    ],
    max_completion_tokens: 500,
  });

  return (
    completion.choices[0]?.message?.content ||
    (magasins.length > 0
      ? "Voici les établissements correspondant à ta recherche."
      : "Je n'ai pas trouvé d'établissement correspondant à cette recherche.")
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return reponseErreur(
        "SERVICE_UNAVAILABLE",
        "L’assistant est momentanément indisponible.",
        503,
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return reponseErreur(
        "INVALID_REQUEST",
        "Le message est vide ou invalide. Saisissez votre demande puis réessayez.",
        400,
      );
    }

    const contexteRecherche = validerContexte(body.contexteRecherche);

    const historique: MessageHistorique[] = body.messages
      .filter(
        (message: { role?: string; content?: string }) =>
          ["user", "assistant"].includes(message.role || "") &&
          typeof message.content === "string",
      )
      .slice(-16)
      .map((message: { role: "user" | "assistant"; content: string }) => ({
        role: message.role,
        content: message.content.slice(0, 3000),
      }));

    // 1. Comprendre le message et son contexte.
    let analyse = await analyserDemande(historique, contexteRecherche);

    // 2. Intercepter les demandes hors sujet avant toute recherche.
    if (analyse.intention === "hors_sujet") {
      return NextResponse.json({
        answer:
          analyse.reponse_directe ||
          "Cette demande sort de mon domaine. Je suis spécialisé dans la recherche de commerces, d'établissements et de professionnels en Côte d'Ivoire.",
        magasins: [],
        analyse: {
          ...analyse,
          action: "repondre",
          categorie: "",
          recherche_serpapi: "",
        },
      });
    }

    // 3. Conserver le contexte pour les suivis.
    analyse = fusionnerContexte(analyse, contexteRecherche);

    // 4. Répondre directement ou demander une précision.
    if (analyse.action !== "rechercher") {
      return NextResponse.json({
        answer:
          analyse.reponse_directe || "Peux-tu préciser ce que tu recherches ?",
        magasins: [],
        analyse,
      });
    }

    // 5. Vérifier que la catégorie est connue.
    if (!analyse.categorie.trim()) {
      return NextResponse.json({
        answer:
          "Que souhaites-tu trouver exactement ? Je peux t'aider à identifier le service adapté.",
        magasins: [],
        analyse: {
          ...analyse,
          action: "clarifier",
        },
      });
    }

    // 6. Vérifier que la localisation est connue.
    if (!analyse.localisation.trim()) {
      return NextResponse.json({
        answer:
          "Dans quelle commune ou quel quartier souhaites-tu faire cette recherche ?",
        magasins: [],
        analyse: {
          ...analyse,
          action: "clarifier",
        },
      });
    }

    // 7. Rechercher les établissements avec SerpApi.
    const requeteSerpApi = construireRequeteSerpApi(analyse);

    let magasins = await rechercherCommerces(requeteSerpApi);

    // 8. Appliquer le classement demandé.
    magasins = trierSelonCriteres(magasins, analyse.criteres);

    // 9. Préparer l'analyse finale.
    const analyseFinale: AnalyseIntention = {
      ...analyse,
      recherche_serpapi: requeteSerpApi,
    };

    // 10. Formuler une réponse courte et naturelle.
    const answer = await formulerReponse(historique, analyseFinale, magasins);

    return NextResponse.json({
      answer,
      magasins,
      analyse: analyseFinale,
    });
  } catch (error) {
    console.error("Erreur agent ODJASSA :", error);

    if (error instanceof ErreurAssistant) {
      return reponseErreur(error.code, error.message, error.status);
    }

    if (error instanceof APIError) {
      if (error.status === 429) {
        return reponseErreur(
          "RATE_LIMIT",
          "L’assistant reçoit trop de demandes en ce moment.",
          429,
          error.headers?.get("retry-after"),
        );
      }

      return reponseErreur(
        "AI_UNAVAILABLE",
        "L’assistant ne peut pas répondre pour le moment.",
        503,
      );
    }

    return reponseErreur(
      "INTERNAL_ERROR",
      "Une erreur inattendue empêche le traitement de votre demande.",
      500,
    );
  }
}
