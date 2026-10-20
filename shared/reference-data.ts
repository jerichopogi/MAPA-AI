// Static reference data. It rarely changes, so it ships with the app
// instead of living in the database.

export interface Option {
  code: string;
  name: string;
}

export interface Preference extends Option {
  icon: string; // lucide-react icon name, resolved in the client
}

export const AIRPORTS: Option[] = [
  { code: "MNL", name: "Manila – Ninoy Aquino Intl" },
  { code: "CEB", name: "Cebu – Mactan-Cebu Intl" },
  { code: "CRK", name: "Clark Intl" },
  { code: "DVO", name: "Davao – Francisco Bangoy Intl" },
  { code: "ILO", name: "Iloilo Intl" },
  { code: "BCD", name: "Bacolod-Silay Intl" },
  { code: "KLO", name: "Kalibo Intl" },
  { code: "TAG", name: "Bohol – Panglao Intl" },
  { code: "PPS", name: "Puerto Princesa Intl" },
  { code: "ZAM", name: "Zamboanga Intl" },
  { code: "CGY", name: "Cagayan de Oro – Laguindingan" },
  { code: "GES", name: "General Santos Intl" },
];

export const COUNTRIES: Option[] = [
  { code: "JPN", name: "Japan" },
  { code: "KOR", name: "South Korea" },
  { code: "SGP", name: "Singapore" },
  { code: "THA", name: "Thailand" },
  { code: "VNM", name: "Vietnam" },
  { code: "MYS", name: "Malaysia" },
  { code: "IDN", name: "Indonesia" },
  { code: "HKG", name: "Hong Kong" },
  { code: "TWN", name: "Taiwan" },
  { code: "AUS", name: "Australia" },
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "GBR", name: "United Kingdom" },
  { code: "FRA", name: "France" },
  { code: "ITA", name: "Italy" },
  { code: "ESP", name: "Spain" },
];

export const CURRENCIES: Option[] = [
  { code: "PHP", name: "Philippine Peso" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "KRW", name: "Korean Won" },
  { code: "THB", name: "Thai Baht" },
];

export const PREFERENCES: Preference[] = [
  { code: "landmarks", name: "Landmarks", icon: "Landmark" },
  { code: "food", name: "Food", icon: "UtensilsCrossed" },
  { code: "shopping", name: "Shopping", icon: "ShoppingBag" },
  { code: "adventure", name: "Adventure", icon: "Mountain" },
  { code: "culture", name: "Culture", icon: "Drama" },
  { code: "photo", name: "Photo spots", icon: "Camera" },
  { code: "nature", name: "Nature", icon: "Leaf" },
  { code: "nightlife", name: "Nightlife", icon: "Moon" },
];

export const CITIES_BY_COUNTRY: Record<string, Option[]> = {
  JPN: [
    { code: "TYO", name: "Tokyo" },
    { code: "OSA", name: "Osaka" },
    { code: "KYO", name: "Kyoto" },
    { code: "HIJ", name: "Hiroshima" },
    { code: "SPK", name: "Sapporo" },
    { code: "FUK", name: "Fukuoka" },
    { code: "OKA", name: "Okinawa" },
  ],
  KOR: [
    { code: "SEL", name: "Seoul" },
    { code: "PUS", name: "Busan" },
    { code: "CJU", name: "Jeju" },
    { code: "ICN", name: "Incheon" },
  ],
  SGP: [{ code: "SIN", name: "Singapore" }],
  THA: [
    { code: "BKK", name: "Bangkok" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "HKT", name: "Phuket" },
    { code: "KBV", name: "Krabi" },
  ],
  VNM: [
    { code: "HAN", name: "Hanoi" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "DAD", name: "Da Nang" },
    { code: "HOI", name: "Hoi An" },
  ],
  MYS: [
    { code: "KUL", name: "Kuala Lumpur" },
    { code: "PEN", name: "Penang" },
    { code: "BKI", name: "Kota Kinabalu" },
  ],
  IDN: [
    { code: "DPS", name: "Bali" },
    { code: "JKT", name: "Jakarta" },
    { code: "JOG", name: "Yogyakarta" },
  ],
  HKG: [{ code: "HKG", name: "Hong Kong" }],
  TWN: [
    { code: "TPE", name: "Taipei" },
    { code: "KHH", name: "Kaohsiung" },
    { code: "RMQ", name: "Taichung" },
    { code: "TNN", name: "Tainan" },
  ],
  AUS: [
    { code: "SYD", name: "Sydney" },
    { code: "MEL", name: "Melbourne" },
    { code: "BNE", name: "Brisbane" },
    { code: "PER", name: "Perth" },
  ],
  USA: [
    { code: "NYC", name: "New York" },
    { code: "LAX", name: "Los Angeles" },
    { code: "SFO", name: "San Francisco" },
    { code: "LAS", name: "Las Vegas" },
    { code: "HNL", name: "Honolulu" },
  ],
  CAN: [
    { code: "YVR", name: "Vancouver" },
    { code: "YYZ", name: "Toronto" },
  ],
  GBR: [
    { code: "LON", name: "London" },
    { code: "EDI", name: "Edinburgh" },
  ],
  FRA: [
    { code: "PAR", name: "Paris" },
    { code: "NCE", name: "Nice" },
  ],
  ITA: [
    { code: "ROM", name: "Rome" },
    { code: "FLR", name: "Florence" },
    { code: "VCE", name: "Venice" },
  ],
  ESP: [
    { code: "MAD", name: "Madrid" },
    { code: "BCN", name: "Barcelona" },
  ],
};

/** Main international arrival airport per destination (for flight suggestions). */
export const MAIN_AIRPORT: Record<string, string> = {
  JPN: "NRT", KOR: "ICN", SGP: "SIN", THA: "BKK", VNM: "HAN", MYS: "KUL", IDN: "DPS", HKG: "HKG",
  TWN: "TPE", AUS: "SYD", USA: "LAX", CAN: "YVR", GBR: "LHR", FRA: "CDG", ITA: "FCO", ESP: "MAD",
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const byCode = (list: Option[]) => new Map(list.map((o) => [o.code, o.name]));
const airportNames = byCode(AIRPORTS);
const countryNames = byCode(COUNTRIES);
const preferenceNames = byCode(PREFERENCES);

export const airportName = (code: string) => airportNames.get(code) ?? code;
export const countryName = (code: string) => countryNames.get(code) ?? code;
export const preferenceName = (code: string) => preferenceNames.get(code) ?? code;
export const cityName = (country: string, code: string) =>
  CITIES_BY_COUNTRY[country]?.find((c) => c.code === code)?.name ?? code;
export const monthName = (month: number) => MONTHS[month - 1] ?? "";

/** Visa basics for Philippine passports, used in reminder emails (always "check the embassy"). */
export const VISA_BASICS: Record<string, { required: boolean; note: string }> = {
  JPN: { required: true, note: "Apply through a DFA-accredited agency; processing is about 5–7 working days." },
  KOR: { required: true, note: "Apply through the Korea Visa Application Center; allow 1–2 weeks." },
  TWN: { required: true, note: "Check visa-free eligibility first; otherwise apply for an eVisa or visitor visa." },
  USA: { required: true, note: "B-1/B-2 visa with an embassy interview — appointments can take months." },
  CAN: { required: true, note: "Visitor visa applied online; biometrics required, allow several weeks." },
  AUS: { required: true, note: "Visitor visa (subclass 600) applied online; allow 3–6 weeks." },
  GBR: { required: true, note: "Standard Visitor visa with biometrics; allow about 3 weeks." },
  FRA: { required: true, note: "Schengen visa (with travel insurance); book the appointment early." },
  ITA: { required: true, note: "Schengen visa (with travel insurance); book the appointment early." },
  ESP: { required: true, note: "Schengen visa (with travel insurance); book the appointment early." },
  SGP: { required: false, note: "Visa-free up to 30 days. Submit the SG Arrival Card within 3 days before arrival." },
  THA: { required: false, note: "Visa-free for tourism. Keep your return ticket and hotel booking handy." },
  VNM: { required: false, note: "Visa-free up to 21 days." },
  MYS: { required: false, note: "Visa-free up to 30 days. Fill in the MDAC arrival card before you fly." },
  IDN: { required: false, note: "Visa-free for ASEAN citizens. Keep your return ticket handy." },
  HKG: { required: false, note: "Visa-free up to 14 days." },
};

/** Power plug types travelers need adapters for (the Philippines uses A/B/C). */
export const PLUG_TYPES: Record<string, string> = {
  JPN: "A/B (same as PH — usually no adapter)", KOR: "C/F", SGP: "G", THA: "A/B/C/O", VNM: "A/C",
  MYS: "G", IDN: "C/F", HKG: "G", TWN: "A/B (same as PH)", AUS: "I", USA: "A/B (same as PH)",
  CAN: "A/B (same as PH)", GBR: "G", FRA: "C/E", ITA: "C/F/L", ESP: "C/F",
};
