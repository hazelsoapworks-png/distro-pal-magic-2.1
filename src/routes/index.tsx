import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SalesBeat — Distribution Assistant" },
      { name: "description", content: "Field sales distribution assistant for managing beats, shops, orders, collections and product catalogue." },
      { property: "og:title", content: "SalesBeat — Distribution Assistant" },
      { property: "og:description", content: "Field sales distribution assistant for managing beats, shops, orders, collections and product catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}
