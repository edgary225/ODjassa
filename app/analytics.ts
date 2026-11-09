import posthog from "posthog-js";

type ProprietesAnalytics = Record<
  string,
  string | number | boolean | null | undefined
>;

const jetonPostHog = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

export function suivreInteraction(
  evenement: string,
  proprietes: ProprietesAnalytics = {},
) {
  if (!jetonPostHog || typeof window === "undefined") return;

  posthog.capture(evenement, {
    ...proprietes,
    $current_url: `${window.location.origin}${window.location.pathname}`,
  });
}
