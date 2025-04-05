import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { generateTripSchema, insertUserSchema, loginSchema, contactSchema } from "@shared/schema";
import bcrypt from "bcrypt";

const SESSION_SECRET = process.env.SESSION_SECRET || "mapaai-secret-key";

// Sample data for demonstration
const AIRPORTS = [
  { code: "MNL", name: "Manila Ninoy Aquino International Airport" },
  { code: "CEB", name: "Mactan-Cebu International Airport" },
  { code: "DVO", name: "Francisco Bangoy International Airport (Davao)" },
  { code: "ILO", name: "Iloilo International Airport" },
  { code: "BCD", name: "Bacolod-Silay International Airport" }
];

const COUNTRIES = [
  { code: "JPN", name: "Japan" },
  { code: "KOR", name: "South Korea" },
  { code: "SGP", name: "Singapore" },
  { code: "THA", name: "Thailand" },
  { code: "VNM", name: "Vietnam" },
  { code: "MYS", name: "Malaysia" },
  { code: "HKG", name: "Hong Kong" },
  { code: "TWN", name: "Taiwan" },
  { code: "AUS", name: "Australia" },
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "GBR", name: "United Kingdom" },
  { code: "FRA", name: "France" },
  { code: "ITA", name: "Italy" },
  { code: "ESP", name: "Spain" }
];

const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "KRW", name: "Korean Won" },
  { code: "THB", name: "Thai Baht" }
];

const PREFERENCES = [
  { id: "landmarks", name: "Landmarks", icon: "landmark" },
  { id: "food", name: "Food", icon: "utensils" },
  { id: "shopping", name: "Shopping", icon: "shopping-bag" },
  { id: "adventure", name: "Adventure", icon: "hiking" },
  { id: "culture", name: "Culture", icon: "theater-masks" },
  { id: "instagram", name: "Instagrammable Spots", icon: "camera" },
  { id: "nature", name: "Nature", icon: "leaf" },
  { id: "nightlife", name: "Nightlife", icon: "moon" }
];

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);

  // Configure session
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport with bcrypt password checking
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          // Use bcrypt to verify password
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

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

  // API Routes
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // @ts-ignore
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          const { password, ...safeUser } = user;
          return res.json({ message: "Login successful", user: safeUser });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash the password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Auto login after registration
      req.logIn(newUser, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...safeUser } = newUser;
        return res.status(201).json({ message: "Registration successful", user: safeUser });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

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
      setTimeout(() => {
        const originAirport = AIRPORTS.find(a => a.code === tripInputData.originAirport)?.name || tripInputData.originAirport;
        const destinationCountry = COUNTRIES.find(c => c.code === tripInputData.destinationCountry)?.name || tripInputData.destinationCountry;
        
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
      }, 2000); // Simulate API delay
      
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to generate trip itinerary" });
    }
  });

  // Reference data endpoints
  app.get("/api/airports", (req, res) => {
    res.json(AIRPORTS);
  });

  app.get("/api/countries", (req, res) => {
    res.json(COUNTRIES);
  });

  app.get("/api/currencies", (req, res) => {
    res.json(CURRENCIES);
  });

  app.get("/api/preferences", (req, res) => {
    res.json(PREFERENCES);
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

  const httpServer = createServer(app);
  return httpServer;
}
