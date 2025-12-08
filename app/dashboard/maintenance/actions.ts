'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createServiceLog(formData: FormData) {
  try {
    const cartId = formData.get('cartId')?.toString().trim();
    const serviceDateInput = formData.get('serviceDate')?.toString().trim();
    const serviceType = formData.get('serviceType')?.toString().trim();
    const costInput = formData.get('cost')?.toString().trim();
    const notes = formData.get('notes')?.toString().trim();

    if (!cartId) {
      throw new Error('Cart ID is required to log a service.');
    }

    if (!serviceType) {
      throw new Error('Service type is required.');
    }

    const serviceDate =
      serviceDateInput && serviceDateInput.length > 0
        ? serviceDateInput
        : new Date().toISOString().split('T')[0];

    const parsedCost = costInput ? Number.parseFloat(costInput) : 0;
    const cost = Number.isFinite(parsedCost) ? parsedCost : 0;

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('You must be logged in to log maintenance.');
    }

    const { error } = await supabase.from('service_logs').insert({
      cart_id: cartId,
      service_date: serviceDate,
      service_type: serviceType,
      cost,
      notes,
      host_id: user.id,
    });

    if (error) {
      throw new Error(`Failed to create service log: ${error.message}`);
    }

    revalidatePath('/dashboard/maintenance');
    revalidatePath('/dashboard/fleet');
  } catch (error) {
    console.error('createServiceLog error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the service log.');
  }
}

export async function updateServiceCost(logId: string, newCost: number) {
  try {
    if (!logId?.trim()) {
      return { error: 'Service log ID is required.' };
    }

    if (!Number.isFinite(newCost)) {
      return { error: 'A valid numeric cost is required.' };
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be logged in to update maintenance logs.' };
    }

    const { error, data } = await supabase
      .from('service_logs')
      .update({ cost: newCost })
      .eq('id', logId)
      .eq('host_id', user.id)
      .select('id')
      .single();

    if (error) {
      return { error: `Failed to update service cost: ${error.message}` };
    }

    if (!data) {
      return { error: 'Service log not found for this user.' };
    }

    revalidatePath('/dashboard/maintenance');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('updateServiceCost error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while updating the service cost.' };
  }
}
