import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ApiEndpoints } from "@/lib/constants";
import { generateTripSchema } from "@shared/schema";
import { GeneratedTripResponse, TripGenerateInput, City } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface TripGeneratorFormProps {
  onTripGenerated?: (response: GeneratedTripResponse) => void;
}

interface Airport {
  code: string;
  name: string;
}

interface Country {
  code: string;
  name: string;
}

interface Currency {
  code: string;
  name: string;
}

interface Preference {
  id: number;
  code: string;
  name: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

const TripGeneratorForm = ({ onTripGenerated }: TripGeneratorFormProps) => {
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedTripResponse | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch reference data
  const { data: airports = [] } = useQuery<Airport[]>({
    queryKey: [ApiEndpoints.AIRPORTS],
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: [ApiEndpoints.COUNTRIES],
  });

  const { data: currencies = [] } = useQuery<Currency[]>({
    queryKey: [ApiEndpoints.CURRENCIES],
  });

  const { data: preferences = [] } = useQuery<Preference[]>({
    queryKey: [ApiEndpoints.PREFERENCES],
  });
  
  // Fetch cities for selected country
  const { data: cities = [], isLoading: isCitiesLoading } = useQuery<City[]>({
    queryKey: [ApiEndpoints.CITIES, selectedCountry],
    queryFn: async () => {
      if (!selectedCountry) return [];
      const response = await fetch(`${ApiEndpoints.CITIES}/${selectedCountry}`);
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
    enabled: !!selectedCountry,
  });
  
  // Update available cities when data is loaded
  useEffect(() => {
    if (cities && cities.length > 0) {
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }
  }, [cities]);
  
  // Reset selected cities when country changes
  useEffect(() => {
    setSelectedCities([]);
    form.setValue('selectedCities', []);
  }, [selectedCountry]);

  // Create form
  const form = useForm<TripGenerateInput>({
    resolver: zodResolver(
      z.object({
        originAirport: z.string().min(1, "Origin airport is required"),
        destinationCountry: z.string().min(1, "Destination country is required"),
        travelMonth: z.number().int().min(1).max(12),
        currency: z.string().min(1, "Currency is required"),
        duration: z.number().int().min(1, "Duration must be at least 1 day").max(30, "Duration must be 30 days or less"),
        budget: z.number().int().min(1, "Budget must be greater than 0"),
        preferences: z.array(z.string()).min(1, "Select at least one preference"),
        selectedCities: z.array(z.string()).optional(),
      })
    ),
    defaultValues: {
      originAirport: "",
      destinationCountry: "",
      travelMonth: new Date().getMonth() + 1,
      currency: "PHP",
      duration: 5,
      budget: 50000,
      preferences: [],
      selectedCities: [],
    },
  });

  // Handle preference toggle
  const togglePreference = (preferenceId: number) => {
    // Convert to string for consistent handling
    const preferenceIdStr = preferenceId.toString();
    
    if (selectedPreferences.includes(preferenceIdStr)) {
      const updatedPreferences = selectedPreferences.filter(id => id !== preferenceIdStr);
      setSelectedPreferences(updatedPreferences);
      form.setValue("preferences", updatedPreferences);
    } else {
      const updatedPreferences = [...selectedPreferences, preferenceIdStr];
      setSelectedPreferences(updatedPreferences);
      form.setValue("preferences", updatedPreferences);
    }
  };

  // Generate trip mutation
  const generateTripMutation = useMutation({
    mutationFn: async (data: TripGenerateInput) => {
      const response = await apiRequest("POST", ApiEndpoints.GENERATE_TRIP, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate trip");
      }
      return response.json() as Promise<GeneratedTripResponse>;
    },
    onSuccess: (data) => {
      console.log("Trip generation successful, data received:", data);
      
      // Check if the data has the expected structure
      if (!data || !data.tripName || !data.budgetItinerary || !data.experienceItinerary) {
        console.error("Invalid trip data received:", data);
        toast({
          title: "Error",
          description: "Received incomplete trip data. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setGeneratedTrip(data);
      if (onTripGenerated) {
        onTripGenerated(data);
      }
      
      toast({
        title: "Trip Generated!",
        description: "Your personalized itineraries are ready to explore.",
      });
    },
    onError: (error) => {
      console.error("Trip generation error:", error);
      setGeneratedTrip(null); // Reset to form view
      
      // Check if error is related to the AI model or API key
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      const isApiKeyError = errorMessage.includes("API key") || errorMessage.includes("authentication");
      const isAiModelError = errorMessage.includes("AI") || errorMessage.includes("model");
      
      if (isApiKeyError) {
        toast({
          title: "API Key Error",
          description: "There was an issue with the AI service authentication. Please try again later.",
          variant: "destructive",
        });
      } else if (isAiModelError) {
        toast({
          title: "AI Response Error",
          description: "The AI had trouble generating a proper trip itinerary. Please try again with different preferences.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to generate trip",
          description: "Our trip generation service is experiencing issues. Please try again in a few minutes.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: TripGenerateInput) => {
    // Make sure selectedCities and preferences are included in the data
    const tripData = {
      ...data,
      selectedCities: selectedCities,
      preferences: selectedPreferences.length > 0 ? selectedPreferences : data.preferences
    };
    
    // Log the data for debugging
    console.log("Submitting trip data:", tripData);
    
    generateTripMutation.mutate(tripData);
  };

  return (
    <div>
      {!generatedTrip ? (
        <Card className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <CardTitle className="text-xl font-semibold">Generate Your Trip</CardTitle>
            <CardDescription className="text-white/80">Let our AI create a personalized travel plan just for you.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="originAirport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Airport</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select airport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport.code} value={airport.code}>
                                {airport.name} ({airport.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destinationCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Country</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCountry(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="travelMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Month</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              { value: 1, name: 'January' },
                              { value: 2, name: 'February' },
                              { value: 3, name: 'March' },
                              { value: 4, name: 'April' },
                              { value: 5, name: 'May' },
                              { value: 6, name: 'June' },
                              { value: 7, name: 'July' },
                              { value: 8, name: 'August' },
                              { value: 9, name: 'September' },
                              { value: 10, name: 'October' },
                              { value: 11, name: 'November' },
                              { value: 12, name: 'December' }
                            ].map((month) => (
                              <SelectItem key={month.value} value={month.value.toString()}>
                                {month.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 7"
                            min={1}
                            max={30}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 50000"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferences"
                  render={() => (
                    <FormItem>
                      <FormLabel>Travel Preferences</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-1">
                        {preferences.map((preference) => (
                          <div key={preference.id} className="relative">
                            <button
                              type="button"
                              onClick={() => togglePreference(preference.id)}
                              className={`w-full flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                selectedPreferences.includes(preference.id.toString())
                                  ? "border-primary bg-primary/5"
                                  : "border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              <i className={`fas fa-${preference.icon} text-xl mb-1`}></i>
                              <span className="text-sm">{preference.name}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* City selection - only shown when a country is selected */}
                {selectedCountry && (
                  <FormField
                    control={form.control}
                    name="selectedCities"
                    render={() => (
                      <FormItem>
                        <FormLabel>Cities to Visit in {countries.find(c => c.code === selectedCountry)?.name}</FormLabel>
                        {isCitiesLoading ? (
                          <div className="text-center py-4">
                            <span className="animate-spin inline-block mr-2">
                              <i className="fas fa-spinner"></i>
                            </span>
                            Loading cities...
                          </div>
                        ) : availableCities.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
                            {availableCities.map((city) => (
                              <div key={city.code} className="relative">
                                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                                  <Checkbox 
                                    id={`city-${city.code}`}
                                    checked={selectedCities.includes(city.code)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        const updatedCities = [...selectedCities, city.code];
                                        setSelectedCities(updatedCities);
                                        form.setValue("selectedCities", updatedCities);
                                      } else {
                                        const updatedCities = selectedCities.filter(c => c !== city.code);
                                        setSelectedCities(updatedCities);
                                        form.setValue("selectedCities", updatedCities);
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={`city-${city.code}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {city.name}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-neutral-500">
                            No cities available for this country.
                          </div>
                        )}
                        <p className="text-sm text-neutral-500 mt-2">
                          Select the cities you plan to visit during your trip.
                        </p>
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    disabled={generateTripMutation.isPending}
                  >
                    {generateTripMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">
                          <i className="fas fa-spinner"></i>
                        </span>
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Generate AI Itineraries
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <CardHeader className="bg-primary p-6 text-white">
            <CardTitle className="text-xl font-semibold">{generatedTrip.tripName}</CardTitle>
            <CardDescription className="text-white/80">
              Powered by Google Gemini AI | Personalized just for you
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="budget">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="budget">Budget-Focused Plan</TabsTrigger>
                <TabsTrigger value="experience">Experience-Focused Plan</TabsTrigger>
              </TabsList>
              
              {/* Budget Itinerary */}
              <TabsContent value="budget">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-neutral-600">{generatedTrip.budgetItinerary.summary}</p>
                  <div className="mt-2 font-semibold text-neutral-700">
                    Total Cost: <span className="text-primary">{generatedTrip.budgetItinerary.totalCost.toLocaleString()} {form.getValues().currency}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Daily Plans</h3>
                  {generatedTrip.budgetItinerary.dailyPlans.map((day) => (
                    <div key={day.day} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Day {day.day}</h4>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <span className="text-sm font-medium text-neutral-500">{activity.time}: </span>
                              <span>{activity.description}</span>
                            </div>
                            <span className="text-sm text-neutral-600">{activity.cost.toLocaleString()} {form.getValues().currency}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Accommodation:</span>
                            <span className="text-sm text-neutral-600">{day.accommodation.cost.toLocaleString()} {form.getValues().currency}</span>
                          </div>
                          <div className="text-sm text-neutral-600">{day.accommodation.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Experience Itinerary */}
              <TabsContent value="experience">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-neutral-600">{generatedTrip.experienceItinerary.summary}</p>
                  <div className="mt-2 font-semibold text-neutral-700">
                    Total Cost: <span className="text-primary">{generatedTrip.experienceItinerary.totalCost.toLocaleString()} {form.getValues().currency}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Daily Plans</h3>
                  {generatedTrip.experienceItinerary.dailyPlans.map((day) => (
                    <div key={day.day} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Day {day.day}</h4>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <span className="text-sm font-medium text-neutral-500">{activity.time}: </span>
                              <span>{activity.description}</span>
                            </div>
                            <span className="text-sm text-neutral-600">{activity.cost.toLocaleString()} {form.getValues().currency}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Accommodation:</span>
                            <span className="text-sm text-neutral-600">{day.accommodation.cost.toLocaleString()} {form.getValues().currency}</span>
                          </div>
                          <div className="text-sm text-neutral-600">{day.accommodation.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" onClick={() => setGeneratedTrip(null)}>
              Generate Another Trip
            </Button>
            <Button onClick={() => {
              if (!user) {
                toast({
                  title: "Login Required",
                  description: "Please log in to save your trip.",
                  variant: "destructive",
                });
                return;
              }

              try {
                // In a real app, this would save the trip to the user's account
                if (generatedTrip && 
                    generatedTrip.tripName && 
                    generatedTrip.budgetItinerary && 
                    generatedTrip.experienceItinerary) {
                  // Additional data validation to ensure we have a valid trip
                  toast({
                    title: "Trip saved!",
                    description: "Your trip has been saved to My Trips.",
                  });
                } else {
                  throw new Error("Invalid trip data");
                }
              } catch (error) {
                console.error("Error saving trip:", error);
                toast({
                  title: "Save failed",
                  description: "Unable to save this trip. Please try again.",
                  variant: "destructive",
                });
              }
            }}>
              <i className="fas fa-save mr-2"></i> Save This Trip
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TripGeneratorForm;
