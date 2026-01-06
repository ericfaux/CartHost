# Stripe Testing Guide

This guide covers testing the CartHost Stripe subscription integration in development and staging environments.

## Test Card Numbers

Use these card numbers in Stripe test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 0002` | Always declines |
| `4000 0000 0000 9995` | Declines with insufficient funds |
| `4000 0000 0000 0069` | Declines with expired card |
| `4100 0000 0000 0019` | Blocked as fraudulent |

For all test cards:
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any valid ZIP code

## Testing Flows

### 1. New User Signup → Subscribe → Access Dashboard

1. Create a new account at `/signup`
2. Verify email
3. You'll be redirected to `/subscribe`
4. Select a plan and enter test card `4242 4242 4242 4242`
5. Complete checkout
6. You should be redirected to the dashboard

### 2. Abandoned Checkout

1. Start checkout but close the Stripe modal
2. Wait 24 hours (or advance test clock)
3. `checkout.session.expired` webhook should fire
4. User can return to `/subscribe` and try again

### 3. Trial Expiration

1. Create subscription with trial
2. Advance test clock past trial end
3. `customer.subscription.updated` webhook updates status
4. User sees trial banner in last 7 days

### 4. Payment Failure → Past Due

1. Create subscription with successful card
2. Attach failing card `4000 0000 0000 0002`
3. Wait for next billing cycle (or advance clock)
4. `invoice.payment_failed` webhook fires
5. User sees `PastDueBanner` in dashboard
6. Update to success card via Customer Portal
7. `invoice.payment_succeeded` restores subscription

### 5. Subscription Cancellation

1. User opens Customer Portal
2. Clicks cancel subscription
3. Chooses "Cancel at end of period"
4. `customer.subscription.updated` webhook sets `cancel_at_period_end`
5. Access continues until period end
6. `customer.subscription.deleted` webhook removes access

## Test Helper Script

Use the test helper script for development:

```bash
# Print all test cards
npx tsx scripts/stripe-test-helpers.ts test-cards

# Create a test customer
npx tsx scripts/stripe-test-helpers.ts create-customer test@example.com

# Create a subscription
npx tsx scripts/stripe-test-helpers.ts create-subscription cus_xxx price_xxx

# Create a test clock for time manipulation
npx tsx scripts/stripe-test-helpers.ts create-clock "Trial Testing"

# Advance a test clock by 30 days
npx tsx scripts/stripe-test-helpers.ts advance-clock clock_xxx 2592000

# Simulate payment failure
npx tsx scripts/stripe-test-helpers.ts simulate-payment-failure sub_xxx
```

## Database Setup

### Webhook Events Table

Create this table to enable webhook idempotency:

```sql
-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  error_message text,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);

-- Index for cleanup queries
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at);

-- Optional: RLS policy (webhook handler uses service role, but good practice)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role has full access" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Cleanup old events after 30 days
-- Run this periodically or set up a cron job
-- DELETE FROM webhook_events WHERE created_at < now() - interval '30 days';
```

### Subscriptions Table

Ensure your subscriptions table has these fields:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,  -- Stripe subscription ID
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL,
  price_id text,
  quantity int DEFAULT 1,
  cancel_at_period_end boolean DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created timestamptz,
  ended_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Index for user lookups
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Index for status queries
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### Hosts Table Fields

Ensure your hosts table has these subscription-related fields:

```sql
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'pending';
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS plan_variant text;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS is_beta_user boolean DEFAULT false;
```

## Webhook Testing

### Local Development with Stripe CLI

1. Install the Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) to your `.env.local`

5. Trigger test events:
   ```bash
   # Successful checkout
   stripe trigger checkout.session.completed

   # Subscription created
   stripe trigger customer.subscription.created

   # Payment failed
   stripe trigger invoice.payment_failed
   ```

### Testing Webhook Idempotency

The webhook handler is idempotent - sending the same event twice won't cause issues:

```bash
# Send a test event
stripe trigger checkout.session.completed

# Check the webhook_events table
# SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 5;

# Send the same event again (it will be skipped)
stripe events resend evt_xxx
```

## Environment Variables

Required for Stripe integration:

```env
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Publishable key for frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_...

# Price IDs for each tier
NEXT_PUBLIC_PRICE_TIER1=price_...
NEXT_PUBLIC_PRICE_TIER1_ANNUAL=price_...
NEXT_PUBLIC_PRICE_TIER2=price_...
NEXT_PUBLIC_PRICE_TIER2_ANNUAL=price_...
NEXT_PUBLIC_PRICE_FLEET=price_...
NEXT_PUBLIC_PRICE_BETA=price_...
```

## Test Clock Usage

Test clocks let you simulate time passing for subscriptions:

1. **Create a test clock**:
   ```bash
   npx tsx scripts/stripe-test-helpers.ts create-clock "Trial Testing"
   ```

2. **Create customer attached to clock**:
   - Use the Stripe Dashboard or API
   - Customer must be created with `test_clock` parameter

3. **Create subscription for that customer**:
   - Subscription inherits the test clock

4. **Advance time**:
   ```bash
   # Advance 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
   npx tsx scripts/stripe-test-helpers.ts advance-clock clock_xxx 2592000
   ```

5. **Observe events**:
   - Trial end events fire
   - Billing events fire
   - Subscription status updates

## Debugging Tips

### Check Subscription Status

Use the sync endpoint to verify subscription state:

```bash
curl -X POST http://localhost:3000/api/stripe/sync-subscription \
  -H "Cookie: <your-auth-cookie>"
```

### View Webhook Logs

In development, webhook events are logged to console in JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "stripe-webhook",
  "eventId": "evt_xxx",
  "eventType": "customer.subscription.updated",
  "message": "Subscription synced",
  "subscriptionId": "sub_xxx",
  "hostId": "uuid",
  "status": "active"
}
```

### Common Issues

1. **Webhook not receiving events**
   - Check Stripe CLI is running
   - Verify webhook secret matches
   - Check endpoint URL is correct

2. **Subscription status not updating**
   - Use sync endpoint to force refresh
   - Check webhook_events table for errors
   - Verify host has stripe_customer_id

3. **Trial not showing correctly**
   - Check subscription has trial_end set
   - Verify trial_end is in the future
   - Check subscriptions table has trial dates

4. **Customer Portal not opening**
   - Verify stripe_customer_id exists
   - Check Stripe Customer Portal is configured
   - Verify return URL is allowed in Stripe settings
