import "server-only";

import { and, desc, eq, gte, lt } from "drizzle-orm";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { expenses } from "@/db/schema";
import { addMonths } from "@/lib/dates";

export type ExpenseRow = typeof expenses.$inferSelect;

// Belanja dalam satu bulan ("2026-11"), terbaru di atas. null = database belum disambungkan.
export async function getExpensesForMonth(month: string): Promise<ExpenseRow[] | null> {
  const db = getDb();
  if (!db) return null;
  return readWithRetry(() =>
    db
      .select()
      .from(expenses)
      .where(and(gte(expenses.spentOn, `${month}-01`), lt(expenses.spentOn, `${addMonths(month, 1)}-01`)))
      .orderBy(desc(expenses.spentOn), desc(expenses.createdAt)),
  );
}

export async function getExpense(id: string): Promise<ExpenseRow | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await readWithRetry(() => db.select().from(expenses).where(eq(expenses.id, id)));
  return row ?? null;
}
