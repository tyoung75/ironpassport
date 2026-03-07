import "./globals.css";

export const metadata = {
  title: {
    default: "Iron Passport — The Global Database of Great Gyms",
    template: "%s",
  },
  description:
    "Find the best gyms while traveling. Iron Passport rates and ranks gyms worldwide with equipment scores, cleanliness ratings, day pass info, and recovery facilities.",
  metadataBase: new URL("https://ironpassport.com"),
  openGraph: {
    siteName: "Iron Passport",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
