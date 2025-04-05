import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GenerateTripInput } from '@shared/schema';

// Initialize the Google Generative AI with the API key
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Access the generative model
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

export interface TripActivity {
  time: string;
  description: string;
  cost: number;
}

export interface TripAccommodation {
  name: string;
  cost: number;
}

export interface TripMeal {
  description: string;
  cost: number;
}

export interface TripMeals {
  breakfast: TripMeal;
  lunch: TripMeal;
  dinner: TripMeal;
}

export interface DailyPlan {
  day: number;
  activities: TripActivity[];
  accommodation: TripAccommodation;
  meals: TripMeals;
}

export interface Itinerary {
  summary: string;
  dailyPlans: DailyPlan[];
  totalCost: number;
}

export interface GeneratedTripResponse {
  tripName: string;
  budgetItinerary: Itinerary;
  experienceItinerary: Itinerary;
}

/**
 * Generate a trip itinerary using Google Gemini AI
 */
export async function generateTripItinerary(
  tripData: GenerateTripInput, 
  originAirportName: string, 
  destinationCountryName: string,
  cityNames: string[]
): Promise<GeneratedTripResponse> {
  // Create a detailed prompt for Gemini
  const prompt = createTripPrompt(tripData, originAirportName, destinationCountryName, cityNames);
  
  try {
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the JSON response from the AI
    try {
      // First, try to directly parse the response as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON content
      console.error("Failed to parse direct JSON, attempting to extract JSON block:", parseError);
      
      // Log the full response for debugging
      console.log("Full AI response:", responseText);
      
      // Search for JSON content between triple backticks
      let jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) || 
                      responseText.match(/```\n([\s\S]*?)```/);
      
      // If no match with backticks, try to find JSON by pattern matching
      if (!jsonMatch) {
        const jsonPattern = /\{\s*"tripName"[\s\S]*"budgetItinerary"[\s\S]*"experienceItinerary"[\s\S]*\}/;
        const jsonMatchRaw = responseText.match(jsonPattern);
        if (jsonMatchRaw) {
          jsonMatch = ["", jsonMatchRaw[0]];
        }
      }
      
      // Try to extract and clean the JSON content
      if (jsonMatch && jsonMatch[1]) {
        try {
          // Try parsing with some sanitization
          let cleanedJson = jsonMatch[1]
            .replace(/\\n/g, " ")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\s+/g, " ")
            .trim();
            
          // Try to fix common JSON syntax errors from the AI
          
          // Fix missing property values (e.g., "dinner": "cost": 1400} -> "dinner": {"description": "Dinner", "cost": 1400})
          cleanedJson = cleanedJson.replace(/"dinner"\s*:\s*"cost"\s*:\s*(\d+)/g, '"dinner": {"description": "Dinner", "cost": $1}');
          cleanedJson = cleanedJson.replace(/"lunch"\s*:\s*"cost"\s*:\s*(\d+)/g, '"lunch": {"description": "Lunch", "cost": $1}');
          cleanedJson = cleanedJson.replace(/"breakfast"\s*:\s*"cost"\s*:\s*(\d+)/g, '"breakfast": {"description": "Breakfast", "cost": $1}');
          
          // Fix missing quotes around property names
          cleanedJson = cleanedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          
          // Fix common syntax errors in JSON content
          cleanedJson = cleanedJson.replace(/,\s*}/g, '}');  // Remove trailing commas
          cleanedJson = cleanedJson.replace(/,\s*,/g, ',');  // Remove duplicate commas
          cleanedJson = cleanedJson.replace(/}\s*{/g, '},{'); // Fix missing commas between objects
          
          console.log("Attempting to parse cleaned JSON");
          return JSON.parse(cleanedJson);
        } catch (extractError) {
          console.error("Failed to parse extracted JSON:", extractError);
          
          // If all else fails, use regex to extract the necessary components
          try {
            console.log("Attempting alternative JSON reconstruction");
            
            // Extract trip name
            const tripNameMatch = jsonMatch[1].match(/"tripName"\s*:\s*"([^"]+)"/);
            const tripName = tripNameMatch ? tripNameMatch[1] : "Generated Trip";
            
            // Create a simplified response with default values when parsing fails
            return {
              tripName,
              budgetItinerary: {
                summary: "Budget-friendly itinerary (reconstructed due to parsing error)",
                dailyPlans: [
                  {
                    day: 1,
                    activities: [
                      {time: "Morning", description: "Free time to explore", cost: 0},
                      {time: "Afternoon", description: "Local sightseeing", cost: 0},
                      {time: "Evening", description: "Dinner at local restaurant", cost: 0}
                    ],
                    accommodation: {name: "Budget accommodation", cost: 0},
                    meals: {
                      breakfast: {description: "Continental breakfast", cost: 0},
                      lunch: {description: "Local cuisine", cost: 0},
                      dinner: {description: "Restaurant dinner", cost: 0}
                    }
                  }
                ],
                totalCost: 0
              },
              experienceItinerary: {
                summary: "Experience-focused itinerary (reconstructed due to parsing error)",
                dailyPlans: [
                  {
                    day: 1,
                    activities: [
                      {time: "Morning", description: "Guided tour", cost: 0},
                      {time: "Afternoon", description: "Cultural experience", cost: 0},
                      {time: "Evening", description: "Fine dining", cost: 0}
                    ],
                    accommodation: {name: "Luxury accommodation", cost: 0},
                    meals: {
                      breakfast: {description: "Gourmet breakfast", cost: 0},
                      lunch: {description: "Restaurant lunch", cost: 0},
                      dinner: {description: "Fine dining experience", cost: 0}
                    }
                  }
                ],
                totalCost: 0
              }
            };
          } catch (fallbackError) {
            console.error("Failed to create fallback response:", fallbackError);
            throw new Error("Failed to extract valid JSON from AI response");
          }
        }
      }
      
      throw new Error("AI response did not contain valid JSON data");
    }
  } catch (error) {
    console.error("Error generating trip with Gemini:", error);
    throw error;
  }
}

/**
 * Create a structured prompt for the trip generation
 */
function createTripPrompt(
  tripData: GenerateTripInput,
  originAirportName: string,
  destinationCountryName: string,
  cityNames: string[]
): string {
  // Get month name from month number
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const travelMonth = months[tripData.travelMonth - 1];
  
  // Join preferences and cities for the prompt
  const preferences = tripData.preferences.join(", ");
  const cities = cityNames.join(", ");
  
  return `
You are an expert travel planner for Filipino tourists traveling internationally.
I need you to create detailed trip itineraries for a trip with the following details:

TRIP DETAILS:
- Origin: ${originAirportName}
- Destination Country: ${destinationCountryName}
- Cities to visit: ${cities || "Major tourist cities"}
- Travel Month: ${travelMonth}
- Duration: ${tripData.duration} days
- Budget: ${tripData.budget} ${tripData.currency}
- Travel Preferences: ${preferences}

TASK:
Create TWO different itineraries for the same trip that meet the Filipino traveler's needs:
1. A BUDGET-FRIENDLY itinerary that maximizes value for money
2. An EXPERIENCE-FOCUSED itinerary that prioritizes unique experiences and comfort

For EACH itinerary, include:
- A short summary of the approach (budget vs experience)
- A day-by-day plan for all ${tripData.duration} days, including:
  * Morning, afternoon, and evening activities with estimated costs
  * Accommodation details with cost per night
  * Meal suggestions (breakfast, lunch, dinner) with estimated costs
- A total estimated cost for the entire trip

FORMAT INSTRUCTIONS:
I need your response to be EXACTLY a valid JSON object with no other text or explanations.
The JSON must match this schema precisely:

{
  "tripName": string,
  "budgetItinerary": {
    "summary": string,
    "dailyPlans": [
      {
        "day": number,
        "activities": [
          {"time": string, "description": string, "cost": number},
          {"time": string, "description": string, "cost": number},
          {"time": string, "description": string, "cost": number}
        ],
        "accommodation": {"name": string, "cost": number},
        "meals": {
          "breakfast": {"description": string, "cost": number},
          "lunch": {"description": string, "cost": number},
          "dinner": {"description": string, "cost": number}
        }
      }
    ],
    "totalCost": number
  },
  "experienceItinerary": {
    "summary": string,
    "dailyPlans": [
      {
        "day": number,
        "activities": [
          {"time": string, "description": string, "cost": number},
          {"time": string, "description": string, "cost": number},
          {"time": string, "description": string, "cost": number}
        ],
        "accommodation": {"name": string, "cost": number},
        "meals": {
          "breakfast": {"description": string, "cost": number},
          "lunch": {"description": string, "cost": number},
          "dinner": {"description": string, "cost": number}
        }
      }
    ],
    "totalCost": number
  }
}

CRITICAL: Your ENTIRE response should be ONLY a valid JSON object with no comments, explanations, or text outside the JSON structure.
Do NOT include backticks, markdown formatting, or any other text.
`;
}