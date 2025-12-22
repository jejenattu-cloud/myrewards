
import { IntegratedSmsGateway } from '../types';

export const SmsService = {
  /**
   * Sends an SMS via Textflow RapidAPI using the implementation logic from the provided Python snippet.
   * @param gateway The configured gateway containing the Textflow service api_key
   * @param to The recipient phone number (including country code)
   * @param message The SMS message text
   */
  async sendSms(gateway: IntegratedSmsGateway, to: string, message: string): Promise<{ success: boolean; message: string }> {
    if (gateway.provider !== 'Textflow') {
      return { success: false, message: `Provider '${gateway.provider}' is not supported in this module.` };
    }

    if (!gateway.apiKey) {
      return { success: false, message: 'Textflow Service Key is missing. Please enter it in Settings.' };
    }

    // Clean phone number: remove spaces, dashes, parentheses
    const cleanPhone = to.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone.startsWith('+')) {
      return { success: false, message: 'Phone number must include country code starting with "+" (e.g., +6011...).' };
    }

    try {
      console.log(`[SmsService] Dispatching via Textflow RapidAPI to ${cleanPhone}...`);
      
      const response = await fetch('https://textflow-sms-api.p.rapidapi.com/send-sms', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '15051f49f3mshe0ecd994c6f8674p12e6e2jsnaec09a29320f', // Hardcoded from the provided Python snippet
          'x-rapidapi-host': 'textflow-sms-api.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            phone_number: cleanPhone,
            text: message,
            api_key: gateway.apiKey // This is the service key entered by the user in Settings
          }
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        // Successful dispatch
        return { 
          success: true, 
          message: 'SMS successfully dispatched via Textflow RapidAPI!' 
        };
      } else {
        const errorMsg = responseData.message || responseData.error || 'Check your Service Key or Phone number.';
        return { 
          success: false, 
          message: `Textflow API Error: ${errorMsg}` 
        };
      }
    } catch (error) {
      console.error('[SmsService] Fetch Error:', error);
      return { success: false, message: 'Connection failed. Please check your network and API credentials.' };
    }
  }
};
