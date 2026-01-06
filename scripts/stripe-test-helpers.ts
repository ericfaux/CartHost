#!/usr/bin/env npx tsx
/**
 * Stripe Test Helpers
 *
 * Scripts for testing Stripe subscription flows in development.
 *
 * Usage:
 *   npx tsx scripts/stripe-test-helpers.ts <command> [options]
 *
 * Commands:
 *   create-test-customer <email>     Create a test customer
 *   create-test-subscription <customerId> <priceId>  Create a test subscription
 *   advance-clock <clockId> <seconds>  Advance a test clock
 *   list-test-clocks                 List all test clocks
 *   simulate-trial-end <subscriptionId>  Simulate trial expiration
 *   simulate-payment-failure <subscriptionId>  Simulate payment failure
 *
 * Environment:
 *   STRIPE_SECRET_KEY - Your Stripe secret key (must be test mode)
 */

import Stripe from 'stripe';

// Ensure we're in test mode
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

if (!secretKey.startsWith('sk_test_')) {
  console.error('Error: This script only works with Stripe test mode keys (sk_test_*)');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

/**
 * Test card numbers for various scenarios
 */
const TEST_CARDS = {
  success: {
    number: '4242424242424242',
    description: 'Always succeeds',
  },
  requiresAuth: {
    number: '4000002500003155',
    description: 'Requires authentication (3D Secure)',
  },
  declines: {
    number: '4000000000000002',
    description: 'Always declines',
  },
  insufficientFunds: {
    number: '4000000000009995',
    description: 'Declines with insufficient funds',
  },
  expiredCard: {
    number: '4000000000000069',
    description: 'Declines with expired card',
  },
  fraudulent: {
    number: '4100000000000019',
    description: 'Blocked as fraudulent',
  },
};

async function createTestCustomer(email: string): Promise<void> {
  console.log(`Creating test customer for ${email}...`);

  const customer = await stripe.customers.create({
    email,
    description: 'Test customer created via script',
    metadata: {
      environment: 'test',
      created_by: 'stripe-test-helpers',
    },
  });

  console.log('✅ Customer created:');
  console.log(`   ID: ${customer.id}`);
  console.log(`   Email: ${customer.email}`);
}

async function createTestSubscription(
  customerId: string,
  priceId: string,
  options?: { trialDays?: number; testClockId?: string }
): Promise<void> {
  console.log(`Creating test subscription for customer ${customerId}...`);

  // First, create a payment method and attach it
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: TEST_CARDS.success.number,
      exp_month: 12,
      exp_year: new Date().getFullYear() + 1,
      cvc: '123',
    },
  });

  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customerId,
  });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: options?.trialDays,
    // test_clock: options?.testClockId, // Uncomment when using test clocks
    metadata: {
      environment: 'test',
      created_by: 'stripe-test-helpers',
    },
  });

  console.log('✅ Subscription created:');
  console.log(`   ID: ${subscription.id}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Price: ${priceId}`);
  if (subscription.trial_end) {
    console.log(`   Trial ends: ${new Date(subscription.trial_end * 1000).toISOString()}`);
  }
}

async function listTestClocks(): Promise<void> {
  console.log('Listing test clocks...');

  const clocks = await stripe.testHelpers.testClocks.list({ limit: 10 });

  if (clocks.data.length === 0) {
    console.log('No test clocks found.');
    return;
  }

  console.log('\nTest Clocks:');
  for (const clock of clocks.data) {
    console.log(`  ${clock.id}`);
    console.log(`    Frozen time: ${new Date(clock.frozen_time * 1000).toISOString()}`);
    console.log(`    Status: ${clock.status}`);
  }
}

async function createTestClock(name: string): Promise<void> {
  console.log(`Creating test clock "${name}"...`);

  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: Math.floor(Date.now() / 1000),
    name,
  });

  console.log('✅ Test clock created:');
  console.log(`   ID: ${clock.id}`);
  console.log(`   Frozen time: ${new Date(clock.frozen_time * 1000).toISOString()}`);
}

async function advanceTestClock(clockId: string, seconds: number): Promise<void> {
  console.log(`Advancing test clock ${clockId} by ${seconds} seconds...`);

  // Get current clock time
  const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
  const newTime = clock.frozen_time + seconds;

  await stripe.testHelpers.testClocks.advance(clockId, {
    frozen_time: newTime,
  });

  console.log('✅ Test clock advanced:');
  console.log(`   New time: ${new Date(newTime * 1000).toISOString()}`);
}

async function simulateTrialEnd(subscriptionId: string): Promise<void> {
  console.log(`Simulating trial end for subscription ${subscriptionId}...`);

  // Get the subscription to find the trial end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription.trial_end) {
    console.error('Error: Subscription is not in trial');
    return;
  }

  // If using a test clock, advance past trial end
  // Otherwise, we need to update the subscription manually
  console.log('Note: To properly simulate trial end, use test clocks or wait for the trial to expire.');
  console.log(`Trial ends at: ${new Date(subscription.trial_end * 1000).toISOString()}`);
}

async function simulatePaymentFailure(subscriptionId: string): Promise<void> {
  console.log(`Simulating payment failure for subscription ${subscriptionId}...`);

  // Get subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;

  // Create a failing payment method
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: TEST_CARDS.declines.number,
      exp_month: 12,
      exp_year: new Date().getFullYear() + 1,
      cvc: '123',
    },
  });

  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customerId,
  });

  // Set as default
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  });

  console.log('✅ Declining payment method attached');
  console.log('   Next invoice will fail to charge');
}

function printTestCards(): void {
  console.log('\n📋 Stripe Test Card Numbers\n');
  console.log('Use these card numbers for testing in Stripe test mode.');
  console.log('Expiry: Any future date (e.g., 12/25)');
  console.log('CVC: Any 3 digits (e.g., 123)\n');

  for (const [key, card] of Object.entries(TEST_CARDS)) {
    console.log(`  ${key}:`);
    console.log(`    Number: ${card.number}`);
    console.log(`    ${card.description}\n`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'create-customer':
      if (!args[1]) {
        console.error('Usage: create-customer <email>');
        process.exit(1);
      }
      await createTestCustomer(args[1]);
      break;

    case 'create-subscription':
      if (!args[1] || !args[2]) {
        console.error('Usage: create-subscription <customerId> <priceId> [trialDays]');
        process.exit(1);
      }
      await createTestSubscription(args[1], args[2], {
        trialDays: args[3] ? parseInt(args[3]) : undefined,
      });
      break;

    case 'list-clocks':
      await listTestClocks();
      break;

    case 'create-clock':
      if (!args[1]) {
        console.error('Usage: create-clock <name>');
        process.exit(1);
      }
      await createTestClock(args[1]);
      break;

    case 'advance-clock':
      if (!args[1] || !args[2]) {
        console.error('Usage: advance-clock <clockId> <seconds>');
        process.exit(1);
      }
      await advanceTestClock(args[1], parseInt(args[2]));
      break;

    case 'simulate-trial-end':
      if (!args[1]) {
        console.error('Usage: simulate-trial-end <subscriptionId>');
        process.exit(1);
      }
      await simulateTrialEnd(args[1]);
      break;

    case 'simulate-payment-failure':
      if (!args[1]) {
        console.error('Usage: simulate-payment-failure <subscriptionId>');
        process.exit(1);
      }
      await simulatePaymentFailure(args[1]);
      break;

    case 'test-cards':
      printTestCards();
      break;

    default:
      console.log('Stripe Test Helpers\n');
      console.log('Commands:');
      console.log('  create-customer <email>         Create a test customer');
      console.log('  create-subscription <cust> <price> [trialDays]');
      console.log('                                  Create a test subscription');
      console.log('  list-clocks                     List test clocks');
      console.log('  create-clock <name>             Create a test clock');
      console.log('  advance-clock <id> <seconds>    Advance a test clock');
      console.log('  simulate-trial-end <subId>      Info about simulating trial end');
      console.log('  simulate-payment-failure <id>   Attach failing payment method');
      console.log('  test-cards                      Print test card numbers\n');
      console.log('Environment:');
      console.log('  STRIPE_SECRET_KEY               Stripe secret key (test mode only)');
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
