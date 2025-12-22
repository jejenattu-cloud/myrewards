
import { MOCK_CUSTOMERS, MOCK_CAMPAIGNS, MOCK_REWARDS } from '../constants';
import { Profile, IntegratedEmailGateway, IntegratedSmsGateway, Customer, Campaign, Reward } from '../types';

const STORAGE_KEY = 'bean_and_leaf_db';

interface AppDatabase {
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

const DEFAULT_DB: AppDatabase = {
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
  init(): AppDatabase {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.save(DEFAULT_DB);
      return DEFAULT_DB;
    }
    try {
      const parsed = JSON.parse(data);
      // Ensure missing keys are initialized if they don't exist in older storage versions
      if (!parsed.smsGateways) parsed.smsGateways = [];
      return parsed;
    } catch (e) {
      console.error("Database corruption detected. Resetting to defaults.");
      this.save(DEFAULT_DB);
      return DEFAULT_DB;
    }
  },

  save(db: AppDatabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  },

  get<K extends keyof AppDatabase>(key: K): AppDatabase[K] {
    const db = this.init();
    return db[key];
  },

  update<K extends keyof AppDatabase>(key: K, value: AppDatabase[K]) {
    const db = this.init();
    db[key] = value;
    this.save(db);
  }
};
