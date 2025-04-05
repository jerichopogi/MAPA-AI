import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
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
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateTripInput = z.infer<typeof generateTripSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
