import { users, type User, type InsertUser, trips, type Trip, type InsertTrip } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // Trip methods
  getTrip(id: number): Promise<Trip | undefined>;
  getUserTrips(userId: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }
  
  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async getUserTrips(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.userId, userId));
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async updateTrip(id: number, tripUpdate: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [updatedTrip] = await db
      .update(trips)
      .set(tripUpdate)
      .where(eq(trips.id, id))
      .returning();
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    await db.delete(trips).where(eq(trips.id, id));
    return true; // PostgreSQL doesn't return count by default
  }
}

// For backwards compatibility during development, we can keep the in-memory storage class
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private userIdCounter: number;
  private tripIdCounter: number;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.userIdCounter = 1;
    this.tripIdCounter = 1;

    // Create a demo user
    this.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "password123",
      fullName: "Demo User"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }
  
  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.facebookId === facebookId
    );
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Create a properly typed User object with all required fields
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password || null,
      fullName: insertUser.fullName || null,
      createdAt: now,
      googleId: insertUser.googleId || null,
      facebookId: insertUser.facebookId || null,
      profilePicture: insertUser.profilePicture || null,
      providerData: insertUser.providerData || null
    };
    
    this.users.set(id, user);
    return user;
  }

  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getUserTrips(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (trip) => trip.userId === userId,
    );
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.tripIdCounter++;
    const now = new Date();
    const trip: Trip = { 
      ...insertTrip, 
      id, 
      createdAt: now,
      status: insertTrip.status || "upcoming",
      startDate: insertTrip.startDate || null,
      endDate: insertTrip.endDate || null,
      budgetItinerary: insertTrip.budgetItinerary || null,
      experienceItinerary: insertTrip.experienceItinerary || null
    };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: number, tripUpdate: Partial<InsertTrip>): Promise<Trip | undefined> {
    const existingTrip = this.trips.get(id);
    if (!existingTrip) {
      return undefined;
    }

    const updatedTrip: Trip = { ...existingTrip, ...tripUpdate };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    return this.trips.delete(id);
  }
}

// Switch to DatabaseStorage
export const storage = new DatabaseStorage();
