import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { about } from "@/data/about";
import { bookingInfo, terms } from "@/data/services";
import { site } from "@/data/site";
import { readWithRetry } from "@/db/read-query";
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
  depositInfo: string;
  paymentInfo: string;
  terms: string[];
  photoUrl: string;
  photoAlt: string;
  location: { name: string; address: string; mapsUrl: string; embedUrl: string };
  bankAccounts: BankAccount[];
  bankAccountName: string;
};

export type BankAccount = { bank: string; number: string };

// Peta Google dari teks alamat (tanpa API key).
export function mapsEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`;
}

const defaults = {
  whatsappNumber: site.whatsappNumber,
  instagramHandle: site.instagramHandle.replace(/^@/, ""),
  tiktokHandle: site.tiktokUrl.split("@")[1] ?? null,
  serviceAreas: site.serviceAreas,
  responseHours: site.responseHours,
  greeting: about.greeting,
  bio: about.bio,
  depositInfo: bookingInfo.deposit,
  paymentInfo: bookingInfo.payment,
  terms,
  photoUrl: about.photoUrl,
  location: site.location,
  bankAccounts: site.bankAccounts,
  bankAccountName: site.bankAccountName,
};

// Profil yang ditampilkan di website: isi dari admin, atau nilai bawaan kalau kosong.
export const getProfile = cache(async (): Promise<Profile> => {
  const db = getDb();
  const [row] = db ? await readWithRetry(() => db.select().from(siteProfile).where(eq(siteProfile.id, 1))) : [];

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
    depositInfo: row?.depositInfo || defaults.depositInfo,
    paymentInfo: row?.paymentInfo || defaults.paymentInfo,
    terms: row?.terms?.length ? row.terms : defaults.terms,
    photoUrl: row?.photoUrl || defaults.photoUrl,
    photoAlt: about.photoAlt,
    location: row?.locationAddress
      ? {
          name: row.locationName || row.locationAddress,
          address: row.locationAddress,
          mapsUrl: row.locationMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.locationAddress)}`,
          embedUrl: mapsEmbedUrl(row.locationAddress),
        }
      : defaults.location,
    bankAccounts: row?.bankAccounts?.length ? row.bankAccounts : defaults.bankAccounts,
    bankAccountName: row?.bankAccountName || defaults.bankAccountName,
  };
});
