
import { IntegratedEmailGateway } from '../types';

export const EmailService = {
  /**
   * Simulates sending a test email through the specified gateway.
   * Gmail integration now uses OAuth2 (Authorization: Bearer <token>) strictly.
   */
  async sendTestEmail(gateway: IntegratedEmailGateway, toAddress: string): Promise<{ success: boolean; message: string }> {
    console.log(`[EmailService] Dispatching test email from ${gateway.fromAddress} via ${gateway.provider} to ${toAddress}...`);
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 2200));

    if (gateway.provider === 'Gmail') {
      const token = gateway.accessToken;
      const sender = gateway.fromAddress || 'nashaubrown@gmail.com';
      
      if (gateway.authType !== 'oauth' || !token) {
        return { 
          success: false, 
          message: "Gmail Error: OAuth connection required. Please connect your Google account in Settings." 
        };
      }

      try {
        const emailContent = [
          `From: Bean & Leaf <${sender}>`,
          `To: ${toAddress}`,
          `Subject: OAuth Connection Verified: Bean & Leaf`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          `<html>`,
          `<body>`,
          `<h2 style="color: #4285F4;">Google OAuth Success!</h2>`,
          `<p>This is a verification message from your <strong>Bean & Leaf Admin Console</strong>.</p>`,
          `<p>Your Gmail OAuth2 integration for <strong>${sender}</strong> is now securely authorized.</p>`,
          `<hr/>`,
          `<p style="font-size: 10px; color: #666;">Auth Mode: OAuth2 Bearer Token</p>`,
          `<small>Timestamp: ${new Date().toLocaleString()}</small>`,
          `</body>`,
          `</html>`
        ].join('\r\n');

        const mockRequest = {
          method: 'POST',
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: {
            raw: btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
          }
        };

        console.debug('Executed Gmail OAuth API Simulation:', mockRequest);

        // Verification logic for the mock environment
        if (token && token.includes('MOCK_OAUTH_TOKEN')) {
          return { 
            success: true, 
            message: `Test email successfully sent from ${sender} using OAuth2 Secure Channel.` 
          };
        } else {
          return { 
            success: false, 
            message: "OAuth Error: The access token has expired or is invalid." 
          };
        }
      } catch (error) {
        return { success: false, message: "Network error: Failed to establish OAuth handshake with Google APIs." };
      }
    }

    // Simulation logic for non-Gmail providers (API Key based)
    const isSuccess = Math.random() > 0.05; 
    
    if (isSuccess) {
      return { 
        success: true, 
        message: `Successfully sent test email via ${gateway.provider} (From: ${gateway.fromAddress}).` 
      };
    } else {
      return { 
        success: false, 
        message: `${gateway.provider} API Rejected Request: Check your API Key authorization.` 
      };
    }
  }
};
