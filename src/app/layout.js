import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "@/lib/seo";
import PageTracker from "./components/PageTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  ...buildMetadata({
    title: "Iron Passport: Find & Compare Gym Day Passes Worldwide",
    description:
      "Stop overpaying for hotel gyms. Get AI-powered rankings, real day pass prices, and reviews for the best gyms in any city. Start your search for free.",
    path: "/",
  }),
  manifest: "/manifest.json",
  themeColor: "#090807",
  icons: {
    icon: [
      { url: "/favicon-v2.ico", sizes: "any" },
      { url: "/favicon-32x32-v2.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16-v2.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/favicon-v2.ico",
    apple: [{ url: "/apple-touch-icon-v2.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PageTracker />
        {children}
        {/* Server-rendered fallback content for SEO crawlers that don't execute JS */}
        <noscript>
          <div style={{ maxWidth: 740, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
            <h1>Iron Passport: Find &amp; Compare Gym Day Passes Worldwide</h1>
            <p>AI-powered gym rankings for business trips, vacations, and adventures. Find gyms, discover destinations, stamp your passport, and compare the best — wherever you travel.</p>
            <h2>Features</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>Gym Finder – Search by destination city and get the top 6 gyms ranked by equipment, cleanliness, amenities, and more.</li>
              <li>Destination Discovery – Describe your ideal trip and get destinations ranked by gym quality and destination fit.</li>
              <li>Gym Passport – Track, rate, and review every gym you visit while traveling.</li>
              <li>Gym Compare – 10 nearby gyms go head-to-head so you can find your favorite.</li>
            </ul>
          </div>
        </noscript>
      </body>
    </html>
  );
}
