import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
}

const LocalSecrets = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [localPlaces, setLocalPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("restaurant");
  const { toast } = useToast();

  // Mock places data (in a real app, this would come from an API like Google Places)
  const mockPlaces: Record<string, Place[]> = {
    restaurant: [
      {
        id: "1",
        name: "Local Flavors Restaurant",
        type: "Filipino",
        address: "123 Main Street, Manila",
        rating: 4.5,
        reviewCount: 124,
        imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Authentic Filipino cuisine with a modern twist. Known for their adobo and sinigang."
      },
      {
        id: "2",
        name: "Seafood Bay",
        type: "Seafood",
        address: "456 Beach Road, Manila",
        rating: 4.2,
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Fresh seafood caught daily. Try their grilled squid and prawn curry."
      },
      {
        id: "3",
        name: "Cafe Mindanao",
        type: "Cafe",
        address: "789 Park Avenue, Manila",
        rating: 4.7,
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Cozy cafe serving Mindanao coffee varieties and pastries."
      }
    ],
    cafe: [
      {
        id: "4",
        name: "The Brew Spot",
        type: "Coffee Shop",
        address: "101 River View, Manila",
        rating: 4.6,
        reviewCount: 112,
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Specialty coffee using locally sourced beans. Don't miss their barako blend."
      },
      {
        id: "5",
        name: "Pastry Paradise",
        type: "Bakery & Cafe",
        address: "202 Highland Ave, Manila",
        rating: 4.3,
        reviewCount: 78,
        imageUrl: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Famous for their ube ensaymada and turon. Great place for afternoon merienda."
      }
    ],
    attraction: [
      {
        id: "6",
        name: "Hidden Garden",
        type: "Park",
        address: "303 Mountain View, Manila",
        rating: 4.8,
        reviewCount: 203,
        imageUrl: "https://images.unsplash.com/photo-1584740824323-21e4c15477fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "A tranquil garden with rare plant species and beautiful landscape design."
      },
      {
        id: "7",
        name: "Cultural Museum",
        type: "Museum",
        address: "404 History Lane, Manila",
        rating: 4.4,
        reviewCount: 167,
        imageUrl: "https://images.unsplash.com/photo-1565060169861-33134e42137c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Explore Filipino heritage through interactive exhibits and rare artifacts."
      }
    ],
    shopping: [
      {
        id: "8",
        name: "Artisan Market",
        type: "Marketplace",
        address: "505 Craft Street, Manila",
        rating: 4.5,
        reviewCount: 129,
        imageUrl: "https://images.unsplash.com/photo-1534954553104-88cb75be7648?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Local handcrafted items and souvenirs made by Filipino artisans."
      },
      {
        id: "9",
        name: "Fashion District",
        type: "Shopping Mall",
        address: "606 Style Avenue, Manila",
        rating: 4.1,
        reviewCount: 94,
        imageUrl: "https://images.unsplash.com/photo-1619456146999-766eb76eef1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Trendy boutiques featuring designs by up-and-coming Filipino designers."
      }
    ]
  };

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          // In a real app, you would reverse geocode to get the location name
          // For now, we'll use a placeholder
          setLocationName("Current Location");
          
          // Load places for the default category
          setLocalPlaces(mockPlaces[selectedCategory]);
          
          setIsLoadingLocation(false);
          
          toast({
            title: "Location found",
            description: "Showing secrets near your current location",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          
          toast({
            title: "Location error",
            description: "Could not access your location. Please check your browser settings.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setLocalPlaces(mockPlaces[category]);
  };

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
                <label htmlFor="search-local" className="sr-only">Search Local Places</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search-local"
                    name="search-local"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for local restaurants, cafes, attractions..."
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-sans text-neutral-800">Local Secrets</h1>
              <p className="text-neutral-600">Discover hidden gems and authentic experiences near you</p>
            </div>

            {/* Location Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Location</CardTitle>
                <CardDescription>
                  Allow access to your location to discover nearby hidden gems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    {location ? (
                      <div className="bg-neutral-100 p-4 rounded-lg">
                        <p className="font-medium mb-2">{locationName}</p>
                        <p className="text-sm text-neutral-600">Latitude: {location.lat.toFixed(6)}</p>
                        <p className="text-sm text-neutral-600">Longitude: {location.lng.toFixed(6)}</p>
                      </div>
                    ) : (
                      <div className="bg-neutral-100 p-4 rounded-lg text-center">
                        <p className="text-neutral-600">Location not yet available</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-initial">
                    <Button 
                      onClick={handleGetLocation}
                      className="bg-primary hover:bg-primary-dark w-full md:w-auto"
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-location-arrow mr-2"></i>
                          Get My Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local Secrets Content */}
            {location ? (
              <div>
                <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
                  <TabsList className="mb-6 grid w-full grid-cols-4">
                    <TabsTrigger value="restaurant">
                      <i className="fas fa-utensils mr-2"></i>
                      Restaurants
                    </TabsTrigger>
                    <TabsTrigger value="cafe">
                      <i className="fas fa-coffee mr-2"></i>
                      Cafes
                    </TabsTrigger>
                    <TabsTrigger value="attraction">
                      <i className="fas fa-camera mr-2"></i>
                      Attractions
                    </TabsTrigger>
                    <TabsTrigger value="shopping">
                      <i className="fas fa-shopping-bag mr-2"></i>
                      Shopping
                    </TabsTrigger>
                  </TabsList>
                  
                  {Object.keys(mockPlaces).map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockPlaces[category].map((place) => (
                          <Card key={place.id} className="overflow-hidden">
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={place.imageUrl} 
                                alt={place.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="mb-2 flex justify-between items-start">
                                <h3 className="font-semibold">{place.name}</h3>
                                <div className="flex items-center text-yellow-500">
                                  <i className="fas fa-star mr-1"></i>
                                  <span className="text-sm">{place.rating}</span>
                                  <span className="text-xs text-neutral-500 ml-1">({place.reviewCount})</span>
                                </div>
                              </div>
                              <p className="text-sm text-neutral-500 mb-2">{place.type}</p>
                              <p className="text-xs text-neutral-600 mb-3">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {place.address}
                              </p>
                              <p className="text-sm text-neutral-700 mb-3">{place.description}</p>
                              <div className="flex justify-between items-center">
                                <Button variant="outline" size="sm">
                                  <i className="fas fa-directions mr-2"></i>
                                  Directions
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <i className="fas fa-bookmark mr-2"></i>
                                  Save
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <i className="fas fa-map-marker-alt text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Share your location</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    Enable location access to discover hidden gems, local favorites, and authentic experiences near you. Let MAPA AI be your local guide!
                  </p>
                  <Button onClick={handleGetLocation} className="bg-primary hover:bg-primary-dark">
                    <i className="fas fa-location-arrow mr-2"></i>
                    Get Started
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default LocalSecrets;
