import { Link } from "wouter";
import { ArrowRight, FileText, HeartPulse, Phone, ShieldCheck, Umbrella } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Routes } from "@/lib/constants";

const SECTIONS = [
  {
    id: "documents",
    icon: FileText,
    title: "Travel documents",
    groups: [
      {
        heading: "Philippine passport",
        items: ["Valid for at least 6 months beyond your return date — many countries deny entry otherwise."],
      },
      {
        heading: "Usually asked for at immigration",
        items: [
          "Return or onward ticket",
          "Hotel bookings or accommodation details",
          "Travel insurance certificate",
          "Proof of funds (bank statements)",
          "Invitation letter if visiting friends or family",
        ],
      },
    ],
  },
  {
    id: "insurance",
    icon: Umbrella,
    title: "Travel insurance",
    intro: "Healthcare abroad is expensive, and Schengen visas require insurance as part of the application.",
    groups: [
      {
        heading: "What to look for",
        items: ["Medical cover of at least USD 50,000", "Emergency evacuation", "Trip cancellation and interruption", "Baggage loss and delay", "24/7 emergency assistance"],
      },
      {
        heading: "Providers popular with Filipinos",
        items: ["Pacific Cross", "Malayan Insurance", "AXA Philippines", "World Nomads (multi-country trips)"],
      },
    ],
  },
  {
    id: "health",
    icon: HeartPulse,
    title: "Health",
    intro: "Visit a travel clinic 4–6 weeks before you leave if you're unsure what you need.",
    groups: [
      {
        heading: "Medications",
        items: [
          "Bring enough for the whole trip, plus extra",
          "Keep them in original packaging",
          "Carry a doctor's note for prescriptions",
          "Check the medicine is legal at your destination (some cold medicines are banned in Japan)",
        ],
      },
      {
        heading: "Basic travel kit",
        items: ["Pain relievers and antihistamines", "Motion-sickness tablets", "Bandages and antiseptic", "Oral rehydration salts", "Insect repellent"],
      },
    ],
  },
  {
    id: "safety",
    icon: ShieldCheck,
    title: "Safety",
    groups: [
      {
        heading: "Before you go",
        items: [
          "Save the Philippine Embassy or Consulate contacts for your destination",
          "Read up on local laws, customs and dress codes",
          "Keep digital copies of your passport, visa and bookings",
        ],
      },
      {
        heading: "On the road",
        items: ["Watch for pickpockets in crowded tourist spots", "Use official taxis and ride-hailing apps", "Avoid sensitive logins on public Wi-Fi"],
      },
    ],
  },
];

const HOTLINES = [
  { label: "DFA Assistance to Nationals", number: "+63 2 8834 4000" },
  { label: "DFA Office of Consular Affairs", number: "+63 2 8651 9400" },
  { label: "OWWA 24/7 hotline", number: "1348" },
];

export default function TravelInfo() {
  return (
    <>
      <PageHeader title="Travel info" description="The essentials every Filipino traveler should know before flying out." />

      <Link href={Routes.VISA_HELP} className="mb-8 flex items-center justify-between rounded-xl bg-accent p-5 text-accent-foreground transition-opacity hover:opacity-90">
        <div>
          <p className="font-medium">Not sure if you need a visa?</p>
          <p className="text-sm opacity-80">Check requirements for your destination in seconds.</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0" />
      </Link>

      <Accordion type="multiple" defaultValue={["documents"]} className="rounded-xl border bg-card px-5">
        {SECTIONS.map(({ id, icon: Icon, title, intro, groups }) => (
          <AccordionItem key={id} value={id} className="last:border-b-0">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" /> {title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {intro && <p className="mb-4 text-muted-foreground">{intro}</p>}
              <div className="grid gap-6 pb-2 sm:grid-cols-2">
                {groups.map((g) => (
                  <div key={g.heading}>
                    <h3 className="text-sm font-medium">{g.heading}</h3>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {g.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <section className="mt-8 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-medium">
          <Phone className="h-4 w-4 text-primary" /> Emergency hotlines
        </h2>
        <ul className="mt-4 divide-y text-sm">
          {HOTLINES.map((h) => (
            <li key={h.label} className="flex justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">{h.label}</span>
              <a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-medium tabular-nums hover:text-primary">
                {h.number}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
