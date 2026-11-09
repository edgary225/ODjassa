import posthog from "posthog-js";

const jetonPostHog = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (jetonPostHog) {
  posthog.init(jetonPostHog, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
    capture_pageleave: false,
    capture_pageview: false,
    disable_session_recording: true,
  });

  posthog.capture("$pageview", {
    $current_url: `${window.location.origin}${window.location.pathname}`,
  });
}

export function onRouterTransitionStart(url: string) {
  if (!jetonPostHog) return;

  const pathname = new URL(url, window.location.origin).pathname;
  posthog.capture("$pageview", {
    $current_url: `${window.location.origin}${pathname}`,
  });
}
