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

  try {
    const message = await client.messages.create({
      body,
      from: phoneNumber,
      to,
    });
    console.log(`✅ SMS sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
    // We don't throw here to prevent crashing the main flow if SMS fails
    return null;
  }
}
