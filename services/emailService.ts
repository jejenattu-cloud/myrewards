
import { IntegratedEmailGateway } from '../types';

/**
 * Encodes a string to base64url format as required by Gmail API.
 */
function base64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Constructs a raw RFC 2822 email message.
 */
function createRawEmail(to: string, from: string, subject: string, message: string): string {
  const email = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    message
  ].join('\r\n');
  
  return base64urlEncode(email);
}

export const EmailService = {
  /**
   * Dispatches an email. Uses real Gmail API if OAuth token is present.
   */
  async sendTestEmail(gateway: IntegratedEmailGateway, toAddress: string): Promise<{ success: boolean; message: string }> {
    console.group(`[EmailService] Attempting real dispatch via ${gateway.provider}`);
    
    const sender = gateway.fromAddress;
    if (!sender) {
      console.groupEnd();
      return { success: false, message: "Error: No sender address configured." };
    }

    // REAL GMAIL API FLOW
    if (gateway.provider === 'Gmail' && gateway.authType === 'oauth' && gateway.accessToken) {
      try {
        const raw = createRawEmail(
          toAddress,
          sender,
          'Bean & Leaf: Connection Test',
          'Hello! This is a real test email from your Bean & Leaf Admin integration. If you are reading this, your real Gmail connection is working!'
        );

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gateway.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Gmail API Success]', data);
          console.groupEnd();
          return {
            success: true,
            message: `Real email successfully sent to ${toAddress} via Gmail API!`
          };
        } else {
          const error = await response.json();
          console.error('[Gmail API Error]', error);
          console.groupEnd();
          return {
            success: false,
            message: `Gmail API Error: ${error.error?.message || 'Unauthorized or expired token.'}`
          };
        }
      } catch (err) {
        console.error('[Network Error]', err);
        console.groupEnd();
        return { success: false, message: "Network error connecting to Google APIs." };
      }
    }

    // Fallback/Mock for other providers
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[EmailService] Provider fallback used.');
    console.groupEnd();
    
    if (gateway.apiKey || gateway.password) {
      return { 
        success: true, 
        message: `Simulated dispatch successful for ${gateway.provider}.` 
      };
    }

    return { success: false, message: "Missing credentials for this provider." };
  }
};
