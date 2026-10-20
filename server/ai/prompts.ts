import type { GenerateTripInput, LocalSecretsQueryInput, VisaQueryInput } from "@shared/schema";
import { airportName, cityName, countryName, monthName, preferenceName } from "@shared/reference-data";

export function tripPrompt(input: GenerateTripInput) {
  const cities = (input.selectedCities ?? []).map((c) => cityName(input.destinationCountry, c));
  return `Plan a trip with these details:
- Origin: ${airportName(input.originAirport)}
- Destination: ${countryName(input.destinationCountry)}
- Cities: ${cities.join(", ") || "the most popular cities"}
- Month: ${monthName(input.travelMonth)}
- Duration: ${input.duration} days
- Total budget: ${input.budget} ${input.currency}
- Interests: ${input.preferences.map(preferenceName).join(", ")}

Create TWO itineraries: a budget-friendly one that stays within the budget, and an
experience-focused one that prioritises comfort and memorable experiences.
Every day has exactly three activities (Morning, Afternoon, Evening).
All costs are numbers in ${input.currency}. totalCost includes activities, meals and accommodation.

Respond with JSON matching:
{"tripName": string,
 "budgetItinerary": Itinerary, "experienceItinerary": Itinerary}
where Itinerary = {"summary": string, "totalCost": number, "dailyPlans": [{
  "day": number, "title": string,
  "activities": [{"time": "Morning"|"Afternoon"|"Evening", "description": string, "cost": number}],
  "accommodation": {"name": string, "cost": number},
  "meals": {"breakfast": {"description": string, "cost": number},
            "lunch": {"description": string, "cost": number},
            "dinner": {"description": string, "cost": number}}}]}`;
}

const PURPOSES: Record<VisaQueryInput["purpose"], string> = {
  tourism: "tourism",
  business: "business",
  family: "visiting family or friends",
  education: "study",
  medical: "medical treatment",
};

export function visaPrompt(input: VisaQueryInput) {
  return `A Philippine passport holder plans to visit ${countryName(input.destination)} for
${PURPOSES[input.purpose]}, staying ${input.duration} days. ${
    input.hasVisitedBefore ? "They have visited before." : "This is their first visit."
  }
Explain the visa requirements. Fees in PHP where possible. Embassy info is the
${countryName(input.destination)} embassy in Manila.

Respond with JSON matching:
{"country": string, "visaRequired": boolean, "visaType": string, "stayDuration": string,
 "processingTime": string, "fee": string, "requirements": string[], "notes": string,
 "embassyInfo": {"name": string, "address": string, "phone": string, "email": string, "website": string}}`;
}

const CATEGORIES: Record<LocalSecretsQueryInput["category"], string> = {
  food: "local restaurants and street food",
  cafe: "independent cafés",
  sights: "lesser-known sights",
  shopping: "local markets and shops",
  nature: "parks, gardens and nature spots",
  nightlife: "bars and night spots",
};

export function localSecretsPrompt(input: LocalSecretsQueryInput) {
  return `List 6 ${CATEGORIES[input.category]} in ${input.city} that locals love but
tourists often miss. Prefer real, currently operating places.

Respond with JSON: {"places": [{"name": string, "type": string, "neighborhood": string,
"description": string, "priceLevel": 1|2|3|4, "insiderTip": string}]}`;
}
