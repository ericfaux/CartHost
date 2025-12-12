'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Banknote, Lock, Unlock, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import InspectionWizard from '../../../components/InspectionWizard';
import PlugVerifier from '../../../components/PlugVerifier';
import GasCheckout from '../../../components/GasCheckout';
import LockCheckout from '../../../components/LockCheckout';
import HotTubCheckout from '../../../components/HotTubCheckout';

type Cart = {
  id: string;
  name?: string;
  key_code?: string;
  access_instructions?: string | null;
  type?: string | null;
  requires_lock_photo?: boolean | null;
  custom_photo_required?: boolean | null;
  custom_photo_label?: string | null;
  access_type?: string | null;
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
  deposit_amount?: number | null;
  hosts?: {
    property_name?: string | null;
    phone_number?: string | null;
    welcome_message?: string | null;
    enable_guest_text_support?: boolean | null;
  } | null;
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
  const [isLocked, setIsLocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockError, setUnlockError] = useState('');
  
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
          .select('*, custom_photo_required, custom_photo_label, hosts(property_name, phone_number, welcome_message, enable_guest_text_support)')
          .eq('id', resolvedId)
          .single();
        if (cartError) throw cartError;
        const fetchedCart = cartData as Cart;
        setCart(fetchedCart);

        if (fetchedCart?.access_type === 'upsell') {
          const unlockedFlag =
            typeof window !== 'undefined' &&
            localStorage.getItem(`cart_unlocked_${fetchedCart.id}`) === 'true';
          setIsLocked(!unlockedFlag);
        } else {
          setIsLocked(false);
        }

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
          setIsLocked(false);
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

  const handlePaywallUnlock = () => {
    if (!cart) return;

    if (unlockCode === cart.access_code) {
      setIsLocked(false);
      localStorage.setItem(`cart_unlocked_${cart.id}`, 'true');
      setUnlockError('');
      return;
    }

    setUnlockError('Invalid code');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-white pb-20">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-white pb-20">
      <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-slate-800">CartHost</span>
          </div>
          {cart?.hosts?.property_name && (
            <div className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm">
              {cart.hosts.property_name}
            </div>
          )}
        </div>
      </header>
      <div className="max-w-md mx-auto pt-20 px-6 space-y-6 text-center">

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

        /* STATE 3: CHECKOUT */
          cart?.type === 'hot_tub' ? (
            <HotTubCheckout cartId={resolvedId} userId={userId!} onSuccess={handleCheckoutSuccess} />
          ) : cart?.type === 'gas' ? (
            <GasCheckout cartId={resolvedId} userId={userId!} onSuccess={handleCheckoutSuccess} />
          ) : cart?.type === 'bike' && (cart?.requires_lock_photo ?? true) ? (
            <LockCheckout cartId={resolvedId} userId={userId!} onSuccess={handleCheckoutSuccess} />
          ) : cart?.type === 'bike' ? (
            <GasCheckout cartId={resolvedId} userId={userId!} onSuccess={handleCheckoutSuccess} />
          ) : (
            <PlugVerifier
              cartId={resolvedId}
              userId={userId!}
              rentalId={activeRentalId!}
              onSuccess={handleCheckoutSuccess}
            />
          )

        ) : isUnlocked ? (

          /* STATE 2: ACTIVE RENTAL (KEY REVEAL) */
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Unlock className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to {cart?.name || 'Magic Cart'}!</h1>
              <p className="text-gray-600">You are good to go!</p>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 border border-slate-800">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2 font-semibold">Access Code</p>
              <p className="font-mono text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
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
                className="w-full bg-white border border-gray-200 text-slate-900 hover:bg-gray-50 py-4 font-semibold rounded-xl shadow-sm"
                onClick={() => setIsCheckingOut(true)}
              >
                End Rental & Verify Plug
              </button>
            </div>

            {cart.hosts?.enable_guest_text_support !== false && cart.hosts?.phone_number && (
              <p className="text-xs text-gray-400 mt-8">
                Having trouble? <a href={`sms:${cart.hosts.phone_number}`} className="underline hover:text-gray-600">Text your host</a> if the camera isn't working.
              </p>
            )}
          </div>

        ) : isLocked ? (

          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="bg-amber-100 p-4 rounded-full">
                <Banknote className="h-16 w-16 text-amber-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-amber-700">Premium Rental Vehicle</h1>
              <p className="text-gray-600">This cart is available for extra rental.</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700">
                {`$${cart?.upsell_price ?? 0} / ${cart?.upsell_unit || 'unit'}`}
              </div>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-sm font-semibold text-gray-700" htmlFor="unlock-code">
                Enter Access Code
              </label>
              <input
                id="unlock-code"
                type="password"
                value={unlockCode}
                onChange={(e) => {
                  setUnlockCode(e.target.value);
                  setUnlockError('');
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                placeholder="Enter Access Code"
              />
              {unlockError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {unlockError}
                </p>
              )}
            </div>

            <button
              className="w-full bg-amber-600 text-white rounded-lg py-3 font-semibold shadow-lg hover:bg-amber-500 transition-all active:scale-95"
              onClick={handlePaywallUnlock}
            >
              Unlock
            </button>

            <p className="text-sm text-gray-500 text-center">Contact your host to book this vehicle.</p>
          </div>

        ) : isInspecting ? (
          
          /* STATE 1.5: WIZARD MODE */
          <InspectionWizard
            cartId={resolvedId!}
            onComplete={handleUnlock}
            revenue={cart?.upsell_price}
            depositAmount={cart?.deposit_amount ?? 0}
            hostPhone={cart?.hosts?.phone_number}
            assetType={cart?.type ?? 'cart'}
            showSupportLink={cart?.hosts?.enable_guest_text_support !== false}
            customPhotoRequired={cart?.custom_photo_required ?? false}
            customPhotoLabel={cart?.custom_photo_label ?? ''}
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

              {cart?.hosts?.welcome_message && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600 italic text-left">
                  "{cart.hosts.welcome_message}"
                </div>
              )}

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
