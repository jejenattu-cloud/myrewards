
export enum View {
  DASHBOARD = 'DASHBOARD',
  CAMPAIGNS = 'CAMPAIGNS',
  CUSTOMERS = 'CUSTOMERS',
  REWARDS = 'REWARDS',
  SETTINGS = 'SETTINGS',
}

export interface Profile {
  businessName: string;
  currency: string;
  timezone: string;
}

export interface IntegratedEmailGateway {
  id: string;
  provider: string;
  fromAddress: string;
  apiKey?: string;
  accessToken?: string;
  password?: string;
  authType: 'api_key' | 'oauth' | 'credentials';
  status: 'Active' | 'Paused';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Subscribed' | 'Unsubscribed';
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  joinedDate: string;
  lastVisit: string;
  tags: string[];
  avatar: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'SMS' | 'Email' | 'App Push';
  status: 'Active' | 'Scheduled' | 'Completed';
  reach: string;
  engagementRate: number;
  ends: string;
  image: string;
}

export interface Reward {
  id: string;
  name: string;
  points: number;
  description: string;
  status: 'Available' | 'Draft';
  image: string;
}
