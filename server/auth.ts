import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User } from "@shared/schema";
import MemoryStore from "memorystore";
import { sendVerificationEmail } from "./email";

// Use environment variables or default values for OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "mapaai-secret-key";
// Use the REPLIT_SLUG for the callback URL to support both development and production environments
const CALLBACK_URL = process.env.CALLBACK_URL || (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : "http://localhost:5000");

export function setupAuth(app: Express) {
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

  // Configure Local Strategy with bcrypt password checking
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          // Skip password check for OAuth users
          if (!user.password) {
            return done(null, false, { message: "Please log in with your social account" });
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

  // Configure Google Strategy if client ID and secret are provided
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: `${CALLBACK_URL}/api/auth/google/callback`,
          scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await findOrCreateOAuthUser({
              provider: "google",
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              displayName: profile.displayName,
              profilePicture: profile.photos?.[0]?.value,
              providerData: profile
            });
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Configure Facebook Strategy if app ID and secret are provided
  if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: FACEBOOK_APP_ID,
          clientSecret: FACEBOOK_APP_SECRET,
          callbackURL: `${CALLBACK_URL}/api/auth/facebook/callback`,
          profileFields: ["id", "displayName", "photos", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Facebook ID
            let user = await findOrCreateOAuthUser({
              provider: "facebook",
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              displayName: profile.displayName,
              profilePicture: profile.photos?.[0]?.value,
              providerData: profile
            });
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Simplified user serialization and deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Register auth routes
  registerAuthRoutes(app);
}

// Helper function to find or create a user from OAuth profile
async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  displayName,
  profilePicture,
  providerData
}: {
  provider: "google" | "facebook";
  providerId: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  providerData: any;
}): Promise<User> {
  try {
    // First, try to find user by provider ID
    let user: User | undefined;
    
    if (provider === "google") {
      user = await storage.getUserByGoogleId(providerId);
    } else if (provider === "facebook") {
      user = await storage.getUserByFacebookId(providerId);
    }
    
    // If found, return the user
    if (user) {
      return user;
    }
    
    // If not found but we have an email, try to find by email
    if (email) {
      user = await storage.getUserByEmail(email);
      
      // If user exists with this email, update with provider info and return
      if (user) {
        const updateData: Partial<User> = {};
        
        if (provider === "google") {
          updateData.googleId = providerId;
        } else if (provider === "facebook") {
          updateData.facebookId = providerId;
        }
        
        // Only update profile picture if not already set
        if (!user.profilePicture && profilePicture) {
          updateData.profilePicture = profilePicture;
        }
        
        // Update the user and return
        if (Object.keys(updateData).length > 0) {
          user = await storage.updateUser(user.id, updateData);
        }
        
        return user;
      }
    }
    
    // No existing user found, create a new one
    const username = generateUsername(displayName || "user", email);
    
    const userData: any = {
      username,
      email: email || `${username}@${provider}.user`, // Fallback if no email provided
      fullName: displayName || "",
      profilePicture: profilePicture || "",
      providerData
    };
    
    // Set the provider-specific ID
    if (provider === "google") {
      userData.googleId = providerId;
    } else if (provider === "facebook") {
      userData.facebookId = providerId;
    }
    
    // Create and return the new user
    return await storage.createUser(userData);
  } catch (error) {
    console.error("Error in findOrCreateOAuthUser:", error);
    throw error;
  }
}

// Generate a username based on display name and/or email
function generateUsername(displayName: string, email?: string): string {
  // Start with display name, remove spaces and special chars
  let username = displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // If too short, use part of email if available
  if (username.length < 4 && email) {
    username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  
  // Add a random number for uniqueness
  username = `${username}${Math.floor(Math.random() * 10000)}`;
  
  return username;
}

// Register authentication-related routes
function registerAuthRoutes(app: Express) {
  // Regular login route
  app.post("/api/login", (req, res, next) => {
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
        const { password, providerData, ...safeUser } = user;
        return res.json({ message: "Login successful", user: safeUser });
      });
    })(req, res, next);
  });

  // Registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      
      // Create the user
      const newUser = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Send verification email
      try {
        const emailSent = await sendVerificationEmail(newUser);
        if (!emailSent) {
          console.error("Failed to send verification email");
        }
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
      }
      
      // Auto login
      req.logIn(newUser, (err) => {
        if (err) {
          return next(err);
        }
        const { password, providerData, ...safeUser } = newUser;
        return res.status(201).json({ 
          message: "Registration successful. Please check your email to verify your account.", 
          user: safeUser 
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as User;
    const { password, providerData, ...safeUser } = user;
    res.json(safeUser);
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/auth",
    }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/dashboard");
    }
  );

  // Facebook OAuth routes
  app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  
  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", {
      failureRedirect: "/auth",
    }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/dashboard");
    }
  );
}