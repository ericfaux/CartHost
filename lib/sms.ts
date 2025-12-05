import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Singleton initialization
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendSms(to: string, body: string) {
  if (!client || !phoneNumber) {
    console.warn("⚠️ Twilio credentials missing. SMS skipped.");
    return null;
  }

  // 1. Clean the number
  let cleanTo = to.replace(/\D/g, '');

  // 2. Add US Country Code if missing
  if (cleanTo.length === 10) {
    cleanTo = `+1${cleanTo}`;
  } else if (!cleanTo.startsWith('+')) {
    cleanTo = `+${cleanTo}`;
  }

  // 3. Add WhatsApp prefixes for Sandbox
  const whatsappTo = `whatsapp:${cleanTo}`;
  const whatsappFrom = `whatsapp:${phoneNumber}`; 

  try {
    const message = await client.messages.create({
      body,
      from: whatsappFrom,
      to: whatsappTo,
    });
    console.log(`✅ WhatsApp sent to ${whatsappTo}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("❌ Failed to send WhatsApp:", error);
    return null;
  }
}
