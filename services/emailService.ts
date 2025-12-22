
import { IntegratedEmailGateway } from '../types';

export const EmailService = {
  /**
   * Simulates sending a test email through the specified gateway.
   * Handles OAuth, API Key, and Direct Login (Credentials) modes.
   */
  async sendTestEmail(gateway: IntegratedEmailGateway, toAddress: string): Promise<{ success: boolean; message: string }> {
    console.log(`[EmailService] Dispatching test email from ${gateway.fromAddress} via ${gateway.provider} [${gateway.authType}] to ${toAddress}...`);
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 2200));

    const sender = gateway.fromAddress || 'nashaubrown@gmail.com';

    if (gateway.authType === 'oauth') {
      const token = gateway.accessToken;
      if (!token) {
        return { success: false, message: "OAuth Error: Connection token missing." };
      }

      // Simulation of OAuth request
      console.debug('Executed OAuth API Simulation with Bearer Token');
      return { 
        success: true, 
        message: `Test email successfully sent from ${sender} using secure OAuth2.` 
      };
    }

    if (gateway.authType === 'credentials') {
      if (!gateway.password) {
        return { success: false, message: "Login Error: Password or App Password missing." };
      }
      
      // Simulation of SMTP / Direct Login
      console.debug('Executed SMTP/Login Simulation with user credentials');
      return { 
        success: true, 
        message: `Test email successfully sent from ${sender} using direct login credentials.` 
      };
    }

    // Default API Key simulation
    const isSuccess = Math.random() > 0.05; 
    if (isSuccess) {
      return { 
        success: true, 
        message: `Successfully sent test email via ${gateway.provider} API Key.` 
      };
    } else {
      return { 
        success: false, 
        message: `${gateway.provider} API Error: Request rejected or unauthorized.` 
      };
    }
  }
};
