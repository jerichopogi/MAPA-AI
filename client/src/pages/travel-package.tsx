import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ApiEndpoints } from "@/lib/constants";
import { ContactInput } from "@/lib/types";
import { contactSchema } from "@shared/schema";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TravelPackage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactInput) => {
      const response = await apiRequest("POST", ApiEndpoints.CONTACT, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We've received your travel package request. Our team will contact you shortly!",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactInput) => {
    submitMutation.mutate(data);
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
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for travel packages"
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
              <h1 className="text-2xl font-bold font-sans text-neutral-800">Travel Package Quote</h1>
              <p className="text-neutral-600">Request a customized travel package tailored to your preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Request a Custom Quote</CardTitle>
                    <CardDescription>
                      Fill out the form below and our travel experts will contact you with personalized package options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                          <i className="fas fa-check text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
                        <p className="text-neutral-600 mb-6 max-w-md">
                          Your request has been submitted successfully. One of our travel experts will contact you within 24 hours to discuss your customized travel package.
                        </p>
                        <Button onClick={() => setSubmitted(false)} className="bg-primary hover:bg-primary-dark">
                          Submit Another Request
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Juan Dela Cruz" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your.email@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+63 917 123 4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div>
                              <FormLabel>Preferred Contact Method</FormLabel>
                              <Select defaultValue="email">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select contact method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Phone Call</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <FormLabel>Destination</FormLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="japan">Japan</SelectItem>
                                  <SelectItem value="korea">South Korea</SelectItem>
                                  <SelectItem value="singapore">Singapore</SelectItem>
                                  <SelectItem value="thailand">Thailand</SelectItem>
                                  <SelectItem value="vietnam">Vietnam</SelectItem>
                                  <SelectItem value="europe">Europe</SelectItem>
                                  <SelectItem value="usa">United States</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <FormLabel>Estimated Travel Dates</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                <Input type="date" placeholder="From" />
                                <Input type="date" placeholder="To" />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <FormLabel>Number of Travelers</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <FormLabel className="text-xs">Adults</FormLabel>
                                <Input type="number" min="1" defaultValue="2" />
                              </div>
                              <div>
                                <FormLabel className="text-xs">Children (2-12)</FormLabel>
                                <Input type="number" min="0" defaultValue="0" />
                              </div>
                              <div>
                                <FormLabel className="text-xs">Infants (under 2)</FormLabel>
                                <Input type="number" min="0" defaultValue="0" />
                              </div>
                              <div>
                                <FormLabel className="text-xs">Seniors (60+)</FormLabel>
                                <Input type="number" min="0" defaultValue="0" />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <FormLabel>Budget Range (PHP)</FormLabel>
                            <Select defaultValue="25000-50000">
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-25000">Under ₱25,000 per person</SelectItem>
                                <SelectItem value="25000-50000">₱25,000 - ₱50,000 per person</SelectItem>
                                <SelectItem value="50000-100000">₱50,000 - ₱100,000 per person</SelectItem>
                                <SelectItem value="100000-plus">Above ₱100,000 per person</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <FormLabel>Travel Interests</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-landmarks" />
                                <label htmlFor="interest-landmarks" className="text-sm">Landmarks</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-food" />
                                <label htmlFor="interest-food" className="text-sm">Food & Cuisine</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-shopping" />
                                <label htmlFor="interest-shopping" className="text-sm">Shopping</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-adventure" />
                                <label htmlFor="interest-adventure" className="text-sm">Adventure</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-culture" />
                                <label htmlFor="interest-culture" className="text-sm">Culture</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-nature" />
                                <label htmlFor="interest-nature" className="text-sm">Nature</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-beach" />
                                <label htmlFor="interest-beach" className="text-sm">Beach</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="interest-luxury" />
                                <label htmlFor="interest-luxury" className="text-sm">Luxury</label>
                              </div>
                            </div>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Requirements</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us more about your ideal trip, specific requirements, or any questions you have..."
                                    rows={5}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="terms" required />
                            <label htmlFor="terms" className="text-sm text-neutral-600">
                              I agree to receive travel package offers and information via email or phone
                            </label>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={submitMutation.isPending}
                          >
                            {submitMutation.isPending ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Request...
                              </>
                            ) : (
                              "Request Quote"
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Info */}
              <div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="bg-primary text-white">
                      <CardTitle className="flex items-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        Why Request a Quote?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                          <span>Get a <strong>personalized itinerary</strong> created by travel experts</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                          <span>Access <strong>exclusive deals</strong> not available online</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                          <span>Receive <strong>expert advice</strong> on destinations based on your preferences</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                          <span>Enjoy <strong>hassle-free booking</strong> with all arrangements handled for you</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                          <span>Get <strong>24/7 support</strong> during your travels</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <i className="fas fa-suitcase mr-2"></i>
                        Popular Packages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Japan Cherry Blossom</h3>
                            <span className="text-sm bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">Seasonal</span>
                          </div>
                          <p className="text-sm text-neutral-600 mb-1">7 days exploring Tokyo, Kyoto, and Osaka during cherry blossom season</p>
                          <p className="text-sm font-medium text-primary">From ₱75,000 per person</p>
                        </div>
                        
                        <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Korea Autumn Tour</h3>
                            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Best Seller</span>
                          </div>
                          <p className="text-sm text-neutral-600 mb-1">6 days in Seoul, Busan, and Jeju with autumn foliage viewing</p>
                          <p className="text-sm font-medium text-primary">From ₱65,000 per person</p>
                        </div>
                        
                        <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Singapore Family Fun</h3>
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Family</span>
                          </div>
                          <p className="text-sm text-neutral-600 mb-1">5 days of family-friendly activities including Universal Studios and Ocean Park</p>
                          <p className="text-sm font-medium text-primary">From ₱45,000 per person</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">
                        View All Packages
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <i className="fas fa-headset text-lg"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Need Assistance?</h3>
                          <p className="text-sm text-neutral-600">Our travel experts are ready to help</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center">
                          <i className="fas fa-phone mr-3 text-neutral-500"></i>
                          +63 2 8123 4567
                        </p>
                        <p className="flex items-center">
                          <i className="fas fa-envelope mr-3 text-neutral-500"></i>
                          packages@mapaai.ph
                        </p>
                        <p className="flex items-center">
                          <i className="fas fa-clock mr-3 text-neutral-500"></i>
                          Mon-Fri: 9AM-6PM, Sat: 9AM-12PM
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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

export default TravelPackage;
