import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { ApiEndpoints, Routes, DESTINATIONS } from "@/lib/constants";
import { Trip } from "@/lib/types";
import { Link } from "wouter";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TripCard from "@/components/trip-card";
import TripGeneratorForm from "@/components/trip-generator-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user trips
  const { data: trips = [], isLoading: isLoadingTrips } = useQuery<Trip[]>({
    queryKey: [ApiEndpoints.TRIPS],
  });

  const recentTrips = trips.slice(0, 3); // Get only the 3 most recent trips

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
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for destinations, experiences, or travel tips"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button type="button" className="p-1 rounded-full text-neutral-500 hover:text-neutral-600">
                <span className="sr-only">View notifications</span>
                <i className="fas fa-bell"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-sans text-neutral-800">Welcome, {user?.fullName || user?.username}!</h1>
              <p className="text-neutral-600">Ready to plan your next adventure?</p>
            </div>

            {/* Trip Generator Card */}
            <TripGeneratorForm />

            {/* Recent Trips Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800">Recent Trips</h2>
                <Link href={Routes.MY_TRIPS}>
                  <a className="text-primary text-sm hover:text-primary-dark">View all</a>
                </Link>
              </div>
              
              {isLoadingTrips ? (
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
              ) : recentTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <Card className="bg-white p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <i className="fas fa-suitcase text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
                    <p className="text-neutral-600 mb-6">Generate your first trip itinerary to get started!</p>
                    <Link href="#trip-generator">
                      <Button className="bg-primary text-white hover:bg-primary-dark">
                        <i className="fas fa-plus mr-2"></i> Create Your First Trip
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>

            {/* Travel Inspiration Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800">Travel Inspiration</h2>
                <a href="#inspiration" className="text-primary text-sm hover:text-primary-dark">View all</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DESTINATIONS.slice(0, 3).map((destination, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-md relative group">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">{destination.name}</h3>
                      <p className="text-sm opacity-90">
                        {destination.description.length > 50 
                          ? `${destination.description.substring(0, 50)}...` 
                          : destination.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default Dashboard;
