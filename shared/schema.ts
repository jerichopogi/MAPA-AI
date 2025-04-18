import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),  // Make password optional for OAuth users
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
  // OAuth fields
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  profilePicture: text("profile_picture"),
  // For storing extra data from providers
  providerData: jsonb("provider_data"),
  // Email verification fields
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token").unique(),
  verificationTokenExpires: timestamp("verification_token_expires"),
  // Password reset fields
  resetPasswordToken: text("reset_password_token").unique(),
  resetPasswordExpires: timestamp("reset_password_expires"),
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  originAirport: text("origin_airport").notNull(),
  destinationCountry: text("destination_country").notNull(),
  travelMonth: integer("travel_month").notNull(),
  currency: text("currency").notNull(),
  duration: integer("duration").notNull(),
  budget: integer("budget").notNull(),
  preferences: text("preferences").array().notNull(),
  selectedCities: text("selected_cities").array(),
  status: text("status").notNull().default("upcoming"),
  budgetItinerary: jsonb("budget_itinerary"),
  experienceItinerary: jsonb("experience_itinerary"),
  createdAt: timestamp("created_at").defaultNow(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

export const tripsRelations = relations(trips, ({ one }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
}));

// New tables for reference data that was previously hardcoded in routes.ts
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isPhilippine: boolean("is_philippine").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull().references(() => countries.code),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
}, (table) => {
  return {
    // Create a unique constraint for code + countryCode
    codeCountryUnique: unique().on(table.code, table.countryCode),
  };
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  googleId: true,
  facebookId: true,
  profilePicture: true,
  providerData: true,
});

export const insertTripSchema = createInsertSchema(trips).pick({
  userId: true,
  name: true,
  originAirport: true,
  destinationCountry: true,
  travelMonth: true,
  currency: true,
  duration: true,
  budget: true,
  preferences: true,
  selectedCities: true,
  status: true,
  budgetItinerary: true,
  experienceItinerary: true,
  startDate: true,
  endDate: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Generate Trip schema
export const generateTripSchema = z.object({
  originAirport: z.string().min(3, "Please select an origin airport"),
  destinationCountry: z.string().min(2, "Please select a destination country"),
  travelMonth: z.number().int().min(1).max(12),
  currency: z.string().min(3),
  duration: z.number().int().min(1).max(30),
  budget: z.number().int().min(1),
  preferences: z.string().array().min(1, "Please select at least one preference"),
  selectedCities: z.string().array().optional(),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Create insert schemas for the new tables
export const insertAirportSchema = createInsertSchema(airports).pick({
  code: true,
  name: true,
  isPhilippine: true,
  updatedAt: true,
});

export const insertCountrySchema = createInsertSchema(countries).pick({
  code: true,
  name: true,
  updatedAt: true,
});

export const insertCurrencySchema = createInsertSchema(currencies).pick({
  code: true,
  name: true,
  updatedAt: true,
});

export const insertPreferenceSchema = createInsertSchema(preferences).pick({
  code: true,
  name: true,
  icon: true,
  updatedAt: true,
});

export const insertCitySchema = createInsertSchema(cities).pick({
  code: true,
  name: true,
  countryCode: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferenceSchema>;
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateTripInput = z.infer<typeof generateTripSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
