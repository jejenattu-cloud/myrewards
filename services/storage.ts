
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

// Use proxy or direct URL for the Python backend
const API_BASE = window.location.hostname === 'localhost' ? "http://localhost:8080/api/storage" : "/api/storage";

export const StorageService = {
  /**
   * Initializes the app state by fetching from our Python Backend (Cloud SQL Bridge).
   */
  async init(): Promise<AppDatabase> {
    try {
      const response = await fetch(API_BASE);
      
      if (!response.ok) {
        throw new Error(`Cloud SQL API responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        // Hydrate defaults for any missing keys (future proofing)
        return {
          ...DEFAULT_DB,
          ...data,
          smsGateways: data.smsGateways || [],
          gateways: data.gateways || [],
          customers: data.customers || [],
          campaigns: data.campaigns || [],
          rewards: data.rewards || []
        };
      } else {
        console.log("No remote config found in Cloud SQL. Seeding defaults...");
        await this.save(DEFAULT_DB);
        return DEFAULT_DB;
      }
    } catch (e) {
      console.warn("Cloud SQL connection failed. Falling back to default mock data.", e);
      return DEFAULT_DB;
    }
  },

  /**
   * Persists the entire database state to Google Cloud SQL via Python API.
   */
  async save(appData: AppDatabase): Promise<void> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save to Cloud SQL");
      }
      console.log("[StorageService] Cloud SQL Transaction Successful");
    } catch (e) {
      console.error("[StorageService] Cloud SQL Transaction Failed", e);
      throw e;
    }
  },

  /**
   * Utility for partial updates.
   */
  async updateKey<K extends keyof AppDatabase>(key: K, value: AppDatabase[K]): Promise<void> {
    const currentData = await this.init();
    const updatedData = { ...currentData, [key]: value };
    await this.save(updatedData);
  }
};
