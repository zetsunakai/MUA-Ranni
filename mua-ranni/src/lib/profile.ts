import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { about } from "@/data/about";
import { site } from "@/data/site";
import { getDb } from "@/db";
import { siteProfile } from "@/db/schema";
import { displayWhatsapp } from "@/lib/profile-format";

export type Profile = {
  whatsappNumber: string;
  whatsappDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string | null;
  tiktokUrl: string | null;
  serviceAreas: string[];
  responseHours: string;
  greeting: string;
  bio: string[];
};

const defaults = {
  whatsappNumber: site.whatsappNumber,
  instagramHandle: site.instagramHandle.replace(/^@/, ""),
  tiktokHandle: site.tiktokUrl.split("@")[1] ?? null,
  serviceAreas: site.serviceAreas,
  responseHours: site.responseHours,
  greeting: about.greeting,
  bio: about.bio,
};

// Profil yang ditampilkan di website: isi dari admin, atau nilai bawaan kalau kosong.
export const getProfile = cache(async (): Promise<Profile> => {
  const db = getDb();
  const [row] = db ? await db.select().from(siteProfile).where(eq(siteProfile.id, 1)) : [];

  const whatsappNumber = row?.whatsappNumber || defaults.whatsappNumber;
  const instagramHandle = row?.instagramHandle || defaults.instagramHandle;
  // TikTok boleh dikosongkan admin (string kosong = tidak punya TikTok).
  const tiktokHandle = row ? row.tiktokHandle || null : defaults.tiktokHandle;

  return {
    whatsappNumber,
    whatsappDisplay: displayWhatsapp(whatsappNumber),
    instagramHandle,
    instagramUrl: `https://instagram.com/${instagramHandle}`,
    tiktokHandle,
    tiktokUrl: tiktokHandle ? `https://tiktok.com/@${tiktokHandle}` : null,
    serviceAreas: row?.serviceAreas?.length ? row.serviceAreas : defaults.serviceAreas,
    responseHours: row?.responseHours || defaults.responseHours,
    greeting: row?.greeting || defaults.greeting,
    bio: row?.bio?.length ? row.bio : defaults.bio,
  };
});
