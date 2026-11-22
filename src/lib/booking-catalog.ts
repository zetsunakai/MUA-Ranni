import "server-only";

import { getCategories } from "@/lib/categories";
import { getAddOns, getServiceGroups } from "@/lib/prices";

// Price list + jenis acara untuk form booking admin.
export async function getBookingFormOptions() {
  const [groups, addOns, categories] = await Promise.all([getServiceGroups(), getAddOns(), getCategories()]);
  return {
    catalog: {
      groups: groups.map((g) => ({ name: g.name, items: g.items })),
      addOns: addOns.map((a) => ({ id: a.id, name: a.name, priceFrom: a.priceFrom })),
    },
    eventTypes: categories,
  };
}
