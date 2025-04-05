import { db } from "../server/db";
import { 
  airports, 
  countries, 
  currencies, 
  preferences, 
  cities 
} from "../shared/schema";

// Constants that were previously in routes.ts
const AIRPORTS = [
  { code: "MNL", name: "Manila Ninoy Aquino International Airport", isPhilippine: true },
  { code: "CEB", name: "Mactan-Cebu International Airport", isPhilippine: true },
  { code: "DVO", name: "Francisco Bangoy International Airport (Davao)", isPhilippine: true },
  { code: "ILO", name: "Iloilo International Airport", isPhilippine: true },
  { code: "BCD", name: "Bacolod-Silay International Airport", isPhilippine: true },
  { code: "CRK", name: "Clark International Airport", isPhilippine: true },
  { code: "KLO", name: "Kalibo International Airport", isPhilippine: true },
  { code: "TAG", name: "Tagbilaran Airport", isPhilippine: true },
  { code: "PPS", name: "Puerto Princesa International Airport", isPhilippine: true },
  { code: "ZAM", name: "Zamboanga International Airport", isPhilippine: true },
  { code: "CGY", name: "Cagayan de Oro Airport", isPhilippine: true },
  { code: "GES", name: "General Santos International Airport", isPhilippine: true },
  { code: "LGP", name: "Legazpi Airport", isPhilippine: true },
  { code: "BXU", name: "Butuan Airport", isPhilippine: true },
  { code: "DGT", name: "Sibulan Airport (Dumaguete)", isPhilippine: true },
  { code: "CYP", name: "Calbayog Airport", isPhilippine: true },
  { code: "CBO", name: "Awang Airport (Cotabato)", isPhilippine: true },
  { code: "SJI", name: "San Jose Airport (Mindoro)", isPhilippine: true },
  { code: "TAC", name: "Daniel Z. Romualdez Airport (Tacloban)", isPhilippine: true },
  { code: "TUG", name: "Tuguegarao Airport", isPhilippine: true }
];

const COUNTRIES = [
  { code: "JPN", name: "Japan" },
  { code: "KOR", name: "South Korea" },
  { code: "SGP", name: "Singapore" },
  { code: "THA", name: "Thailand" },
  { code: "VNM", name: "Vietnam" },
  { code: "MYS", name: "Malaysia" },
  { code: "HKG", name: "Hong Kong" },
  { code: "TWN", name: "Taiwan" },
  { code: "AUS", name: "Australia" },
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "GBR", name: "United Kingdom" },
  { code: "FRA", name: "France" },
  { code: "ITA", name: "Italy" },
  { code: "ESP", name: "Spain" }
];

const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "KRW", name: "Korean Won" },
  { code: "THB", name: "Thai Baht" }
];

const PREFERENCES = [
  { code: "landmarks", name: "Landmarks", icon: "landmark" },
  { code: "food", name: "Food", icon: "utensils" },
  { code: "shopping", name: "Shopping", icon: "shopping-bag" },
  { code: "adventure", name: "Adventure", icon: "hiking" },
  { code: "culture", name: "Culture", icon: "theater-masks" },
  { code: "instagram", name: "Instagrammable Spots", icon: "camera" },
  { code: "nature", name: "Nature", icon: "leaf" },
  { code: "nightlife", name: "Nightlife", icon: "moon" }
];

// Cities by country
const CITIES_BY_COUNTRY = {
  "JPN": [
    { code: "TYO", name: "Tokyo" },
    { code: "OSA", name: "Osaka" },
    { code: "KYO", name: "Kyoto" },
    { code: "HIJ", name: "Hiroshima" },
    { code: "SPK", name: "Sapporo" },
    { code: "NGO", name: "Nagoya" },
    { code: "FUK", name: "Fukuoka" },
    { code: "KOB", name: "Kobe" },
    { code: "OKA", name: "Okinawa" },
    { code: "KIJ", name: "Niigata" }
  ],
  "KOR": [
    { code: "SEL", name: "Seoul" },
    { code: "PUS", name: "Busan" },
    { code: "ICN", name: "Incheon" },
    { code: "CJU", name: "Jeju" },
    { code: "TAE", name: "Daegu" },
    { code: "KWJ", name: "Gwangju" },
    { code: "YNY", name: "Yangyang" }
  ],
  "SGP": [
    { code: "SIN", name: "Singapore" }
  ],
  "THA": [
    { code: "BKK", name: "Bangkok" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "HKT", name: "Phuket" },
    { code: "KBV", name: "Krabi" },
    { code: "USM", name: "Koh Samui" },
    { code: "UTP", name: "Pattaya" }
  ],
  "VNM": [
    { code: "HAN", name: "Hanoi" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "DAD", name: "Da Nang" },
    { code: "HPH", name: "Haiphong" },
    { code: "NHA", name: "Nha Trang" },
    { code: "CXR", name: "Cam Ranh" }
  ],
  "HKG": [
    { code: "HKG", name: "Hong Kong" }
  ],
  "TWN": [
    { code: "TPE", name: "Taipei" },
    { code: "KHH", name: "Kaohsiung" },
    { code: "RMQ", name: "Taichung" },
    { code: "TNN", name: "Tainan" }
  ],
  "AUS": [
    { code: "SYD", name: "Sydney" },
    { code: "MEL", name: "Melbourne" },
    { code: "BNE", name: "Brisbane" },
    { code: "PER", name: "Perth" },
    { code: "ADL", name: "Adelaide" },
    { code: "CBR", name: "Canberra" },
    { code: "CNS", name: "Cairns" },
    { code: "OOL", name: "Gold Coast" }
  ],
  "USA": [
    { code: "NYC", name: "New York" },
    { code: "LAX", name: "Los Angeles" },
    { code: "CHI", name: "Chicago" },
    { code: "MIA", name: "Miami" },
    { code: "SFO", name: "San Francisco" },
    { code: "LAS", name: "Las Vegas" },
    { code: "HNL", name: "Honolulu" },
    { code: "SEA", name: "Seattle" },
    { code: "BOS", name: "Boston" },
    { code: "ATL", name: "Atlanta" }
  ]
};

async function seedReferenceData() {
  console.log("Starting to seed reference data...");

  try {
    // Seed countries first (needed for city foreign keys)
    console.log("Seeding countries...");
    for (const country of COUNTRIES) {
      await db.insert(countries).values({
        code: country.code,
        name: country.name,
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
    console.log(`${COUNTRIES.length} countries seeded successfully.`);

    // Seed airports
    console.log("Seeding airports...");
    for (const airport of AIRPORTS) {
      await db.insert(airports).values({
        code: airport.code,
        name: airport.name,
        isPhilippine: airport.isPhilippine,
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
    console.log(`${AIRPORTS.length} airports seeded successfully.`);

    // Seed currencies
    console.log("Seeding currencies...");
    for (const currency of CURRENCIES) {
      await db.insert(currencies).values({
        code: currency.code,
        name: currency.name,
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
    console.log(`${CURRENCIES.length} currencies seeded successfully.`);

    // Seed preferences
    console.log("Seeding preferences...");
    for (const preference of PREFERENCES) {
      await db.insert(preferences).values({
        code: preference.code,
        name: preference.name,
        icon: preference.icon,
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
    console.log(`${PREFERENCES.length} preferences seeded successfully.`);

    // Seed cities
    console.log("Seeding cities...");
    let cityCount = 0;
    for (const [countryCode, citiesArray] of Object.entries(CITIES_BY_COUNTRY)) {
      for (const city of citiesArray) {
        await db.insert(cities).values({
          code: city.code,
          name: city.name,
          countryCode: countryCode,
          updatedAt: new Date()
        }).onConflictDoNothing();
        cityCount++;
      }
    }
    console.log(`${cityCount} cities seeded successfully.`);

    console.log("All reference data seeded successfully!");
  } catch (error) {
    console.error("Error seeding reference data:", error);
  } finally {
    process.exit(0);
  }
}

seedReferenceData();