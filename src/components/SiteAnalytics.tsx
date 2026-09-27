"use client";

// Client Component karena `beforeSend` adalah fungsi, dan fungsi tidak bisa
// dikirim dari Server Component (layout.tsx) ke komponen lain lewat props.

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Buang ?text=... dari URL /chat/* supaya isi pesan WhatsApp tidak ikut terkirim
// ke analytics dan setiap tombol tercatat sebagai satu URL yang sama.
function stripChatQuery(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  if (url.pathname.startsWith("/chat/")) url.search = "";
  return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={stripChatQuery} />;
}
