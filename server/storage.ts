import { 
  users, type User, type InsertUser, 
  trips, type Trip, type InsertTrip,
  airports, type Airport, type InsertAirport,
  countries, type Country, type InsertCountry,
  currencies, type Currency, type InsertCurrency,
  preferences, type Preference, type InsertPreference,
  cities, type City, type InsertCity
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // Trip methods
  getTrip(id: number): Promise<Trip | undefined>;
  getUserTrips(userId: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;

  // Reference data methods - Airports
  getAllAirports(): Promise<Airport[]>;
  getPhilippineAirports(): Promise<Airport[]>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  updateAirport(id: number, airport: Partial<InsertAirport>): Promise<Airport>;
  deleteAirport(id: number): Promise<boolean>;

  // Reference data methods - Countries
  getAllCountries(): Promise<Country[]>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country>;
  deleteCountry(id: number): Promise<boolean>;

  // Reference data methods - Currencies
  getAllCurrencies(): Promise<Currency[]>;
  getCurrencyByCode(code: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  updateCurrency(id: number, currency: Partial<InsertCurrency>): Promise<Currency>;
  deleteCurrency(id: number): Promise<boolean>;

  // Reference data methods - Preferences
  getAllPreferences(): Promise<Preference[]>;
  getPreferenceByCode(code: string): Promise<Preference | undefined>;
  createPreference(preference: InsertPreference): Promise<Preference>;
  updatePreference(id: number, preference: Partial<InsertPreference>): Promise<Preference>;
  deletePreference(id: number): Promise<boolean>;

  // Reference data methods - Cities
  getAllCities(): Promise<City[]>;
  getCitiesByCountryCode(countryCode: string): Promise<City[]>;
  getCityByCodeAndCountry(cityCode: string, countryCode: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: number, city: Partial<InsertCity>): Promise<City>;
  deleteCity(id: number): Promise<boolean>;
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));
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

  // Reference data methods - Airports
  async getAllAirports(): Promise<Airport[]> {
    return await db.select().from(airports);
  }

  async getPhilippineAirports(): Promise<Airport[]> {
    return await db.select().from(airports).where(eq(airports.isPhilippine, true));
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.code, code));
    return airport;
  }

  async createAirport(airport: InsertAirport): Promise<Airport> {
    const [newAirport] = await db.insert(airports).values(airport).returning();
    return newAirport;
  }

  async updateAirport(id: number, airportUpdate: Partial<InsertAirport>): Promise<Airport> {
    const [updatedAirport] = await db
      .update(airports)
      .set(airportUpdate)
      .where(eq(airports.id, id))
      .returning();
    
    if (!updatedAirport) {
      throw new Error(`Airport with ID ${id} not found`);
    }
    
    return updatedAirport;
  }

  async deleteAirport(id: number): Promise<boolean> {
    await db.delete(airports).where(eq(airports.id, id));
    return true;
  }

  // Reference data methods - Countries
  async getAllCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.code, code));
    return country;
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async updateCountry(id: number, countryUpdate: Partial<InsertCountry>): Promise<Country> {
    const [updatedCountry] = await db
      .update(countries)
      .set(countryUpdate)
      .where(eq(countries.id, id))
      .returning();
    
    if (!updatedCountry) {
      throw new Error(`Country with ID ${id} not found`);
    }
    
    return updatedCountry;
  }

  async deleteCountry(id: number): Promise<boolean> {
    await db.delete(countries).where(eq(countries.id, id));
    return true;
  }

  // Reference data methods - Currencies
  async getAllCurrencies(): Promise<Currency[]> {
    return await db.select().from(currencies);
  }

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    const [currency] = await db.select().from(currencies).where(eq(currencies.code, code));
    return currency;
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const [newCurrency] = await db.insert(currencies).values(currency).returning();
    return newCurrency;
  }

  async updateCurrency(id: number, currencyUpdate: Partial<InsertCurrency>): Promise<Currency> {
    const [updatedCurrency] = await db
      .update(currencies)
      .set(currencyUpdate)
      .where(eq(currencies.id, id))
      .returning();
    
    if (!updatedCurrency) {
      throw new Error(`Currency with ID ${id} not found`);
    }
    
    return updatedCurrency;
  }

  async deleteCurrency(id: number): Promise<boolean> {
    await db.delete(currencies).where(eq(currencies.id, id));
    return true;
  }

  // Reference data methods - Preferences
  async getAllPreferences(): Promise<Preference[]> {
    return await db.select().from(preferences);
  }

  async getPreferenceByCode(code: string): Promise<Preference | undefined> {
    const [preference] = await db.select().from(preferences).where(eq(preferences.code, code));
    return preference;
  }

  async createPreference(preference: InsertPreference): Promise<Preference> {
    const [newPreference] = await db.insert(preferences).values(preference).returning();
    return newPreference;
  }

  async updatePreference(id: number, preferenceUpdate: Partial<InsertPreference>): Promise<Preference> {
    const [updatedPreference] = await db
      .update(preferences)
      .set(preferenceUpdate)
      .where(eq(preferences.id, id))
      .returning();
    
    if (!updatedPreference) {
      throw new Error(`Preference with ID ${id} not found`);
    }
    
    return updatedPreference;
  }

  async deletePreference(id: number): Promise<boolean> {
    await db.delete(preferences).where(eq(preferences.id, id));
    return true;
  }

  // Reference data methods - Cities
  async getAllCities(): Promise<City[]> {
    return await db.select().from(cities);
  }

  async getCitiesByCountryCode(countryCode: string): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.countryCode, countryCode));
  }

  async getCityByCodeAndCountry(cityCode: string, countryCode: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities)
      .where(and(
        eq(cities.code, cityCode),
        eq(cities.countryCode, countryCode)
      ));
    return city;
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async updateCity(id: number, cityUpdate: Partial<InsertCity>): Promise<City> {
    const [updatedCity] = await db
      .update(cities)
      .set(cityUpdate)
      .where(eq(cities.id, id))
      .returning();
    
    if (!updatedCity) {
      throw new Error(`City with ID ${id} not found`);
    }
    
    return updatedCity;
  }

  async deleteCity(id: number): Promise<boolean> {
    await db.delete(cities).where(eq(cities.id, id));
    return true;
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
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token
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
      providerData: insertUser.providerData || null,
      // Email verification and password reset fields
      isVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      resetPasswordToken: null,
      resetPasswordExpires: null
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
    
    // Create a properly typed Trip object
    const trip: Trip = { 
      id,
      userId: insertTrip.userId,
      name: insertTrip.name,
      originAirport: insertTrip.originAirport,
      destinationCountry: insertTrip.destinationCountry,
      travelMonth: insertTrip.travelMonth,
      currency: insertTrip.currency,
      duration: insertTrip.duration,
      budget: insertTrip.budget,
      preferences: insertTrip.preferences,
      selectedCities: insertTrip.selectedCities ?? [],
      status: insertTrip.status || "upcoming",
      createdAt: now,
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

  // Reference data methods - Airports (stub implementations for MemStorage)
  async getAllAirports(): Promise<Airport[]> {
    return [];
  }

  async getPhilippineAirports(): Promise<Airport[]> {
    return [];
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return undefined;
  }

  async createAirport(airport: InsertAirport): Promise<Airport> {
    throw new Error("Method not implemented in memory storage.");
  }

  async updateAirport(id: number, airport: Partial<InsertAirport>): Promise<Airport> {
    throw new Error("Method not implemented in memory storage.");
  }

  async deleteAirport(id: number): Promise<boolean> {
    return false;
  }

  // Reference data methods - Countries (stub implementations for MemStorage)
  async getAllCountries(): Promise<Country[]> {
    return [];
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    return undefined;
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    throw new Error("Method not implemented in memory storage.");
  }

  async updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country> {
    throw new Error("Method not implemented in memory storage.");
  }

  async deleteCountry(id: number): Promise<boolean> {
    return false;
  }

  // Reference data methods - Currencies (stub implementations for MemStorage)
  async getAllCurrencies(): Promise<Currency[]> {
    return [];
  }

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    return undefined;
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    throw new Error("Method not implemented in memory storage.");
  }

  async updateCurrency(id: number, currency: Partial<InsertCurrency>): Promise<Currency> {
    throw new Error("Method not implemented in memory storage.");
  }

  async deleteCurrency(id: number): Promise<boolean> {
    return false;
  }

  // Reference data methods - Preferences (stub implementations for MemStorage)
  async getAllPreferences(): Promise<Preference[]> {
    return [];
  }

  async getPreferenceByCode(code: string): Promise<Preference | undefined> {
    return undefined;
  }

  async createPreference(preference: InsertPreference): Promise<Preference> {
    throw new Error("Method not implemented in memory storage.");
  }

  async updatePreference(id: number, preference: Partial<InsertPreference>): Promise<Preference> {
    throw new Error("Method not implemented in memory storage.");
  }

  async deletePreference(id: number): Promise<boolean> {
    return false;
  }

  // Reference data methods - Cities (stub implementations for MemStorage)
  async getAllCities(): Promise<City[]> {
    return [];
  }

  async getCitiesByCountryCode(countryCode: string): Promise<City[]> {
    return [];
  }

  async getCityByCodeAndCountry(cityCode: string, countryCode: string): Promise<City | undefined> {
    return undefined;
  }

  async createCity(city: InsertCity): Promise<City> {
    throw new Error("Method not implemented in memory storage.");
  }

  async updateCity(id: number, city: Partial<InsertCity>): Promise<City> {
    throw new Error("Method not implemented in memory storage.");
  }

  async deleteCity(id: number): Promise<boolean> {
    return false;
  }
}

// Switch to DatabaseStorage
export const storage = new DatabaseStorage();
