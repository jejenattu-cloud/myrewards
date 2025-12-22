
import { MOCK_CUSTOMERS, MOCK_CAMPAIGNS, MOCK_REWARDS } from '../constants';
import { Profile, IntegratedEmailGateway, IntegratedSmsGateway, Customer, Campaign, Reward } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Configuration updated with your Google Cloud Project details
const firebaseConfig = {
  apiKey: process.env.API_KEY, // Uses the API_KEY from environment
  authDomain: "gen-lang-client-0216687781.firebaseapp.com",
  projectId: "gen-lang-client-0216687781",
  storageBucket: "gen-lang-client-0216687781.appspot.com",
  messagingSenderId: "959648036352",
  appId: "1:959648036352:web:7f6a7b8c9d0e1f2g3h4i5j"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Document reference for our singleton application state
const APP_DATA_DOC = doc(db, 'settings', 'main_config');

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

export const StorageService = {
  /**
   * Initializes the app state by fetching from Google Cloud Firestore.
   * If the document doesn't exist, it seeds it with defaults.
   */
  async init(): Promise<AppDatabase> {
    try {
      const docSnap = await getDoc(APP_DATA_DOC);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as AppDatabase;
        // Migration check for new keys
        if (!data.smsGateways) data.smsGateways = [];
        return data;
      } else {
        console.log("No cloud database found. Initializing with defaults...");
        await setDoc(APP_DATA_DOC, DEFAULT_DB);
        return DEFAULT_DB;
      }
    } catch (e) {
      console.error("Cloud Database connection failed. Falling back to default state.", e);
      return DEFAULT_DB;
    }
  },

  /**
   * Persists the entire database state to Google Cloud.
   */
  async save(appData: AppDatabase): Promise<void> {
    try {
      await setDoc(APP_DATA_DOC, appData);
      console.log("[StorageService] Cloud Sync Successful");
    } catch (e) {
      console.error("[StorageService] Cloud Sync Failed", e);
      throw e;
    }
  },

  /**
   * Updates a specific top-level key in the cloud database.
   */
  async updateKey<K extends keyof AppDatabase>(key: K, value: AppDatabase[K]): Promise<void> {
    try {
      await updateDoc(APP_DATA_DOC, {
        [key]: value
      });
      console.log(`[StorageService] Key '${key}' updated in cloud.`);
    } catch (e) {
      console.error(`[StorageService] Failed to update key '${key}'`, e);
      throw e;
    }
  }
};
