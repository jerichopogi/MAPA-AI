import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Form schema for visa query
const visaQuerySchema = z.object({
  citizenship: z.string().default("PH"),
  destination: z.string().min(1, "Please select a destination country"),
  purpose: z.string().min(1, "Please select a purpose of travel"),
  duration: z.number().min(1, "Duration must be at least 1 day").max(365, "Duration must be less than 1 year"),
  hasVisitedBefore: z.boolean().default(false)
});

type VisaQueryFormValues = z.infer<typeof visaQuerySchema>;

// Visa requirement result type
interface VisaRequirement {
  country: string;
  visaRequired: boolean;
  visaType: string;
  stayDuration: string;
  processingTime: string;
  fee: string;
  requirements: string[];
  notes: string;
  embassyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

const VisaHelp = () => {
  const [visaResult, setVisaResult] = useState<VisaRequirement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<VisaQueryFormValues>({
    resolver: zodResolver(visaQuerySchema),
    defaultValues: {
      citizenship: "PH",
      destination: "",
      purpose: "",
      duration: 7,
      hasVisitedBefore: false
    }
  });

  // Mock visa requirement data (in a real app, this would come from Gemini AI API)
  const mockVisaData: Record<string, VisaRequirement> = {
    JPN: {
      country: "Japan",
      visaRequired: true,
      visaType: "Tourist Visa",
      stayDuration: "Up to 15 days",
      processingTime: "5-7 business days",
      fee: "₱1,500",
      requirements: [
        "Philippine passport valid for at least 6 months beyond stay",
        "Completed visa application form",
        "Recent passport-sized photos (4.5cm x 4.5cm with white background)",
        "Flight itinerary",
        "Hotel reservations",
        "Bank certificate and bank statements for the last 3 months",
        "Income Tax Return (ITR) or Form 2316",
        "Certificate of Employment with leave of absence approval",
        "Daily schedule/itinerary in Japan"
      ],
      notes: "First-time visitors to Japan may need to show stronger financial documents. Consider providing a sponsorship letter if visiting friends or family.",
      embassyInfo: {
        name: "Embassy of Japan in the Philippines",
        address: "2627 Roxas Boulevard, Pasay City, 1300 Metro Manila",
        phone: "+63-2-8551-5710",
        email: "ryoji@ma.mofa.go.jp",
        website: "https://www.ph.emb-japan.go.jp/"
      }
    },
    KOR: {
      country: "South Korea",
      visaRequired: true,
      visaType: "Tourist Visa (C-3)",
      stayDuration: "Up to 59 days",
      processingTime: "5-7 business days",
      fee: "₱2,000",
      requirements: [
        "Philippine passport valid for at least 6 months beyond stay",
        "Completed visa application form",
        "Recent passport-sized photos (35mm x 45mm with white background)",
        "Confirmed roundtrip ticket",
        "Hotel reservations",
        "Certificate of Employment with leave of absence approval and salary information",
        "Bank certificate and bank statements for the last 3 months",
        "Income Tax Return (ITR) or Form 2316"
      ],
      notes: "South Korea offers a visa-free entry to Jeju Island. If you have traveled to OECD member countries within the last 5 years, you may qualify for the K-ETA (visa waiver) program.",
      embassyInfo: {
        name: "Embassy of the Republic of Korea in the Philippines",
        address: "122 Upper McKinley Road, McKinley Town Center, Fort Bonifacio, Taguig City, Metro Manila",
        phone: "+63-2-8856-9210",
        email: "philippines@mofa.go.kr",
        website: "https://overseas.mofa.go.kr/ph-en/index.do"
      }
    },
    SGP: {
      country: "Singapore",
      visaRequired: false,
      visaType: "Visa-Free",
      stayDuration: "Up to 30 days",
      processingTime: "Not applicable",
      fee: "None",
      requirements: [
        "Philippine passport valid for at least 6 months beyond stay",
        "Confirmed return ticket",
        "Proof of sufficient funds for stay",
        "Proof of accommodation"
      ],
      notes: "While a visa is not required, you may still need to provide immigration officers with evidence of your purpose of visit and sufficient funds. Make sure to have hotel bookings and return tickets ready.",
      embassyInfo: {
        name: "Embassy of the Republic of Singapore in the Philippines",
        address: "505 Rizal Drive, Bonifacio Global City, Taguig City, 1634 Metro Manila",
        phone: "+63-2-8856-9922",
        email: "singemb_mnl@mfa.sg",
        website: "https://www.mfa.gov.sg/manila"
      }
    },
    USA: {
      country: "United States",
      visaRequired: true,
      visaType: "B-2 Tourist Visa",
      stayDuration: "Up to 6 months",
      processingTime: "60-120 days for interview, 1-2 weeks after approval",
      fee: "USD 160 (approximately ₱9,000)",
      requirements: [
        "Philippine passport valid for at least 6 months beyond stay",
        "Completed DS-160 form",
        "Confirmation page of the appointment",
        "Visa fee payment receipt",
        "Recent passport-sized photo (5cm x 5cm with white background)",
        "Proof of strong ties to the Philippines (property, family, employment)",
        "Bank statements and financial evidence",
        "Travel itinerary",
        "Letter from employer stating position, salary, and approved leave"
      ],
      notes: "The visa interview is the most critical part of the application. Be prepared to explain your purpose of visit, ties to the Philippines, and why you will return after your trip. Visa applications may have high rejection rates for first-time applicants.",
      embassyInfo: {
        name: "U.S. Embassy in the Philippines",
        address: "1201 Roxas Boulevard, Manila, Philippines 1000",
        phone: "+63-2-8301-2000",
        email: "ConsularManila@state.gov",
        website: "https://ph.usembassy.gov/"
      }
    },
    AUS: {
      country: "Australia",
      visaRequired: true,
      visaType: "Visitor Visa (Subclass 600)",
      stayDuration: "Up to 3 months",
      processingTime: "20-30 business days",
      fee: "AUD 145 (approximately ₱5,500)",
      requirements: [
        "Philippine passport valid for at least 6 months beyond stay",
        "Completed online application",
        "Recent passport-sized photo",
        "Proof of sufficient funds",
        "Travel itinerary",
        "Health insurance",
        "Letter from employer",
        "Evidence of strong ties to the Philippines"
      ],
      notes: "Australian visa applications are lodged online. You might be asked to undergo a medical examination if staying longer than 3 months.",
      embassyInfo: {
        name: "Australian Embassy in the Philippines",
        address: "Level 23-Tower 2 RCBC Plaza, 6819 Ayala Avenue, Makati City, 1200, Metro Manila",
        phone: "+63-2-8757-8100",
        email: "manila.enquiries@dfat.gov.au",
        website: "https://philippines.embassy.gov.au/"
      }
    }
  };

  const getVisaRequirements = async (data: VisaQueryFormValues) => {
    setIsLoading(true);
    
    // In a real app, this would call the Gemini API to get visa information
    // For now, we'll simulate a response using our mock data
    setTimeout(() => {
      const result = mockVisaData[data.destination] || null;
      setVisaResult(result);
      setIsLoading(false);
    }, 1500);
  };

  const onSubmit = (data: VisaQueryFormValues) => {
    getVisaRequirements(data);
  };

  const resetForm = () => {
    form.reset();
    setVisaResult(null);
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
                <label htmlFor="search" className="sr-only">Search Visa Information</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="fas fa-search text-neutral-400"></i>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full bg-neutral-50 border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for visa information"
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
              <h1 className="text-2xl font-bold font-sans text-neutral-800">Visa Help</h1>
              <p className="text-neutral-600">Get AI-powered visa information and requirements for Filipino travelers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Check Visa Requirements</CardTitle>
                    <CardDescription>
                      Enter your travel details to get personalized visa information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="citizenship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Citizenship</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select citizenship" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PH">Filipino</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select destination" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="JPN">Japan</SelectItem>
                                  <SelectItem value="KOR">South Korea</SelectItem>
                                  <SelectItem value="SGP">Singapore</SelectItem>
                                  <SelectItem value="USA">United States</SelectItem>
                                  <SelectItem value="AUS">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purpose of Travel</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select purpose" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tourism">Tourism / Vacation</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="family">Visiting Family / Friends</SelectItem>
                                  <SelectItem value="education">Study / Education</SelectItem>
                                  <SelectItem value="medical">Medical Treatment</SelectItem>
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
                              <FormLabel>Duration of Stay (days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={365}
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
                          name="hasVisitedBefore"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Have you visited this country before?</FormLabel>
                              <div className="flex">
                                <RadioGroup
                                  onValueChange={(value) => field.onChange(value === "true")}
                                  defaultValue={field.value ? "true" : "false"}
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id="visited-yes" />
                                    <Label htmlFor="visited-yes">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id="visited-no" />
                                    <Label htmlFor="visited-no">No</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary-dark mt-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Checking Requirements...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search mr-2"></i>
                              Check Requirements
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-base">Popular Visa Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ul className="space-y-2">
                      <li>
                        <a href="https://dfa.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          Department of Foreign Affairs (DFA)
                        </a>
                      </li>
                      <li>
                        <a href="https://www.vfsglobal.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          VFS Global Visa Services
                        </a>
                      </li>
                      <li>
                        <a href="https://travel.state.gov" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          U.S. Department of State
                        </a>
                      </li>
                      <li>
                        <a href="https://www.schengenvisainfo.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          Schengen Visa Info
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Results */}
              <div className="lg:col-span-2">
                {visaResult ? (
                  <Card>
                    <CardHeader className={visaResult.visaRequired ? "bg-primary/10" : "bg-green-100"}>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <i className={`fas fa-${visaResult.visaRequired ? 'passport' : 'check-circle'} mr-2 ${visaResult.visaRequired ? 'text-primary' : 'text-green-600'}`}></i>
                            {visaResult.country} Visa Requirements
                          </CardTitle>
                          <CardDescription>
                            For Filipino citizens traveling for {form.getValues().purpose || "tourism"}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetForm}>
                          <i className="fas fa-redo-alt mr-2"></i>
                          New Query
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <div className="flex items-center mb-4">
                          <div className={`text-lg font-semibold px-3 py-1 rounded-full ${visaResult.visaRequired ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'}`}>
                            {visaResult.visaRequired ? 'Visa Required' : 'No Visa Required'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-neutral-500">Visa Type</p>
                            <p className="font-medium">{visaResult.visaType}</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-neutral-500">Maximum Stay</p>
                            <p className="font-medium">{visaResult.stayDuration}</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-neutral-500">Processing Time</p>
                            <p className="font-medium">{visaResult.processingTime}</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-neutral-500">Visa Fee</p>
                            <p className="font-medium">{visaResult.fee}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Tabs defaultValue="requirements" className="mt-6">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="requirements">Requirements</TabsTrigger>
                          <TabsTrigger value="notes">Important Notes</TabsTrigger>
                          <TabsTrigger value="embassy">Embassy Info</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="requirements" className="pt-4">
                          <h3 className="text-lg font-medium mb-3">Required Documents</h3>
                          <ul className="space-y-2">
                            {visaResult.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-start">
                                <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                        
                        <TabsContent value="notes" className="pt-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <h3 className="flex items-center text-amber-800 font-medium mb-2">
                              <i className="fas fa-exclamation-circle mr-2"></i>
                              Important Notes
                            </h3>
                            <p className="text-amber-800">{visaResult.notes}</p>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-3">Additional Tips</h3>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                              <AccordionTrigger>Application Timeline</AccordionTrigger>
                              <AccordionContent>
                                Apply for your visa at least 4-6 weeks before your planned travel date. This gives you ample time to address any issues or provide additional documents if requested.
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                              <AccordionTrigger>Financial Documents</AccordionTrigger>
                              <AccordionContent>
                                Present bank statements that show a healthy financial history. Avoid large, sudden deposits just before your application as this might raise questions about the source of funds.
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                              <AccordionTrigger>Travel Insurance</AccordionTrigger>
                              <AccordionContent>
                                While not always required, having travel insurance can strengthen your application. It shows you're prepared for emergencies and won't be a burden on the destination country's healthcare system.
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </TabsContent>
                        
                        <TabsContent value="embassy" className="pt-4">
                          <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-3">{visaResult.embassyInfo.name}</h3>
                            <div className="space-y-2 text-sm">
                              <p className="flex items-start">
                                <i className="fas fa-map-marker-alt mt-1 mr-3 text-neutral-500"></i>
                                <span>{visaResult.embassyInfo.address}</span>
                              </p>
                              <p className="flex items-start">
                                <i className="fas fa-phone mt-1 mr-3 text-neutral-500"></i>
                                <span>{visaResult.embassyInfo.phone}</span>
                              </p>
                              <p className="flex items-start">
                                <i className="fas fa-envelope mt-1 mr-3 text-neutral-500"></i>
                                <span>{visaResult.embassyInfo.email}</span>
                              </p>
                              <p className="flex items-start">
                                <i className="fas fa-globe mt-1 mr-3 text-neutral-500"></i>
                                <a href={visaResult.embassyInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {visaResult.embassyInfo.website}
                                </a>
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h3 className="text-lg font-medium mb-3">Application Process</h3>
                            <ol className="space-y-3">
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">1</span>
                                <span>Gather all required documents according to the embassy website</span>
                              </li>
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">2</span>
                                <span>Complete the visa application form (online or paper, depending on embassy)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">3</span>
                                <span>Pay the visa application fee</span>
                              </li>
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">4</span>
                                <span>Schedule an appointment (if required)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">5</span>
                                <span>Attend the appointment and submit your documents</span>
                              </li>
                              <li className="flex items-start">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">6</span>
                                <span>Wait for processing and collection of your passport with visa</span>
                              </li>
                            </ol>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">
                        <i className="fas fa-print mr-2"></i>
                        Print Information
                      </Button>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Book Visa Service
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                          <i className="fas fa-passport text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Visa Information</h3>
                        <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
                          Enter your travel details on the left to get personalized visa requirements and application guidance for Filipino travelers.
                        </p>
                        
                        <div className="text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            Did you know?
                          </h4>
                          <p className="text-blue-800 text-sm">
                            Filipino citizens can travel visa-free to several countries including Singapore, Indonesia, Vietnam, Thailand, and several other Southeast Asian nations. Check the specific requirements before traveling.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Visa FAQ Section */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How far in advance should I apply for a visa?</AccordionTrigger>
                        <AccordionContent>
                          It's generally recommended to apply for a visa at least 1-3 months before your planned travel date. Processing times vary by country and season. Some countries like the US may have long wait times for visa appointments (often several months), while others like Japan or Korea typically process visas within 5-7 business days after your application is submitted.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-2">
                        <AccordionTrigger>What financial documents are most important for visa applications?</AccordionTrigger>
                        <AccordionContent>
                          The most important financial documents are typically:
                          <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                            <li>Bank statements for the last 3-6 months</li>
                            <li>Bank certificate showing your current balance</li>
                            <li>Income Tax Return (ITR) or Form 2316</li>
                            <li>Certificate of Employment with salary information</li>
                            <li>Credit card statements (if applicable)</li>
                          </ul>
                          Most countries want to see that you have enough funds to support yourself during your trip and strong financial ties to the Philippines.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Can previous travel history improve my visa approval chances?</AccordionTrigger>
                        <AccordionContent>
                          Yes, having a strong travel history can significantly improve your chances of visa approval. Previous travel to developed countries (especially if you've complied with visa terms) demonstrates that you're a legitimate traveler who returns home after trips. Many countries like Japan, Korea, and the UK have special visa application processes for travelers with previous visas from certain countries.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-4">
                        <AccordionTrigger>What should I do if my visa is denied?</AccordionTrigger>
                        <AccordionContent>
                          If your visa is denied:
                          <ol className="list-decimal list-inside mt-2 ml-2 space-y-1">
                            <li>Read the denial letter carefully to understand the reason</li>
                            <li>Determine if you can address the issues in a new application</li>
                            <li>Wait a reasonable time before reapplying (usually 3-6 months)</li>
                            <li>Strengthen your application by addressing the specific concerns</li>
                            <li>Consider using a reputable travel agency or visa consultant</li>
                          </ol>
                          Remember that each new application is evaluated on its own merits, so a previous denial doesn't automatically mean future denials.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Are visa requirements different for OFWs or dual citizens?</AccordionTrigger>
                        <AccordionContent>
                          Yes, visa requirements can differ:
                          
                          <p className="mt-2 mb-1 font-medium">For OFWs:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>Some countries offer special visa categories or easier processes for workers</li>
                            <li>OFWs might need to provide additional documents like work contracts</li>
                            <li>In some cases, embassy interview questions may focus on your work situation</li>
                          </ul>
                          
                          <p className="mt-3 mb-1 font-medium">For Dual Citizens:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>You should generally travel using the passport of the country you're visiting (if you're a citizen there)</li>
                            <li>For other countries, you can usually choose which passport offers better visa conditions</li>
                            <li>Some countries require you to use a specific passport if you're their citizen</li>
                          </ul>
                          
                          Always check the specific requirements for your situation.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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

export default VisaHelp;
