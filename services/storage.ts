
import { MOCK_CUSTOMERS, MOCK_CAMPAIGNS, MOCK_REWARDS } from '../constants';
import { Profile, IntegratedEmailGateway, IntegratedSmsGateway, Customer, Campaign, Reward } from '../types';

export interface AppDatabase {
  profile: Profile;
  gateways: IntegratedEmailGateway[];
  smsGateways: IntegratedSmsGateway[];
  customers: Customer[];
  campaigns: Campaign[];
  rewards: Reward[];
  settings: {
    isDarkMode: boolean;
    isSmsEnabled: boolean;
    isEmailEnabled: boolean;
  };
}

export const DEFAULT_DB: AppDatabase = {
  profile: {
    businessName: 'Bean & Leaf',
    currency: 'USD ($)',
    timezone: 'Pacific Standard Time (PST)'
  },
  gateways: [],
  smsGateways: [],
  customers: MOCK_CUSTOMERS,
  campaigns: MOCK_CAMPAIGNS,
  rewards: MOCK_REWARDS,
  settings: {
    isDarkMode: false,
    isSmsEnabled: true,
    isEmailEnabled: true
  }
};

const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:8080/api/storage" 
  : "/api/storage";

async function fetchWithTimeout(resource: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const StorageService = {
  /**
   * Initializes the app state by fetching from our Python Backend (Cloud SQL Bridge).
   */
  async init(): Promise<AppDatabase> {
    try {
      console.log("[StorageService] Connecting to Cloud SQL Instance...");
      const response = await fetchWithTimeout(API_BASE, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 15000); // Increased timeout for Cloud SQL cold starts
      
      if (!response.ok) {
        throw new Error(`Cloud SQL API responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // If data is empty (first run), initialize with defaults
      if (!data || Object.keys(data).length === 0) {
        console.log("Database is empty. Seeding initial application state...");
        await this.save(DEFAULT_DB);
        return DEFAULT_DB;
      }

      // Merge defaults to handle schema evolution
      const result = {
        ...DEFAULT_DB,
        ...data,
        profile: { ...DEFAULT_DB.profile, ...data.profile },
        settings: { ...DEFAULT_DB.settings, ...data.settings }
      };

      // Cache locally for offline reliability
      localStorage.setItem('bean_leaf_cache', JSON.stringify(result));
      return result;

    } catch (e) {
      console.warn("Cloud SQL bridge failed. Trying local cache...", e);
      const cached = localStorage.getItem('bean_leaf_cache');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (err) {
          return DEFAULT_DB;
        }
      }
      return DEFAULT_DB;
    }
  },

  /**
   * Persists the entire database state to Google Cloud SQL via Python API.
   */
  async save(appData: AppDatabase): Promise<void> {
    // Always update local cache immediately for UI responsiveness
    localStorage.setItem('bean_leaf_cache', JSON.stringify(appData));

    try {
      const response = await fetchWithTimeout(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(appData)
      }, 5000);
      
      if (!response.ok) {
        throw new Error(`Failed to save to Cloud SQL: ${response.status}`);
      }
      console.log("[StorageService] Cloud SQL Sync Successful");
    } catch (e) {
      console.error("[StorageService] Cloud SQL Sync Deferred (Offline Mode)", e);
    }
  },

  /**
   * Utility for partial updates.
   */
  async updateKey<K extends keyof AppDatabase>(key: K, value: AppDatabase[K]): Promise<void> {
    const cached = localStorage.getItem('bean_leaf_cache');
    let currentData = cached ? JSON.parse(cached) : DEFAULT_DB;
    const updatedData = { ...currentData, [key]: value };
    await this.save(updatedData);
  }
};
