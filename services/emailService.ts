
import { IntegratedEmailGateway } from '../types';

/**
 * Encodes an email message into a base64url string as required by the Gmail API.
 */
function encodeMessage(to: string, from: string, subject: string, body: string) {
  const email = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ].join('\r\n');

  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const EmailService = {
  /**
   * Sends a real test email through the specified gateway if it has OAuth.
   * Fallbacks to simulation for other modes or if API fails.
   */
  async sendTestEmail(gateway: IntegratedEmailGateway, toAddress: string): Promise<{ success: boolean; message: string }> {
    console.log(`[EmailService] Dispatching test email from ${gateway.fromAddress} via ${gateway.provider} [${gateway.authType}] to ${toAddress}...`);

    const sender = gateway.fromAddress;
    if (!sender) {
      return { success: false, message: "Error: No sender address configured." };
    }

    if (gateway.authType === 'oauth' && gateway.accessToken && gateway.provider === 'Gmail') {
      try {
        const rawMessage = encodeMessage(
          toAddress,
          sender,
          'Bean & Leaf: Connection Test',
          'Hello! This is a real test email from your Bean & Leaf Admin Console integration. If you are reading this, your Gmail OAuth integration is working perfectly!'
        );

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gateway.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawMessage }),
        });

        if (response.ok) {
          return {
            success: true,
            message: `Successfully sent real email from ${sender} via Google API!`
          };
        } else {
          const errorData = await response.json();
          console.error('[EmailService] Gmail API Error:', errorData);
          return {
            success: false,
            message: `Gmail API Error: ${errorData.error?.message || 'Failed to send'}.`
          };
        }
      } catch (error) {
        console.error('[EmailService] Network/Auth Error:', error);
        return { success: false, message: "Network error while calling Gmail API." };
      }
    }

    // Simulation for credentials or other providers
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (gateway.authType === 'credentials') {
      if (!gateway.password) {
        return { success: false, message: "Login Error: Password missing." };
      }
      return { 
        success: true, 
        message: `Simulated test email sent from ${sender} using direct credentials.` 
      };
    }

    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
      return { success: true, message: `Successfully sent simulated test email via ${gateway.provider} API.` };
    } else {
      return { success: false, message: `${gateway.provider} API Error: Request failed.` };
    }
  }
};