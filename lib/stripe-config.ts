/**
 * Stripe Configuration Module
 *
 * Validates all required Stripe environment variables and provides
 * typed access to Stripe configuration. Throws helpful errors if misconfigured.
 */

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  pricingTableId: string;
  prices: {
    tier1: string;
    tier1Annual: string;
    tier2: string;
    tier2Annual: string;
    fleet: string;
    fleetAnnual?: string;
    beta: string;
  };
  isTestMode: boolean;
}

interface ValidationError {
  variable: string;
  message: string;
}

/**
 * Validates that a required environment variable is present
 */
function validateRequired(name: string, value: string | undefined): ValidationError | null {
  if (!value || value.trim() === '') {
    return {
      variable: name,
      message: `Missing required environment variable: ${name}`,
    };
  }
  return null;
}

/**
 * Validates Stripe key format (should start with pk_ or sk_ or whsec_)
 */
function validateKeyFormat(name: string, value: string | undefined, expectedPrefix: string): ValidationError | null {
  if (!value) return null; // Will be caught by validateRequired

  if (!value.startsWith(expectedPrefix)) {
    return {
      variable: name,
      message: `${name} should start with "${expectedPrefix}" but got "${value.substring(0, 10)}..."`,
    };
  }
  return null;
}

/**
 * Validates Stripe price ID format (should start with price_)
 */
function validatePriceId(name: string, value: string | undefined): ValidationError | null {
  if (!value) return null; // Optional prices may be undefined

  if (!value.startsWith('price_')) {
    return {
      variable: name,
      message: `${name} should be a Stripe price ID starting with "price_" but got "${value}"`,
    };
  }
  return null;
}

/**
 * Get all validation errors for Stripe configuration
 */
export function getStripeConfigErrors(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Server-side required variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Client-side required variables
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;

  // Price IDs (at least tier1 is required)
  const priceTier1 = process.env.NEXT_PUBLIC_PRICE_TIER1;

  // Validate required server variables
  const secretKeyError = validateRequired('STRIPE_SECRET_KEY', secretKey);
  if (secretKeyError) errors.push(secretKeyError);

  const webhookError = validateRequired('STRIPE_WEBHOOK_SECRET', webhookSecret);
  if (webhookError) errors.push(webhookError);

  // Validate required client variables
  const pubKeyError = validateRequired('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', publishableKey);
  if (pubKeyError) errors.push(pubKeyError);

  const pricingTableError = validateRequired('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID', pricingTableId);
  if (pricingTableError) errors.push(pricingTableError);

  const tier1Error = validateRequired('NEXT_PUBLIC_PRICE_TIER1', priceTier1);
  if (tier1Error) errors.push(tier1Error);

  // Validate key formats
  const secretFormatError = validateKeyFormat('STRIPE_SECRET_KEY', secretKey, 'sk_');
  if (secretFormatError) errors.push(secretFormatError);

  const webhookFormatError = validateKeyFormat('STRIPE_WEBHOOK_SECRET', webhookSecret, 'whsec_');
  if (webhookFormatError) errors.push(webhookFormatError);

  const pubFormatError = validateKeyFormat('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', publishableKey, 'pk_');
  if (pubFormatError) errors.push(pubFormatError);

  // Validate price ID formats
  const priceIds = [
    ['NEXT_PUBLIC_PRICE_TIER1', process.env.NEXT_PUBLIC_PRICE_TIER1],
    ['NEXT_PUBLIC_PRICE_TIER1_ANNUAL', process.env.NEXT_PUBLIC_PRICE_TIER1_ANNUAL],
    ['NEXT_PUBLIC_PRICE_TIER2', process.env.NEXT_PUBLIC_PRICE_TIER2],
    ['NEXT_PUBLIC_PRICE_TIER2_ANNUAL', process.env.NEXT_PUBLIC_PRICE_TIER2_ANNUAL],
    ['NEXT_PUBLIC_PRICE_FLEET', process.env.NEXT_PUBLIC_PRICE_FLEET],
    ['NEXT_PUBLIC_PRICE_FLEET_ANNUAL', process.env.NEXT_PUBLIC_PRICE_FLEET_ANNUAL],
    ['NEXT_PUBLIC_PRICE_BETA', process.env.NEXT_PUBLIC_PRICE_BETA],
  ] as const;

  for (const [name, value] of priceIds) {
    if (value) {
      const priceError = validatePriceId(name, value);
      if (priceError) errors.push(priceError);
    }
  }

  return errors;
}

/**
 * Validate Stripe configuration and throw if invalid
 * Call this at application startup to fail fast on misconfiguration
 */
export function validateStripeConfig(): void {
  const errors = getStripeConfigErrors();

  if (errors.length > 0) {
    const errorMessages = errors.map((e) => `  - ${e.message}`).join('\n');
    throw new Error(
      `Stripe configuration errors:\n${errorMessages}\n\n` +
        'Please check your environment variables and ensure all required Stripe keys are set.'
    );
  }
}

/**
 * Get validated Stripe configuration
 * Throws if configuration is invalid
 */
export function getStripeConfig(): StripeConfig {
  validateStripeConfig();

  const secretKey = process.env.STRIPE_SECRET_KEY!;

  return {
    secretKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    pricingTableId: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID!,
    prices: {
      tier1: process.env.NEXT_PUBLIC_PRICE_TIER1!,
      tier1Annual: process.env.NEXT_PUBLIC_PRICE_TIER1_ANNUAL ?? '',
      tier2: process.env.NEXT_PUBLIC_PRICE_TIER2 ?? '',
      tier2Annual: process.env.NEXT_PUBLIC_PRICE_TIER2_ANNUAL ?? '',
      fleet: process.env.NEXT_PUBLIC_PRICE_FLEET ?? '',
      fleetAnnual: process.env.NEXT_PUBLIC_PRICE_FLEET_ANNUAL,
      beta: process.env.NEXT_PUBLIC_PRICE_BETA ?? '',
    },
    isTestMode: secretKey.startsWith('sk_test_'),
  };
}

/**
 * Check if we're in Stripe test mode
 */
export function isStripeTestMode(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey?.startsWith('sk_test_') ?? true;
}

/**
 * Get a safe version of the config for logging (no secrets)
 */
export function getStripeConfigSafe(): Omit<StripeConfig, 'secretKey' | 'webhookSecret'> & {
  secretKeyPrefix: string;
  webhookSecretPresent: boolean;
} {
  const config = getStripeConfig();
  return {
    secretKeyPrefix: config.secretKey.substring(0, 8) + '...',
    webhookSecretPresent: !!config.webhookSecret,
    publishableKey: config.publishableKey,
    pricingTableId: config.pricingTableId,
    prices: config.prices,
    isTestMode: config.isTestMode,
  };
}

/**
 * Stripe test card numbers for development
 */
export const TEST_CARDS = {
  success: '4242424242424242',
  requiresAuthentication: '4000002500003155',
  declines: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
  processingError: '4000000000000119',
  // For 3D Secure testing
  authenticate3DS: '4000000000003220',
} as const;

/**
 * Stripe test mode helpers
 */
export const TEST_HELPERS = {
  /**
   * Check if a card number is a test card
   */
  isTestCard: (cardNumber: string): boolean => {
    return Object.values(TEST_CARDS).includes(cardNumber.replace(/\s/g, '') as typeof TEST_CARDS[keyof typeof TEST_CARDS]);
  },

  /**
   * Get expiry date that always works for test cards
   */
  getTestExpiry: (): { month: number; year: number } => {
    const now = new Date();
    return {
      month: 12,
      year: now.getFullYear() + 1,
    };
  },

  /**
   * Get CVC that works for test cards
   */
  getTestCvc: (): string => '123',
} as const;
