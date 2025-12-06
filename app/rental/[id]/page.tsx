'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Unlock, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import InspectionWizard from '../../../components/InspectionWizard';
import PlugVerifier from '../../../components/PlugVerifier'; // New Import

type Cart = {
  id: string;
  name?: string;
  key_code?: string;
  access_instructions?: string | null;
} | null;

export default function RentalInspectionPage() {
  const params = useParams();
  // Handle potential array from params safely
  const resolvedId = params?.id && Array.isArray(params.id) ? params.id[0] : params?.id as string;

  const [cart, setCart] = useState<Cart>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // New State for User ID
  const [activeRentalId, setActiveRentalId] = useState<string | null>(null);
  
  // State Machine
  const [isInspecting, setIsInspecting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false); // New State for Checkout
  const [isCompleted, setIsCompleted] = useState(false); // New State for Done

  useEffect(() => {
    const initializePage = async () => {
      if (!resolvedId) return;

      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        if (authData.user) setUserId(authData.user.id);

        const { data: cartData, error: cartError } = await supabase
          .from('carts')
          .select('*')
          .eq('id', resolvedId)
          .single();
        if (cartError) throw cartError;
        setCart(cartData as Cart);

        const { data: rental, error: rentalError } = await supabase
          .from('rentals')
          .select('id, status, cart_id')
          .eq('cart_id', resolvedId)
          .eq('status', 'active')
          .maybeSingle();
        if (rentalError) throw rentalError;

        if (rental) {
          setIsUnlocked(true);
          setActiveRentalId(rental.id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [resolvedId]);

  const handleUnlock = (rentalId: string) => {
    setIsInspecting(false);
    setIsUnlocked(true);
    setActiveRentalId(rentalId);
  };

  const handleCheckoutSuccess = async () => {
    if (!activeRentalId) return;

    const { error } = await supabase
      .from('rentals')
      .update({ status: 'completed', checkout_time: new Date().toISOString() })
      .eq('id', activeRentalId);

    if (error) {
      alert(error.message);
      return;
    }

    setIsCheckingOut(false);
    setIsCompleted(true);
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
        
        {/* STATE 4: RENTAL COMPLETED (SUCCESS) */}
        {isCompleted ? (
           <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-center">
             <div className="bg-green-100 p-4 rounded-full">
               <CheckCircle className="h-16 w-16 text-green-600" />
             </div>
           </div>
           <div className="space-y-2">
             <h1 className="text-3xl font-bold text-green-700">All Set!</h1>
             <p className="text-gray-600">
               Thank you for plugging in. <br/> Your rental session is closed.
             </p>
           </div>
           <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
             You may now close this window.
           </div>
         </div>
        ) : isCheckingOut ? (

          /* STATE 3: CHECKOUT (PLUG VERIFIER) */
          <PlugVerifier
            cartId={resolvedId}
            userId={userId!}
            rentalId={activeRentalId!}
            onSuccess={handleCheckoutSuccess}
          />

        ) : isUnlocked ? (

          /* STATE 2: ACTIVE RENTAL (KEY REVEAL) */
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

            {cart?.access_instructions && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-left text-sm text-blue-800">
                <Info className="mt-0.5 h-4 w-4" />
                <p>{cart.access_instructions}</p>
              </div>
            )}
            
            <div className="pt-8">
              <p className="text-sm text-gray-400 mb-3">Done for the day?</p>
              <button 
                className="w-full bg-gray-900 text-white rounded-lg py-4 font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                onClick={() => setIsCheckingOut(true)}
              >
                End Rental & Verify Plug
              </button>
            </div>
          </div>

        ) : isInspecting ? (
          
          /* STATE 1.5: WIZARD MODE */
          <InspectionWizard 
            cartId={resolvedId!} 
            onComplete={handleUnlock} 
          />

        ) : (
          
          /* STATE 1: LOCKED (START) */
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
