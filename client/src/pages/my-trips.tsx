import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "@/lib/constants";
import { Trip } from "@/lib/types";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TripCard from "@/components/trip-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MyTrips = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch user trips
  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: [ApiEndpoints.TRIPS],
  });

  // Filter trips based on status and search term
  const filterTrips = (status: string, search: string) => {
    return trips.filter((trip) => {
      const matchesStatus = status === "all" || trip.status === status;
      const matchesSearch = search === "" || 
        trip.name.toLowerCase().includes(search.toLowerCase()) ||
        trip.destinationCountry.toLowerCase().includes(search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };

  const upcomingTrips = filterTrips("upcoming", searchTerm);
  const completedTrips = filterTrips("completed", searchTerm);
  const cancelledTrips = filterTrips("cancelled", searchTerm);
  const allTrips = filterTrips("all", searchTerm);

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-neutral-200">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Mobile menu button */}
              <button type="button" className="md:hidden px-4 text-neutral-500 focus:outline-none">
                <i className="fas fa-bars"></i>
              </button>
              <div className="max-w-4xl w-full">
                <label htmlFor="search" className="sr-only">Search Trips</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search your trips by name or destination"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold font-sans text-neutral-800">My Trips</h1>
                <p className="text-neutral-600">Manage and view all your travel plans</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="fas fa-plus mr-2"></i> New Trip
                </Button>
              </div>
            </div>

            {/* Trips Grid with Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All
                  <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                    {allTrips.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                    {upcomingTrips.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                    {completedTrips.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled
                  <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                    {cancelledTrips.length}
                  </span>
                </TabsTrigger>
              </TabsList>
              
              {/* All Trips */}
              <TabsContent value="all">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="h-40 bg-neutral-200"></div>
                        <CardContent className="p-4">
                          <div className="h-4 w-2/3 bg-neutral-200 rounded mb-3"></div>
                          <div className="h-3 w-1/2 bg-neutral-100 rounded mb-3"></div>
                          <div className="h-3 w-1/3 bg-neutral-100 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : allTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <i className="fas fa-suitcase text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                      <p className="text-neutral-600 mb-6">
                        {searchTerm ? "Try a different search term or clear your search." : "Start planning your first adventure!"}
                      </p>
                      <Button className="bg-primary text-white hover:bg-primary-dark">
                        <i className="fas fa-plus mr-2"></i> Create New Trip
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
              
              {/* Upcoming Trips */}
              <TabsContent value="upcoming">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="h-40 bg-neutral-200"></div>
                        <CardContent className="p-4">
                          <div className="h-4 w-2/3 bg-neutral-200 rounded mb-3"></div>
                          <div className="h-3 w-1/2 bg-neutral-100 rounded mb-3"></div>
                          <div className="h-3 w-1/3 bg-neutral-100 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : upcomingTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <i className="fas fa-calendar-alt text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No upcoming trips</h3>
                      <p className="text-neutral-600 mb-6">Time to plan your next adventure!</p>
                      <Button className="bg-primary text-white hover:bg-primary-dark">
                        <i className="fas fa-plus mr-2"></i> Plan a Trip
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
              
              {/* Completed Trips */}
              <TabsContent value="completed">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="h-40 bg-neutral-200"></div>
                        <CardContent className="p-4">
                          <div className="h-4 w-2/3 bg-neutral-200 rounded mb-3"></div>
                          <div className="h-3 w-1/2 bg-neutral-100 rounded mb-3"></div>
                          <div className="h-3 w-1/3 bg-neutral-100 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : completedTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <i className="fas fa-check-circle text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No completed trips</h3>
                      <p className="text-neutral-600 mb-6">Your travel memories will appear here once you've completed a trip.</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
              
              {/* Cancelled Trips */}
              <TabsContent value="cancelled">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="h-40 bg-neutral-200"></div>
                        <CardContent className="p-4">
                          <div className="h-4 w-2/3 bg-neutral-200 rounded mb-3"></div>
                          <div className="h-3 w-1/2 bg-neutral-100 rounded mb-3"></div>
                          <div className="h-3 w-1/3 bg-neutral-100 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : cancelledTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cancelledTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <i className="fas fa-ban text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No cancelled trips</h3>
                      <p className="text-neutral-600">Great! You haven't cancelled any trips.</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default MyTrips;
