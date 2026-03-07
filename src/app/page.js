import IronPassport from "./components/IronPassport";
import { websiteSchema, organizationSchema, faqSchema, jsonLdScript } from "@/lib/seo";

const FAQS = [
  {
    question: "How does Iron Passport rank gyms?",
    answer:
      "Iron Passport uses AI to evaluate gyms across 8 weighted criteria: Equipment (20%), Cleanliness (18%), Amenities (14%), Staff & Trainers (12%), Atmosphere (11%), Value (10%), Recovery (8%), and Classes (7%). Each gym receives a composite score out of 100.",
  },
  {
    question: "Can I use Iron Passport for free?",
    answer:
      "Yes. Guests get 1 free search with no sign-up. Creating a free account with your email unlocks 5 searches per month and reveals the #1 ranked result. Pro members get unlimited searches for $5/month.",
  },
  {
    question: "What is the Gym Passport feature?",
    answer:
      "Gym Passport lets you stamp, rate, and review every gym you visit while traveling. Build a personal collection of gyms across cities and track your fitness journey worldwide.",
  },
  {
    question: "How does Gym Compare work?",
    answer:
      "Gym Compare finds 10 nearby gyms and presents them in head-to-head rounds. You pick your favorite in each matchup, and after 10 rounds the gyms are ranked by your votes.",
  },
  {
    question: "Does Iron Passport show day pass prices?",
    answer:
      "Yes. For each ranked gym, Iron Passport shows day pass and week pass availability and pricing so you can plan your workout budget while traveling.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema(FAQS)) }}
      />
      <IronPassport />
    </>
  );
}
