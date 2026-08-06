import type { Product } from "@/lib/types";

export type NewProduct = Omit<Product, "id">;

export function createProduct(id: string, product: NewProduct): Product {
  return {
    ...product,
    id,
  };
}

export function updateProduct(
  products: Product[],
  product: Product,
): Product[] {
  return products.map((current) =>
    current.id === product.id ? product : current,
  );
}

export function deleteProduct(products: Product[], productId: string): Product[] {
  return products.filter((product) => product.id !== productId);
}

export function productName(
  products: Product[],
  productId: string,
): string {
  return products.find((product) => product.id === productId)?.name ?? "Item";
}
