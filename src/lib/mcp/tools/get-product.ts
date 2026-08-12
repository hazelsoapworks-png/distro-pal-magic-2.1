import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedProducts } from "@/lib/seed";

export default defineTool({
  name: "get_product",
  title: "Get product",
  description:
    "Get full catalogue details for one product by its id or product code, including pricing, unit, shades and stock defaults.",
  inputSchema: {
    idOrCode: z.string().describe("Product id (e.g. p1) or product code (e.g. EGML 6008 DD)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ idOrCode }) => {
    const key = idOrCode.trim().toLowerCase();
    const product = seedProducts.find(
      (p) => p.id.toLowerCase() === key || p.code.toLowerCase() === key,
    );

    if (!product) {
      throw new ToolError(`No product found for "${idOrCode}".`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
