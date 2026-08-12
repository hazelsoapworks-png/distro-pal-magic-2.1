import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedProducts } from "@/lib/seed";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List products from the SalesBeat cosmetics catalogue, optionally filtered by category or a name/code search term.",
  inputSchema: {
    search: z
      .string()
      .optional()
      .describe("Case-insensitive text matched against product name and code."),
    category: z
      .string()
      .optional()
      .describe("Category filter: Eye, Face, Lip, Hair or Nail Care."),
    limit: z.number().optional().describe("Maximum number of products to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ search, category, limit }) => {
    const term = search?.trim().toLowerCase();
    const cat = category?.trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 50, 1), 200);

    const items = seedProducts
      .filter((p) => {
        if (cat && (p.category ?? "").toLowerCase() !== cat) return false;
        if (term && !`${p.name} ${p.code}`.toLowerCase().includes(term)) return false;
        return true;
      })
      .slice(0, max)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        category: p.category ?? null,
        unit: p.unit,
        sellingPrice: p.sellingPrice,
        shades: p.shades ?? [],
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { count: items.length, products: items },
    };
  },
});
