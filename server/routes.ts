import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { generateTripSchema, contactSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "./email";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Error handling middleware for Zod validation errors
  const handleZodError = (error: ZodError, res: Response) => {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  };

  // API Routes are configured in auth.ts

  // Trips API
  app.get("/api/trips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const userId = req.user.id;
      const trips = await storage.getUserTrips(userId);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // @ts-ignore
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this trip" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const userId = req.user.id;
      const tripData = { ...req.body, userId };
      
      const newTrip = await storage.createTrip(tripData);
      res.status(201).json(newTrip);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.patch("/api/trips/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // @ts-ignore
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this trip" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, req.body);
      res.json(updatedTrip);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // @ts-ignore
      if (trip.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this trip" });
      }
      
      await storage.deleteTrip(tripId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // Generate AI Trip
  app.post("/api/generate-trip", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const tripInputData = generateTripSchema.parse(req.body);
      
      // In a real app, this is where we would call the Gemini API
      // For now, we'll simulate a response with a timed delay
      setTimeout(async () => {
        try {
          const airportResult = await storage.getAirportByCode(tripInputData.originAirport);
          const countryResult = await storage.getCountryByCode(tripInputData.destinationCountry);
          
          const originAirport = airportResult?.name || tripInputData.originAirport;
          const destinationCountry = countryResult?.name || tripInputData.destinationCountry;
          
          // Generate mock itineraries (in a real app this would come from Gemini)
          const budgetItinerary = {
            summary: `Budget-friendly ${tripInputData.duration}-day trip to ${destinationCountry}`,
            dailyPlans: Array.from({ length: tripInputData.duration }, (_, i) => ({
              day: i + 1,
              activities: [
                { time: "Morning", description: `Budget activity ${i+1}A in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 3)) },
                { time: "Afternoon", description: `Budget activity ${i+1}B in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 3)) },
                { time: "Evening", description: `Budget activity ${i+1}C in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 3)) }
              ],
              accommodation: {
                name: `Budget Accommodation for Day ${i+1}`,
                cost: Math.floor(tripInputData.budget / (tripInputData.duration * 4))
              },
              meals: {
                breakfast: { description: "Local breakfast", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 10)) },
                lunch: { description: "Street food lunch", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 8)) },
                dinner: { description: "Budget dinner", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 6)) }
              }
            })),
            totalCost: Math.floor(tripInputData.budget * 0.8)
          };
          
          const experienceItinerary = {
            summary: `Experience-focused ${tripInputData.duration}-day trip to ${destinationCountry}`,
            dailyPlans: Array.from({ length: tripInputData.duration }, (_, i) => ({
              day: i + 1,
              activities: [
                { time: "Morning", description: `Premium activity ${i+1}A in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 2)) },
                { time: "Afternoon", description: `Premium activity ${i+1}B in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 2)) },
                { time: "Evening", description: `Premium activity ${i+1}C in ${destinationCountry}`, cost: Math.floor(tripInputData.budget / (tripInputData.duration * 2)) }
              ],
              accommodation: {
                name: `Luxury Accommodation for Day ${i+1}`,
                cost: Math.floor(tripInputData.budget / (tripInputData.duration * 2))
              },
              meals: {
                breakfast: { description: "Hotel breakfast", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 8)) },
                lunch: { description: "Local restaurant lunch", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 5)) },
                dinner: { description: "Fine dining experience", cost: Math.floor(tripInputData.budget / (tripInputData.duration * 3)) }
              }
            })),
            totalCost: Math.floor(tripInputData.budget * 1.2)
          };
          
          const response = {
            tripName: `Trip to ${destinationCountry}`,
            budgetItinerary,
            experienceItinerary
          };
          
          res.json(response);
        } catch (error) {
          console.error("Error generating trip:", error);
          res.status(500).json({ message: "Error generating trip data" });
        }
      }, 2000); // Simulate API delay
      
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to generate trip itinerary" });
    }
  });

  // Reference data endpoints - now using the database
  app.get("/api/airports", async (req, res) => {
    try {
      const allAirports = await storage.getAllAirports();
      res.json(allAirports);
    } catch (error) {
      console.error("Error fetching airports:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });

  app.get("/api/philippine-airports", async (req, res) => {
    try {
      const philippineAirports = await storage.getPhilippineAirports();
      res.json(philippineAirports);
    } catch (error) {
      console.error("Error fetching Philippine airports:", error);
      res.status(500).json({ message: "Failed to fetch Philippine airports" });
    }
  });

  app.get("/api/countries", async (req, res) => {
    try {
      const allCountries = await storage.getAllCountries();
      res.json(allCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.get("/api/currencies", async (req, res) => {
    try {
      const allCurrencies = await storage.getAllCurrencies();
      res.json(allCurrencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  app.get("/api/preferences", async (req, res) => {
    try {
      const allPreferences = await storage.getAllPreferences();
      res.json(allPreferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });
  
  // Get cities for a specific country
  app.get("/api/cities/:countryCode", async (req, res) => {
    try {
      const countryCode = req.params.countryCode;
      const citiesForCountry = await storage.getCitiesByCountryCode(countryCode);
      res.json(citiesForCountry);
    } catch (error) {
      console.error(`Error fetching cities for country ${req.params.countryCode}:`, error);
      res.status(500).json({ message: `Failed to fetch cities for country ${req.params.countryCode}` });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = contactSchema.parse(req.body);
      
      // In a real app, you would store the contact form data or send emails
      // For now, we'll just acknowledge receipt
      res.status(201).json({ 
        message: "Thank you for your inquiry! We'll contact you shortly.",
        data: contactData 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // ===== Email Verification and Password Reset Routes =====
  
  // Forgot Password - Request reset link
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that the email doesn't exist for security reasons
        return res.status(200).json({ 
          message: "If your email is registered, you'll receive password reset instructions shortly." 
        });
      }
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(user);
      
      if (!emailSent) {
        return res.status(500).json({ 
          message: "Failed to send password reset email. Please try again later." 
        });
      }
      
      res.status(200).json({ 
        message: "Password reset instructions have been sent to your email." 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  });
  
  // Reset Password - Using token and new password
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token." });
      }
      
      // Check if token is expired
      if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ message: "Password reset token has expired." });
      }
      
      // Hash the new password using bcrypt (same as login)
      const saltRounds = 10;
      const hashedPassword = await import('bcrypt').then(bcrypt => bcrypt.hash(password, saltRounds));
      
      // Update user password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });
      
      res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  });
  
  // Email Verification - Send verification email
  app.post("/api/send-verification-email", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Send verification email
      const emailSent = await sendVerificationEmail(user);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      
      res.status(200).json({ message: "Verification email has been sent" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while sending verification email" });
    }
  });
  
  // Email Verification - Verify email using token
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      
      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      // Check if token is expired
      if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
        return res.status(400).json({ message: "Verification token has expired" });
      }
      
      // Update user as verified and clear verification token
      await storage.updateUser(user.id, {
        isVerified: true,
        verificationToken: undefined,
        verificationTokenExpires: undefined
      });
      
      // Send welcome email
      await sendWelcomeEmail(user);
      
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "An error occurred while verifying email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
