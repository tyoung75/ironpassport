import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin – Iron Passport",
  description: "Iron Passport admin dashboard.",
  path: "/admin",
  noindex: true,
});

export default function AdminLayout({ children }) {
  return children;
}
