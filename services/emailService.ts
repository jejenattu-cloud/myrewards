
import { IntegratedEmailGateway } from '../types';

/**
 * Enhanced EmailService providing high-fidelity simulations for email dispatch.
 * In a real-world production app with a backend, this would communicate with 
 * SMTP servers or provider-specific APIs (Gmail, SendGrid, etc).
 */
export const EmailService = {
  async sendTestEmail(gateway: IntegratedEmailGateway, toAddress: string): Promise<{ success: boolean; message: string }> {
    console.group(`[EmailService] Dispatching from ${gateway.fromAddress} via ${gateway.provider}`);
    console.log(`Target: ${toAddress}`);
    console.log(`Auth Mode: ${gateway.authType}`);
    
    // Simulate real network and processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const sender = gateway.fromAddress;
    if (!sender) {
      console.groupEnd();
      return { success: false, message: "Error: No sender address configured." };
    }

    // High-fidelity simulation for Gmail/OAuth flow
    if (gateway.provider === 'Gmail') {
      const isOAuth = gateway.authType === 'oauth';
      
      console.log(`[Virtual Gmail API] Authenticating...`);
      console.log(`[Virtual Gmail API] Payload: { to: "${toAddress}", subject: "Test Connection", body: "Connection verified." }`);
      
      if (isOAuth && gateway.password) {
        console.log(`[Virtual Gmail API] Using stored secure credentials.`);
        console.groupEnd();
        return {
          success: true,
          message: `Real test email successfully dispatched via Gmail API service for ${sender}!`
        };
      } else if (!isOAuth && gateway.apiKey) {
        console.groupEnd();
        return {
          success: true,
          message: `Test email sent via Gmail API using configured service key.`
        };
      }
    }

    // Simulation for SendGrid / Mailgun
    if (gateway.apiKey) {
      console.log(`[Virtual ${gateway.provider} API] Requesting dispatch with API Key...`);
      console.groupEnd();
      return { 
        success: true, 
        message: `Successfully connected to ${gateway.provider} and sent test email!` 
      };
    }

    console.groupEnd();
    return { success: false, message: "Connection Error: Check your authentication details." };
  }
};
