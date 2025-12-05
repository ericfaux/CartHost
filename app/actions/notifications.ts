'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { sendSms } from '../../lib/sms';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function sendWelcomeSms(rentalId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server actions do not need to set cookies here
        }
      },
    },
  });

  const { data: rental, error } = await supabase
    .from('rentals')
    .select(`
      guest_phone,
      carts (
        name,
        key_code
      )
    `)
    .eq('id', rentalId)
    .single();

  if (error || !rental) {
    console.error('Failed to fetch rental for welcome SMS:', error);
    return;
  }

  // @ts-ignore
  const cartName = rental.carts?.name || 'your cart';
  // @ts-ignore
  const keyCode = rental.carts?.key_code || '----';

  if (rental.guest_phone) {
    const message = `Welcome to ${cartName}! Your key code is: ${keyCode}. Please drive safely and remember to plug in the cart when you return! 🛒⚡️`;
    await sendSms(rental.guest_phone, message);
  }
}
