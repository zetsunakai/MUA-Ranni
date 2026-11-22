import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/data/site";
import { PAYMENT_KIND_LABELS, PAYMENT_METHOD_LABELS, type PaymentKind, type PaymentMethod } from "@/lib/booking-math";
import { formatLongDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";

// Gambar invoice (PNG) untuk dikirim ke klien lewat WhatsApp.
// ImageResponse hanya mendukung flexbox (tanpa grid); setiap div berisi >1 anak wajib display:flex.

export type InvoiceData = {
  booking: {
    invoiceNumber: string;
    invoiceIssuedAt: string;
    clientName: string;
    clientPhone: string | null;
    eventType: string | null;
    eventDate: string;
    makeupTime: string | null;
    people: number | null;
    location: string | null;
    transportFee: number;
    discount: number;
  };
  lines: { id: string; description: string; qty: number; unitPrice: number }[];
  payments: { id: string; paidOn: string; amount: number; kind: PaymentKind; method: PaymentMethod }[];
  totals: { subtotal: number; total: number; paid: number; balance: number };
  contact: { whatsappDisplay: string; instagramHandle: string };
};

const fontDir = join(process.cwd(), "src/assets/fonts");
const fontsPromise = Promise.all([
  readFile(join(fontDir, "bodoni-moda-latin-400-normal.ttf")),
  readFile(join(fontDir, "hanken-grotesk-latin-400-normal.ttf")),
  readFile(join(fontDir, "hanken-grotesk-latin-600-normal.ttf")),
]);

const C = {
  bg: "#fbf9f5",
  surface: "#ffffff",
  ink: "#1b1c1a",
  muted: "#666058",
  accent: "#725a37",
  soft: "#f0eeea",
  line: "#e5dfd7",
};
const WIDTH = 1080;
const PAD = 72;

export async function renderInvoiceImage({ booking: b, lines, payments, totals, contact: profile }: InvoiceData, headers?: Record<string, string>) {
  const [bodoni, hanken, hankenBold] = await fontsPromise;
  const paidOff = totals.paid >= totals.total;
  const summaryRows: [string, string][] = [["Subtotal", formatRupiah(totals.subtotal)]];
  if (b.transportFee) summaryRows.push(["Transport", formatRupiah(b.transportFee)]);
  if (b.discount) summaryRows.push(["Diskon", `−${formatRupiah(b.discount)}`]);
  const eventInfo = [b.eventType, formatLongDate(b.eventDate) + (b.makeupTime ? `, ${b.makeupTime} WIB` : ""), b.people ? `${b.people} orang` : null].filter(Boolean);

  // Tinggi gambar mengikuti isi supaya tidak ada ruang kosong / terpotong.
  const height =
    560 + // header + klien/acara
    (b.location ? 60 : 0) +
    90 + lines.length * 84 + // tabel layanan
    (summaryRows.length + 1) * 52 + 60 +
    (payments.length ? 110 + payments.length * 48 : 0) +
    90 + // sisa tagihan / lunas
    (paidOff ? 0 : 240) + // info rekening
    180; // footer

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.ink, fontFamily: "Hanken", fontSize: 26, padding: PAD }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
            <div style={{ fontFamily: "Bodoni", fontSize: 54, lineHeight: 1.1 }}>{site.name}</div>
            <div style={{ marginTop: 12, fontSize: 20, color: C.muted }}>{site.tagline}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 18, letterSpacing: 6, color: C.accent }}>INVOICE</div>
            <div style={{ marginTop: 10, fontSize: 30, fontWeight: 600 }}>{b.invoiceNumber}</div>
            <div style={{ marginTop: 6, fontSize: 20, color: C.muted }}>{formatLongDate(b.invoiceIssuedAt)}</div>
          </div>
        </div>

        <div style={{ display: "flex", height: 1, background: C.line, marginTop: 44, marginBottom: 40 }} />

        {/* Klien & acara */}
        <div style={{ display: "flex", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Label>Ditagihkan kepada</Label>
            <div style={{ marginTop: 12, fontFamily: "Bodoni", fontSize: 38 }}>{b.clientName}</div>
            {b.clientPhone && <div style={{ marginTop: 8, color: C.muted }}>{b.clientPhone}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Label>Acara</Label>
            {eventInfo.map((text) => (
              <div key={text} style={{ marginTop: 10 }}>{text}</div>
            ))}
          </div>
        </div>
        {b.location && (
          <div style={{ display: "flex", marginTop: 24, color: C.muted, fontSize: 22 }}>
            {`Lokasi: ${b.location.length > 120 ? `${b.location.slice(0, 117)}…` : b.location}`}
          </div>
        )}

        {/* Tabel layanan */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48, background: C.surface, border: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", padding: "18px 28px", background: C.soft, fontSize: 18, letterSpacing: 3, color: C.accent }}>
            <div style={{ display: "flex", flex: 1 }}>LAYANAN</div>
            <div style={{ display: "flex", width: 280, justifyContent: "flex-end" }}>JUMLAH</div>
          </div>
          {lines.map((line) => (
            <div key={line.id} style={{ display: "flex", alignItems: "center", padding: "18px 28px", borderTop: `1px solid ${C.line}`, minHeight: 84 }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 24 }}>
                <div style={{ fontWeight: 600 }}>{line.description}</div>
                <div style={{ marginTop: 4, fontSize: 20, color: C.muted }}>{`${line.qty} × ${formatRupiah(line.unitPrice)}`}</div>
              </div>
              <div style={{ display: "flex", width: 280, justifyContent: "flex-end" }}>{formatRupiah(line.qty * line.unitPrice)}</div>
            </div>
          ))}
        </div>

        {/* Ringkasan */}
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-end", width: 520, marginTop: 28 }}>
          {summaryRows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", color: C.muted }}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.ink}`, marginTop: 8, paddingTop: 16 }}>
            <span style={{ fontFamily: "Bodoni", fontSize: 34 }}>Total</span>
            <span style={{ fontFamily: "Bodoni", fontSize: 40 }}>{formatRupiah(totals.total)}</span>
          </div>
        </div>

        {/* Pembayaran */}
        {payments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
            <Label>Pembayaran diterima</Label>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
              {payments.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.line}`, fontSize: 24 }}>
                  <span>{`${formatLongDate(p.paidOn).replace(/^[^,]+, /, "")} · ${PAYMENT_KIND_LABELS[p.kind]} · ${PAYMENT_METHOD_LABELS[p.method]}`}</span>
                  <span>{formatRupiah(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, padding: "22px 28px", background: paidOff ? C.ink : C.soft, color: paidOff ? C.bg : C.ink }}>
          <span style={{ fontSize: 20, letterSpacing: 4 }}>{paidOff ? "STATUS" : "SISA TAGIHAN"}</span>
          <span style={{ fontFamily: "Bodoni", fontSize: 40 }}>{paidOff ? "LUNAS" : formatRupiah(totals.balance)}</span>
        </div>

        {/* Rekening */}
        {!paidOff && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
            <Label>Transfer ke</Label>
            <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
              {site.bankAccounts.map((account) => (
                <div key={account.bank} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 24px", background: C.surface, border: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: 18, color: C.muted }}>{account.bank}</span>
                  <span style={{ marginTop: 6, fontSize: 30, fontWeight: 600, letterSpacing: 1 }}>{account.number}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 22, color: C.muted }}>{`a.n. ${site.bankAccountName}`}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto", paddingTop: 40, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: "Bodoni", fontSize: 30 }}>{`Terima kasih, ${b.clientName.split(" ")[0]}!`}</div>
          <div style={{ marginTop: 10, fontSize: 20, color: C.muted }}>
            {`WA ${profile.whatsappDisplay} · IG @${profile.instagramHandle}`}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height,
      fonts: [
        { name: "Bodoni", data: bodoni, weight: 400, style: "normal" },
        { name: "Hanken", data: hanken, weight: 400, style: "normal" },
        { name: "Hanken", data: hankenBold, weight: 600, style: "normal" },
      ],
      headers,
    },
  );
}

function Label({ children }: { children: string }) {
  return <div style={{ display: "flex", fontSize: 18, letterSpacing: 4, color: C.accent, textTransform: "uppercase" }}>{children}</div>;
}
