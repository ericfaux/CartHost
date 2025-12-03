'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

import { supabase } from '../../../lib/supabase';

type Cart = { id: string; name?: string } | null;

export default function RentalInspectionPage() {
  const params = useParams();
  const resolvedId =
    params?.id && Array.isArray(params.id) ? params.id[0] : (params?.id as string);

  const [cart, setCart] = useState<Cart>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!resolvedId) {
        setError('Cart ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;

        const { data, error: cartError } = await supabase
          .from('carts')
          .select('*')
          .eq('id', resolvedId)
          .single();
        if (cartError) throw cartError;
        setCart(data as Cart);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [resolvedId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" aria-hidden="true" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Verifying...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center space-y-6">
        <div className="flex justify-center">
          <Lock className="h-16 w-16 text-red-500" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">Safety Check Required</h1>
          <p className="text-gray-600">
            You must complete a visual inspection to unlock the key.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Cart: {cart?.name}</h2>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <button
          className="w-full bg-black text-white rounded-lg py-3 font-semibold hover:bg-gray-800 transition-colors"
          onClick={() => alert('Wizard coming soon')}
        >
          Start Inspection
        </button>
      </div>
    </main>
  );
}
