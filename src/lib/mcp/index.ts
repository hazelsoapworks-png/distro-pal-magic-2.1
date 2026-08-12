import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import listCategoriesTool from "./tools/list-categories";

export default defineMcp({
  name: "sales-helper-pro",
  title: "Sales Helper Pro",
  version: "0.1.0",
  instructions:
    "Read-only access to the Sales Helper Pro (SalesBeat) cosmetics product catalogue. Use `list_categories` to see categories, `list_products` to browse or search products, and `get_product` for full details of one product. Sales, order and customer data live on each user's device and are not available here.",
  tools: [listCategoriesTool, listProductsTool, getProductTool],
});
