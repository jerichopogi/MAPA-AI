import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiEndpoints, Routes } from "@/lib/constants";
import { Trip, Itinerary } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, generateDateRangeText, getMonthName } from "@/lib/utils";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const TripDetails = () => {
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [itineraryType, setItineraryType] = useState<"budget" | "experience">("budget");
  
  // Fetch trip details
  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: [`${ApiEndpoints.TRIPS}/${params.id}`],
  });

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `${ApiEndpoints.TRIPS}/${params.id}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Trip Deleted",
        description: "Your trip has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [ApiEndpoints.TRIPS] });
      navigate(Routes.MY_TRIPS);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete trip",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Update trip status mutation
  const updateTripStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PATCH", `${ApiEndpoints.TRIPS}/${params.id}`, { status });
      return status;
    },
    onSuccess: (status) => {
      toast({
        title: "Status Updated",
        description: `Trip status has been updated to ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`${ApiEndpoints.TRIPS}/${params.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Get destination image based on the country (in a real app this would be stored with the trip)
  const getDestinationImage = (country: string): string => {
    const images: Record<string, string> = {
      JPN: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      SGP: "https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      KOR: "https://images.unsplash.com/photo-1543470373-e055b73a8f29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      default: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    };
    
    return images[country] || images.default;
  };

  const handleStatusChange = (status: string) => {
    updateTripStatusMutation.mutate(status);
  };

  // Get the selected itinerary
  const getSelectedItinerary = (): Itinerary | undefined => {
    if (!trip) return undefined;
    return itineraryType === "budget" ? trip.budgetItinerary : trip.experienceItinerary;
  };

  // Format travel preferences
  const formatPreferences = (preferences: string[]): string => {
    return preferences.map(pref => pref.charAt(0).toUpperCase() + pref.slice(1)).join(", ");
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.upcoming;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Error Loading Trip</h3>
                  <p className="text-neutral-600 mb-6">
                    {error instanceof Error ? error.message : "An unexpected error occurred while loading your trip details."}
                  </p>
                  <Button className="bg-primary" onClick={() => navigate(Routes.MY_TRIPS)}>
                    Return to My Trips
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-4">
                    <i className="fas fa-search text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Trip Not Found</h3>
                  <p className="text-neutral-600 mb-6">
                    We couldn't find the trip you're looking for. It may have been deleted or you might not have access to it.
                  </p>
                  <Button className="bg-primary" onClick={() => navigate(Routes.MY_TRIPS)}>
                    Return to My Trips
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    );
  }

  const selectedItinerary = getSelectedItinerary();

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Banner */}
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          <img 
            src={getDestinationImage(trip.destinationCountry)} 
            alt={trip.name} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center mb-1">
                  <Badge className={getStatusBadge(trip.status)}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{trip.name}</h1>
                <p className="text-white/90 mt-1">
                  {trip.startDate && trip.endDate 
                    ? generateDateRangeText(trip.startDate, trip.endDate) 
                    : `${trip.duration} days in ${getMonthName(trip.travelMonth)}`}
                </p>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                  <i className="fas fa-share-alt mr-2"></i>
                  Share
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <i className="fas fa-trash-alt mr-2"></i>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this trip and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteTripMutation.mutate()}
                        className="bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Trip Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Origin</dt>
                      <dd className="font-medium">{trip.originAirport}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Destination</dt>
                      <dd className="font-medium">{trip.destinationCountry}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Duration</dt>
                      <dd className="font-medium">{trip.duration} days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Travel Month</dt>
                      <dd className="font-medium">{getMonthName(trip.travelMonth)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Budget</dt>
                      <dd className="font-medium">{formatCurrency(trip.budget, trip.currency)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Created</dt>
                      <dd className="font-medium">{new Date(trip.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {trip.preferences.map((preference, index) => (
                      <div key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {preference.charAt(0).toUpperCase() + preference.slice(1)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4">Current status: <span className="font-medium">{trip.status}</span></p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleStatusChange("upcoming")}
                      variant="outline" 
                      className="w-full justify-start"
                      disabled={trip.status === "upcoming"}
                    >
                      <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>
                      Mark as Upcoming
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange("completed")}
                      variant="outline" 
                      className="w-full justify-start"
                      disabled={trip.status === "completed"}
                    >
                      <i className="fas fa-check-circle mr-2 text-green-500"></i>
                      Mark as Completed
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange("cancelled")}
                      variant="outline" 
                      className="w-full justify-start"
                      disabled={trip.status === "cancelled"}
                    >
                      <i className="fas fa-ban mr-2 text-red-500"></i>
                      Mark as Cancelled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Itinerary Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Itinerary</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-print mr-2"></i>
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <i className="fas fa-edit mr-2"></i>
                    Edit
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <CardTitle>{trip.name} Itinerary</CardTitle>
                      <CardDescription>AI-generated travel plan based on your preferences</CardDescription>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <Tabs 
                        defaultValue="budget" 
                        value={itineraryType}
                        onValueChange={(value) => setItineraryType(value as "budget" | "experience")}
                        className="w-full md:w-auto"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="budget">Budget-Focused</TabsTrigger>
                          <TabsTrigger value="experience">Experience-Focused</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {selectedItinerary ? (
                    <div>
                      <div className="mb-6">
                        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                          <h3 className="font-medium mb-2">{selectedItinerary.summary}</h3>
                          <div className="flex items-center">
                            <div className="text-primary font-semibold">
                              Total Cost: {formatCurrency(selectedItinerary.totalCost, trip.currency)}
                            </div>
                            <Badge className="ml-3 bg-neutral-200 text-neutral-700">
                              {trip.duration} days
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {selectedItinerary.dailyPlans.map((day) => (
                            <div key={day.day} className="border rounded-lg overflow-hidden">
                              <div className="bg-primary/5 px-4 py-3 border-b">
                                <h3 className="font-medium">Day {day.day}</h3>
                              </div>
                              
                              <div className="p-4">
                                <div className="space-y-4">
                                  {day.activities.map((activity, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                      <div>
                                        <span className="text-sm font-medium text-neutral-500">{activity.time}: </span>
                                        <span>{activity.description}</span>
                                      </div>
                                      <span className="text-sm text-neutral-600 ml-4">
                                        {formatCurrency(activity.cost, trip.currency)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div>
                                  <h4 className="font-medium mb-2">Accommodation</h4>
                                  <div className="flex justify-between">
                                    <div>{day.accommodation.name}</div>
                                    <div className="text-sm text-neutral-600">
                                      {formatCurrency(day.accommodation.cost, trip.currency)}
                                    </div>
                                  </div>
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div>
                                  <h4 className="font-medium mb-2">Meals</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-neutral-500 mr-2">Breakfast:</span>
                                        <span>{day.meals.breakfast.description}</span>
                                      </div>
                                      <div className="text-sm text-neutral-600">
                                        {formatCurrency(day.meals.breakfast.cost, trip.currency)}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-neutral-500 mr-2">Lunch:</span>
                                        <span>{day.meals.lunch.description}</span>
                                      </div>
                                      <div className="text-sm text-neutral-600">
                                        {formatCurrency(day.meals.lunch.cost, trip.currency)}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-neutral-500 mr-2">Dinner:</span>
                                        <span>{day.meals.dinner.description}</span>
                                      </div>
                                      <div className="text-sm text-neutral-600">
                                        {formatCurrency(day.meals.dinner.cost, trip.currency)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t flex justify-between">
                                  <span className="font-medium">Daily Total</span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      day.activities.reduce((sum, act) => sum + act.cost, 0) +
                                      day.accommodation.cost +
                                      day.meals.breakfast.cost +
                                      day.meals.lunch.cost +
                                      day.meals.dinner.cost,
                                      trip.currency
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-4">
                        <i className="fas fa-exclamation-circle text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Itinerary Found</h3>
                      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                        It seems there's no itinerary data available for this trip. You may need to generate one.
                      </p>
                      <Button className="bg-primary">Generate Itinerary</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Booking Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Booking Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-plane-departure text-primary mr-2"></i>
                      Flights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-3">
                      Book your flights to {trip.destinationCountry} for your upcoming trip.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button className="w-full">
                      Search Flights
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-hotel text-primary mr-2"></i>
                      Accommodations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-3">
                      Find and book hotels that match your itinerary requirements.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button className="w-full">
                      Find Hotels
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-ticket-alt text-primary mr-2"></i>
                      Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-3">
                      Book tours, attractions, and activities for your trip.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button className="w-full">
                      Browse Activities
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            {/* Trip Notes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Trip Notes</h2>
                <Button variant="outline" size="sm">
                  <i className="fas fa-plus mr-2"></i>
                  Add Note
                </Button>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mx-auto mb-4">
                      <i className="fas fa-sticky-note text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
                    <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                      Add your travel notes, reminders, and thoughts about this trip for easy reference.
                    </p>
                    <Button variant="outline">
                      <i className="fas fa-pen mr-2"></i>
                      Create First Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default TripDetails;
