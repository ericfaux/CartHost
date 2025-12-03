'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Unlock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import InspectionWizard from '../../../components/InspectionWizard';// Import the new component

type Cart = { id: string; name?: string; key_code?: string } | null;

export default function RentalInspectionPage() {
  const params = useParams();
  const resolvedId =
    params?.id && Array.isArray(params.id) ? params.id[0] : (params?.id as string);

  const [cart, setCart] = useState<Cart>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New States for the Flow
  const [isInspecting, setIsInspecting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!resolvedId) return;

      setLoading(true);
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
        setError(err.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [resolvedId]);

  const handleUnlock = () => {
    setIsInspecting(false);
    setIsUnlocked(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        
        {/* STATE 1: SUCCESS (UNLOCKED) */}
        {isUnlocked ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Unlock className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-green-700">RIDE UNLOCKED</h1>
              <p className="text-gray-600">You are good to go!</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">
                Key Safe Code
              </p>
              <p className="text-4xl font-mono font-bold text-black tracking-widest">
                {cart?.key_code || '----'}
              </p>
            </div>
            <button 
              className="w-full bg-gray-100 text-gray-900 rounded-lg py-3 font-medium"
              onClick={() => alert('Checkout flow coming in Phase 2!')}
            >
              End Rental / Checkout
            </button>
          </div>
        ) : isInspecting ? (
          
          /* STATE 2: WIZARD MODE */
          <InspectionWizard 
            cartId={resolvedId!} 
            onComplete={handleUnlock} 
          />

        ) : (
          
          /* STATE 3: LOCKED (START) */
          <div className="space-y-6">
            <div className="flex justify-center">
              <Lock className="h-16 w-16 text-red-500" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold">Safety Check Required</h1>
              <p className="text-gray-600">
                You must complete a visual inspection to unlock the key.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart: {cart?.name}
                </h2>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2 justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              className="w-full bg-black text-white rounded-lg py-3 font-semibold hover:bg-gray-800 transition-all active:scale-95"
              onClick={() => setIsInspecting(true)}
            >
              Start Inspection
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
