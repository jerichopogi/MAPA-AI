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
      <section className="relative bg-primary text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold font-sans leading-tight mb-6">
                Your Journey, <br />
                Planned by <span className="text-yellow-500">AI</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-lg">
                AI-powered travel companion designed for Filipino travelers.
                Create personalized itineraries, get visa help, and discover
                local secrets.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
                  <Button className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto px-8 py-3 h-auto font-medium">
                    <i className="fas fa-magic mr-2"></i>
                    Generate Trip
                  </Button>
                </Link>
                <a href="#learn-more">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-3 h-auto font-medium text-primary"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1590523278191-995cbcda646b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                alt="Palawan, Philippines"
                className="rounded-lg shadow-lg max-w-full h-auto"
                width="500"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <PartnerLogos />

      {/* Features Section */}
      <section id="features" className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">
              Unlock the World with MAPA<span className="text-primary">AI</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our AI-powered travel platform helps Filipino travelers plan the
              perfect trip with personalized recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
              <Button
                variant="link"
                className="text-primary font-medium hover:text-primary-dark p-0"
              >
                Explore all features
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Destinations Section */}
      <section id="destinations" className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore breathtaking destinations around the world, all with
              detailed itineraries powered by MAPA
              <span className="text-primary">AI</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {DESTINATIONS.slice(0, 3).map((destination, index) => (
              <DestinationCard key={index} destination={destination} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Explore All Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Powered Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">
                Powered by Google Gemini AI
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Our cutting-edge AI technology creates personalized travel
                experiences based on your unique preferences, budget, and travel
                style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                  <span>Personalized itineraries based on your interests</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                  <span>
                    Intelligent budget allocation for maximum experiences
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                  <span>Destination-specific recommendations from locals</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                  <span>Real-time visa and travel requirement updates</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <AiChat />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Hear from Filipino travelers who have used MAPA
              <span className="text-primary">AI</span> to plan their perfect
              trips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-sans mb-6">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of Filipino travelers using MAPA
            <span className="text-yellow-500">AI</span> to create unforgettable
            journeys.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={Routes.REGISTER}>
              <Button className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto px-8 py-3 h-auto font-medium">
                Create Free Account
              </Button>
            </Link>
            <Link href={Routes.DASHBOARD}>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-3 h-auto font-medium"
              >
                Generate Trip Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-neutral-600">
                Have questions about MAPA
                <span className="text-primary">AI</span> or need help with your
                travel plans? Reach out to us!
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-8 shadow-md">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-neutral-700 mb-1"
                    >
                      Full Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-neutral-700 mb-1"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                  />
                </div>

                <div className="text-center">
                  <Button className="bg-primary hover:bg-primary-dark text-white px-8">
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
