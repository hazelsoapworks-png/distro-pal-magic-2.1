import { defineTool } from "@lovable.dev/mcp-js";
import { seedProducts } from "@/lib/seed";
import { PRODUCT_CATEGORIES } from "@/lib/types";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List catalogue categories with the number of products in each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const categories = PRODUCT_CATEGORIES.map((category) => ({
      category,
      productCount: seedProducts.filter((p) => p.category === category).length,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(categories, null, 2) }],
      structuredContent: { categories },
    };
  },
});
