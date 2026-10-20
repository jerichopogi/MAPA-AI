// Lightweight English/Taglish switch. English text is the key; the Taglish
// dictionary only lists what's translated, so anything missing stays English.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@shared/schema";

const STORAGE_KEY = "lang";

export function getStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "tl" ? "tl" : "en";
  } catch {
    return "en";
  }
}

const TL: Record<string, string> = {
  // Navigation
  Home: "Home",
  "My trips": "Mga trip ko",
  Assistant: "Assistant",
  "Visa help": "Tulong sa visa",
  "Local secrets": "Local secrets",
  "Travel info": "Travel info",
  "Package quote": "Package quote",
  "Plan & billing": "Plan at billing",
  "Plan a trip": "Mag-plano ng trip",
  "Sign out": "Mag-sign out",
  Language: "Wika",

  // Dashboard
  "Good morning": "Magandang umaga",
  "Good afternoon": "Magandang hapon",
  "Good evening": "Magandang gabi",
  "where to next?": "saan tayo next?",
  "Two AI itineraries in under a minute.": "Dalawang AI itinerary in less than a minute.",
  "Check visa rules": "I-check ang visa rules",
  "Requirements for Philippine passports.": "Requirements para sa Philippine passport.",
  "Places locals love, by city.": "Mga lugar na gusto ng locals, per city.",
  "Ask the assistant": "Magtanong sa assistant",
  "Any travel question, answered.": "Kahit anong travel question, sasagutin.",
  "Recent trips": "Mga recent na trip",
  "View all": "Tingnan lahat",
  "No trips yet": "Wala ka pang trip",
  "Generate your first itinerary — it takes less than a minute.": "Gawin na ang first itinerary mo — wala pang isang minuto.",
  Inspiration: "Inspirasyon",

  // Where should I go?
  "Where should I go?": "Saan ako pupunta?",
  "Pick a date — we'll rank the best countries for that time of year.": "Pumili ng date — ira-rank namin ang best na bansa para sa panahong 'yon.",
  "Leaving on": "Alis sa",
  Days: "Ilang araw",
  "Budget (₱, with flights)": "Budget (₱, kasama flights)",
  "Find places": "Maghanap",
  "Plan this trip": "I-plano ang trip na 'to",

  // Plan a trip
  "Tell us the basics. We'll draft a budget plan and an experience plan.": "Sabihin mo lang ang basics. Gagawa kami ng budget plan at experience plan.",
  "Where to?": "Saan ka pupunta?",
  "Choose a country": "Pumili ng bansa",
  "Flying from": "Lilipad mula sa",
  When: "Kailan",
  "How many days": "Ilang araw",
  Currency: "Currency",
  "Total budget": "Kabuuang budget",
  "Cities to include": "Mga city na isasama",
  "Optional — leave empty and we'll pick the highlights.": "Optional — kung wala, kami na ang pipili ng highlights.",
  "What do you enjoy?": "Ano ang hilig mo?",
  "Generate itineraries": "Gumawa ng itinerary",
  "Planning your trip…": "Pinaplano ang trip mo…",
  "Edit details": "I-edit ang details",
  "Two plans for the same trip — compare them and save the one you like.": "Dalawang plano para sa iisang trip — i-compare at i-save ang gusto mo.",
  Regenerate: "Gawin ulit",
  "Save trip": "I-save ang trip",
  "Book this trip": "I-book ang trip",
  "Budget plan": "Budget plan",
  "Experience plan": "Experience plan",
  "Estimated total": "Tantyang kabuuan",
  "Within budget": "Pasok sa budget",

  // Booking section
  "Hand-picked by the AI for this itinerary.": "Pinili ng AI para sa itinerary na 'to.",
  Flights: "Flights",
  "Where to stay": "Saan mag-stay",
  "Tours & activities": "Tours at activities",

  // Trip details
  Share: "I-share",
  "Print / PDF": "I-print / PDF",
  Delete: "Burahin",
  Itinerary: "Itinerary",
  Notes: "Notes",
  "Save notes": "I-save ang notes",
  "Trip reminders": "Mga paalala sa trip",
  "Departure date": "Petsa ng alis",

  // Assistant
  "Ask about countries, places, culture, traditions and trip planning.": "Magtanong tungkol sa mga bansa, lugar, kultura, tradisyon at trip planning.",
  "Try asking": "Subukang itanong",
  "Thinking…": "Nag-iisip…",
  "Ask about a place, its culture, traditions, food or getting around…": "Magtanong tungkol sa lugar, kultura, tradisyon, pagkain o pag-commute…",

  // Page descriptions
  "Every itinerary you've saved.": "Lahat ng itinerary na na-save mo.",
  "Requirements for Philippine passport holders, in plain language.": "Mga requirement para sa may Philippine passport, sa simpleng salita.",
  "The places locals love and tourists usually miss.": "Mga lugar na gusto ng locals pero madalas hindi napupuntahan ng turista.",

  // Plan card
  "Free plan": "Free plan",
  "Upgrade to Plus": "Mag-upgrade sa Plus",
};

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: string) => string;
}

const I18nContext = createContext<I18nValue>({ lang: "en", setLang: () => {}, t: (s) => s });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang === "tl" ? "fil" : "en";
  }, [lang]);

  const setLang = (next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable: the choice lasts for this visit only
    }
    setLangState(next);
  };

  const t = (text: string) => (lang === "tl" ? (TL[text] ?? text) : text);
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
