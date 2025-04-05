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
      
      // Search for JSON content between triple backticks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) || 
                         responseText.match(/```\n([\s\S]*?)```/);
                         
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (extractError) {
          console.error("Failed to parse extracted JSON:", extractError);
          throw new Error("Failed to extract valid JSON from AI response");
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

FORMAT:
Return ONLY a valid JSON object exactly matching this structure:
{
  "tripName": "Trip to [Destination]",
  "budgetItinerary": {
    "summary": "Short description of budget approach",
    "dailyPlans": [
      {
        "day": 1,
        "activities": [
          {"time": "Morning", "description": "Activity description", "cost": 1000},
          {"time": "Afternoon", "description": "Activity description", "cost": 1000},
          {"time": "Evening", "description": "Activity description", "cost": 1000}
        ],
        "accommodation": {"name": "Accommodation name", "cost": 2000},
        "meals": {
          "breakfast": {"description": "Meal description", "cost": 500},
          "lunch": {"description": "Meal description", "cost": 800},
          "dinner": {"description": "Meal description", "cost": 1000}
        }
      }
      // Additional days...
    ],
    "totalCost": 50000
  },
  "experienceItinerary": {
    // Same structure as budgetItinerary
  }
}

Do NOT include any explanations, introductions, or additional text outside the JSON.
Return ONLY the JSON object exactly as specified.
`;
}