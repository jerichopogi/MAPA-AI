import { useState } from "react";
import { Link } from "wouter";
import { Routes } from "@/lib/constants";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TravelInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
                <label htmlFor="search" className="sr-only">Search Travel Info</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for travel guides, information, or tips"
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-sans text-neutral-800">Travel Information</h1>
              <p className="text-neutral-600">Essential resources and guides for Filipino travelers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Visa Help Card */}
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-passport mr-2"></i>
                    Visa Help
                  </CardTitle>
                  <CardDescription>
                    Requirements and application guides
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-neutral-600 mb-4">
                    Get AI-powered assistance with visa requirements based on your Filipino citizenship, destination, and travel purpose.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Japan</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">South Korea</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">USA</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Schengen</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Link href={Routes.VISA_HELP}>
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      <i className="fas fa-arrow-right mr-2"></i>
                      Check Visa Requirements
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Travel Guides Card */}
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-book-open mr-2"></i>
                    Travel Guides
                  </CardTitle>
                  <CardDescription>
                    Destination insights and tips
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-neutral-600 mb-4">
                    Comprehensive guides written for Filipino travelers with cultural insights, budget tips, and local recommendations.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Tokyo</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Singapore</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Seoul</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Hong Kong</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    <i className="fas fa-arrow-right mr-2"></i>
                    Browse Travel Guides
                  </Button>
                </CardFooter>
              </Card>

              {/* Travel Deals Card */}
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-tags mr-2"></i>
                    Travel Deals
                  </CardTitle>
                  <CardDescription>
                    Exclusive offers and promotions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-neutral-600 mb-4">
                    Special discounts on flights, accommodations, and experiences curated for Filipino travelers.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Flights</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Hotels</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Activities</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">Packages</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    <i className="fas fa-arrow-right mr-2"></i>
                    View Current Deals
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Essential Travel Resources */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Essential Travel Resources</h2>
              
              <Tabs defaultValue="documents">
                <TabsList className="mb-6 grid w-full grid-cols-4">
                  <TabsTrigger value="documents">
                    <i className="fas fa-file-alt mr-2"></i>
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="insurance">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Insurance
                  </TabsTrigger>
                  <TabsTrigger value="health">
                    <i className="fas fa-heartbeat mr-2"></i>
                    Health
                  </TabsTrigger>
                  <TabsTrigger value="safety">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Safety
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Travel Documents for Filipino Travelers</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Philippine Passport</h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            Ensure your passport is valid for at least 6 months beyond your return date. Many countries will deny entry if it expires sooner.
                          </p>
                          <a href="#passport-info" className="text-primary text-sm hover:underline">
                            How to apply or renew your Philippine passport
                          </a>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Visa Requirements</h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            As a Filipino passport holder, you need to check visa requirements for your destination country. Some countries offer visa-free entry, while others require applications in advance.
                          </p>
                          <Link href={Routes.VISA_HELP}>
                            <a className="text-primary text-sm hover:underline">
                              Check visa requirements by country
                            </a>
                          </Link>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Additional Documents</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                            <li>Return ticket (required for most countries)</li>
                            <li>Hotel bookings or accommodation details</li>
                            <li>Travel insurance certificate</li>
                            <li>Proof of sufficient funds (bank statements)</li>
                            <li>Invitation letter (if visiting friends/family)</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="insurance">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Travel Insurance Guide</h3>
                      <p className="mb-4">
                        Travel insurance is essential for Filipino travelers, especially since healthcare costs abroad can be extremely high. Most countries in Europe require insurance coverage as part of visa requirements.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">What to Look For</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                            <li>Medical coverage (min. $50,000 recommended)</li>
                            <li>Emergency evacuation</li>
                            <li>Trip cancellation/interruption</li>
                            <li>Baggage loss/delay coverage</li>
                            <li>24/7 emergency assistance</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Recommended Providers for Filipinos</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                            <li>Pacific Cross Philippines</li>
                            <li>Malayan Insurance</li>
                            <li>AXA Philippines</li>
                            <li>World Nomads (for multi-country trips)</li>
                            <li>Blue Cross Insurance</li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-primary hover:bg-primary-dark">
                        Compare Travel Insurance Plans
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="health">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Travel Health Information</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Vaccinations & Health Requirements</h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            Depending on your destination, you may need specific vaccinations. Visit a travel clinic at least 4-6 weeks before your trip.
                          </p>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Common Required Vaccinations:</h5>
                            <ul className="list-disc list-inside text-sm text-neutral-600 mt-1">
                              <li>Yellow Fever (for parts of Africa and South America)</li>
                              <li>Hepatitis A & B</li>
                              <li>Typhoid</li>
                              <li>COVID-19 (requirements vary by country)</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Prescription Medications</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600">
                            <li>Bring sufficient supply for your entire trip plus extras</li>
                            <li>Keep medications in original packaging</li>
                            <li>Bring a doctor's note for prescription medications</li>
                            <li>Check if your medications are legal at your destination</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Basic Travel Health Kit</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <ul className="list-disc list-inside text-sm text-neutral-600">
                              <li>Pain relievers</li>
                              <li>Antihistamines</li>
                              <li>Motion sickness medication</li>
                              <li>Bandages & antiseptic</li>
                            </ul>
                            <ul className="list-disc list-inside text-sm text-neutral-600">
                              <li>Diarrhea medication</li>
                              <li>Rehydration salts</li>
                              <li>Insect repellent</li>
                              <li>Digital thermometer</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="safety">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Safety Tips for Filipino Travelers</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Before You Travel</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600">
                            <li>Register with the Department of Foreign Affairs' <a href="https://beta.philembassy.org/oasis-account/register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OFW Registration System</a></li>
                            <li>Save emergency contacts: Philippine Embassy/Consulate at your destination</li>
                            <li>Research local laws, customs, and cultural norms</li>
                            <li>Keep digital copies of all important documents</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">During Your Trip</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600">
                            <li>Stay alert in crowded tourist areas (common pickpocketing spots)</li>
                            <li>Use official transportation services</li>
                            <li>Keep valuables secure and not visible</li>
                            <li>Be cautious with public Wi-Fi when accessing sensitive information</li>
                            <li>Respect local customs and dress codes</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-yellow-50">
                          <h4 className="font-medium mb-2 flex items-center">
                            <i className="fas fa-exclamation-circle text-yellow-500 mr-2"></i>
                            Emergency Contact Information
                          </h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="font-medium w-40">DFA Assistance to Nationals:</span>
                              <span>+632-8834-4000</span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-medium w-40">DFA Office of Consular Affairs:</span>
                              <span>+632-8651-9400</span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-medium w-40">Overseas Workers Welfare Administration:</span>
                              <span>+632-8891-7601 to 24</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Featured Travel Articles */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Featured Travel Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Budget Travel Tips" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">Guide</span>
                    <h3 className="font-semibold mb-2">10 Budget Travel Tips for Filipino Travelers</h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Learn how to maximize your travel budget and explore more destinations without breaking the bank.
                    </p>
                    <a href="#read-more" className="text-primary text-sm font-medium hover:underline">
                      Read Article
                      <i className="fas fa-arrow-right ml-1"></i>
                    </a>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Singapore Guide" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">Destination</span>
                    <h3 className="font-semibold mb-2">Singapore: The Perfect First International Trip</h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Why Singapore is an ideal first destination for Filipino travelers new to international travel.
                    </p>
                    <a href="#read-more" className="text-primary text-sm font-medium hover:underline">
                      Read Article
                      <i className="fas fa-arrow-right ml-1"></i>
                    </a>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1601823984263-b87b59798b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Visa Application" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">Visa</span>
                    <h3 className="font-semibold mb-2">Mastering the Visa Interview: Tips for Approval</h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Expert advice on how to prepare for and succeed in your tourist visa interview as a Filipino applicant.
                    </p>
                    <a href="#read-more" className="text-primary text-sm font-medium hover:underline">
                      Read Article
                      <i className="fas fa-arrow-right ml-1"></i>
                    </a>
                  </CardContent>
                </Card>
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

export default TravelInfo;
