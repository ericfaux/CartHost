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

  // --- NEW: FORMATTING LOGIC ---
  // Remove all non-numeric characters (parentheses, dashes, spaces)
  let cleanTo = to.replace(/\D/g, '');

  // If it's a standard 10-digit US number, add +1
  if (cleanTo.length === 10) {
    cleanTo = `+1${cleanTo}`;
  } 
  // If it has 11 digits and starts with 1, add +
  else if (cleanTo.length === 11 && cleanTo.startsWith('1')) {
    cleanTo = `+${cleanTo}`;
  }
  // Otherwise, fallback to adding + if missing
  else if (!to.startsWith('+')) {
    cleanTo = `+${cleanTo}`;
  }
  // -----------------------------

  try {
    const message = await client.messages.create({
      body,
      from: phoneNumber,
      to: cleanTo, // Use the formatted number
    });
    console.log(`✅ SMS sent to ${cleanTo}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
    return null;
  }
}
