import { useState, useContext } from "react";
import { Link } from "wouter";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Routes, FEATURES, DESTINATIONS, TESTIMONIALS } from "@/lib/constants";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PartnerLogos from "@/components/partner-logos";
import FeatureCard from "@/components/feature-card";
import DestinationCard from "@/components/destination-card";
import TestimonialCard from "@/components/testimonial-card";
import HowItWorks from "@/components/how-it-works";
import AiChat from "@/components/ai-chat";

const LandingPage = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute w-40 h-40 rounded-full bg-[#EAB308] blur-3xl -top-10 -left-10 animate-pulse"></div>
          <div className="absolute w-60 h-60 rounded-full bg-[#40A9BC] blur-3xl bottom-0 right-0 animate-pulse"></div>
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/5 mb-10 md:mb-0 slide-in-left">
              <h1 className="text-4xl md:text-6xl font-bold font-sans leading-tight mb-6">
                Your Journey, <br />
                Planned by <span className="text-[#EAB308] animate-pulse">AI</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-lg">
                AI-powered travel companion designed for Filipino travelers.
                Create personalized itineraries, get visa help, and discover
                local secrets.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
                  <Button className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto px-8 py-3 h-auto font-medium btn-hover-effect shadow-lg">
                    <i className="fas fa-magic mr-2"></i>
                    Generate Trip
                  </Button>
                </Link>
                <a href="#features">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-3 h-auto font-medium btn-hover-effect"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-3/5 slide-in-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden p-3 hover:shadow-[0_20px_50px_rgba(64,169,188,0.3)] transition-all duration-500">
                {/* Scrolling masonry gallery with images from around the world */}
                <div className="gallery-scroll max-h-[540px] overflow-hidden">
                  <div className="columns-2 md:columns-3 gap-3 space-y-3">
                    {/* First set of images */}
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Paris, France"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Paris, France</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Bali, Indonesia"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Bali, Indonesia</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1543158181-e6f9f6712055?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Venice, Italy"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Venice, Italy</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Kyoto, Japan"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Kyoto, Japan</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Paris, France"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Eiffel Tower</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1493707553966-283afac8c358?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Santorini, Greece"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Santorini, Greece</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Venice, Italy"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Venice Canal</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Grand Canyon, USA"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Grand Canyon, USA</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Machu Picchu, Peru"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Machu Picchu, Peru</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Tokyo, Japan"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Tokyo, Japan</span>
                      </div>
                    </div>
                  </div>
                  {/* Clone for infinite scroll */}
                  <div className="columns-2 md:columns-3 gap-3 space-y-3 mt-3">
                    {/* Cloned images for seamless scrolling */}
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Paris, France"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Paris, France</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Bali, Indonesia"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Bali, Indonesia</span>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1543158181-e6f9f6712055?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                        alt="Venice, Italy"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <span className="text-white font-medium p-3">Venice, Italy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="divider-container">
          <div className="hero-divider">
            <div className="divider-inner dark:bg-gray-900"></div>
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <PartnerLogos />

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4">
              Unlock the World with MAPA<span className="text-[#40A9BC]">AI</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered travel platform helps Filipino travelers plan the
              perfect trip with personalized recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className={`feature-card-${index} feature-animate`}>
                <FeatureCard feature={feature} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center fade-in">
            <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
              <Button
                variant="link"
                className="text-[#40A9BC] font-medium hover:text-[#40A9BC]/80 p-0 btn-hover-effect"
              >
                Explore all features
                <i className="fas fa-arrow-right ml-2 animate-bounce-x"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Destinations Section */}
      <section id="destinations" className="py-16 bg-gray-100 dark:bg-gray-800 transition-colors duration-300 overflow-hidden relative">
        <div className="absolute opacity-10 dark:opacity-20 w-full h-full">
          <div className="absolute w-40 h-40 rounded-full bg-[#EAB308] blur-3xl top-20 left-20 animate-pulse-slow"></div>
          <div className="absolute w-60 h-60 rounded-full bg-[#40A9BC] blur-3xl bottom-10 right-10 animate-pulse-slow"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore breathtaking destinations around the world, all with
              detailed itineraries powered by MAPA
              <span className="text-[#40A9BC]">AI</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 destinations-grid">
            {DESTINATIONS.slice(0, 3).map((destination, index) => (
              <div key={index} className={`destination-card-${index} destination-animate`}>
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center fade-in">
            <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
              <Button className="bg-[#40A9BC] hover:bg-[#40A9BC]/90 text-white shadow-lg btn-hover-effect">
                <span>Explore All Destinations</span>
                <i className="fas fa-globe-asia ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Powered Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/5 mb-8 md:mb-0 md:pr-12 slide-in-left">
              <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4">
                Powered by <span className="text-[#40A9BC]">Google Gemini AI</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-gray-300 mb-6">
                Our cutting-edge AI technology creates personalized travel
                experiences based on your unique preferences, budget, and travel
                style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start feature-animate feature-item">
                  <i className="fas fa-check-circle text-[#40A9BC] mt-1 mr-3"></i>
                  <span className="dark:text-gray-300">Personalized itineraries based on your interests</span>
                </li>
                <li className="flex items-start feature-animate feature-item">
                  <i className="fas fa-check-circle text-[#40A9BC] mt-1 mr-3"></i>
                  <span className="dark:text-gray-300">
                    Intelligent budget allocation for maximum experiences
                  </span>
                </li>
                <li className="flex items-start feature-animate feature-item">
                  <i className="fas fa-check-circle text-[#40A9BC] mt-1 mr-3"></i>
                  <span className="dark:text-gray-300">Destination-specific recommendations from locals</span>
                </li>
                <li className="flex items-start feature-animate feature-item">
                  <i className="fas fa-check-circle text-[#40A9BC] mt-1 mr-3"></i>
                  <span className="dark:text-gray-300">Real-time visa and travel requirement updates</span>
                </li>
              </ul>
            </div>
            <div className="md:w-3/5 slide-in-right">
              <div className="shadow-xl rounded-xl border overflow-hidden dark:border-gray-700 ai-chat-animation hover:shadow-[0_15px_35px_rgba(64,169,188,0.2)] transition-all duration-500">
                <AiChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear from Filipino travelers who have used MAPA
              <span className="text-[#40A9BC]">AI</span> to plan their perfect
              trips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className={`testimonial-card-${index} testimonial-animate`}>
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#40A9BC] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute w-40 h-40 rounded-full bg-[#EAB308] blur-3xl top-10 left-1/4 animate-pulse-slow"></div>
          <div className="absolute w-60 h-60 rounded-full bg-[#EAB308] blur-3xl bottom-10 right-1/4 animate-pulse-slow"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="fade-in">
            <h2 className="text-3xl font-bold font-sans mb-6">
              Ready to Plan Your Next Adventure?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of Filipino travelers using MAPA
              <span className="text-[#EAB308]">AI</span> to create unforgettable
              journeys.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 cta-buttons">
            <Link href={Routes.REGISTER}>
              <Button className="bg-white text-[#40A9BC] hover:bg-white/90 w-full sm:w-auto px-8 py-3 h-auto font-medium shadow-lg btn-hover-effect">
                <i className="fas fa-user-plus mr-2"></i>
                Create Free Account
              </Button>
            </Link>
            <Link href={Routes.DASHBOARD}>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-3 h-auto font-medium btn-hover-effect"
              >
                <i className="fas fa-magic mr-2"></i>
                Generate Trip Demo
              </Button>
            </Link>
          </div>
        </div>
        <div className="cta-divider">
          <div className="divider-line">
            <div className="divider-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 fade-in">
              <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-neutral-600 dark:text-gray-300">
                Have questions about MAPA
                <span className="text-[#40A9BC]">AI</span> or need help with your
                travel plans? Reach out to us!
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-md border dark:border-gray-700 slide-in-up">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <Input id="name" placeholder="Your name" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1"
                  >
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="text-center">
                  <Button className="bg-[#40A9BC] hover:bg-[#40A9BC]/90 text-white px-8 shadow-lg btn-hover-effect">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
