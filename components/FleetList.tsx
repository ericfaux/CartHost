"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Edit2,
  Zap,
  Fuel,
  Bike,
  CarFront,
  Banknote,
  Lock,
  Shield,
} from "lucide-react";
import AddCartModal from "./AddCartModal";
import { deleteCart } from "../app/dashboard/actions";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
  last_serviced_at?: string | null;
  access_instructions?: string | null;
  type?: string | null;
  requires_lock_photo?: boolean | null;
  status: string;
  access_type: "included" | "upsell";
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
  deposit_amount?: number | null;
  is_currently_rented: boolean;
};

export default function FleetList({ carts }: { carts: Cart[] }) {
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (cart: Cart) => {
    setSelectedCart(cart);
    setIsEditOpen(true);
  };

  const handleDelete = async (cartId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this cart?");
    if (!confirmed) return;

    try {
      setDeletingId(cartId);
      await deleteCart(cartId);
    } catch (error) {
      console.error("Failed to delete cart", error);
      alert("Failed to delete cart. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Fleet</h1>
          <p className="text-sm text-gray-500">Manage your vehicles and access codes.</p>
        </div>
        
        {/* We pass a custom trigger button to the modal to make it look nice */}
        <AddCartModal 
          trigger={(open) => (
            <button
              onClick={open}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </button>
          )}
        />
      </div>

      {carts.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <CarFront className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No vehicles yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first golf cart.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {carts.map((cart) => {
            const iconWrapperClass =
              cart.type === "gas"
                ? "flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600"
                : cart.type === "bike"
                ? "flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600"
                : "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600";

            const cartIcon =
              cart.type === "gas" ? (
                <Fuel className="h-6 w-6" />
              ) : cart.type === "bike" ? (
                <Bike className="h-6 w-6" />
              ) : (
                <Zap className="h-6 w-6" />
              );

            const depositAmount =
              typeof cart.deposit_amount === "number" ? cart.deposit_amount : 0;
            const showDepositBadge = depositAmount > 0;
            const formattedDeposit = showDepositBadge
              ? depositAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : null;

            return (
              <div
                key={cart.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className={iconWrapperClass}>{cartIcon}</div>
                    <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(cart)}
                          className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                           <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cart.id)}
                          disabled={deletingId === cart.id}
                          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-gray-900 truncate">
                    {cart.name}
                  </h3>
                  {cart.access_type === "upsell" && cart.upsell_price !== null && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      <Banknote className="h-3.5 w-3.5" />
                      <span>
                        ${cart.upsell_price}
                        {cart.upsell_unit ? ` / ${cart.upsell_unit}` : ""}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      borderColor:
                        cart.status === "inactive"
                          ? "#e5e7eb"
                          : cart.is_currently_rented
                          ? "#bfdbfe"
                          : "#bbf7d0",
                      backgroundColor:
                        cart.status === "inactive"
                          ? "#f9fafb"
                          : cart.is_currently_rented
                          ? "#eff6ff"
                          : "#f0fdf4",
                      color:
                        cart.status === "inactive"
                          ? "#4b5563"
                          : cart.is_currently_rented
                          ? "#1d4ed8"
                          : "#15803d",
                    }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          cart.status === "inactive"
                            ? "#9ca3af"
                            : cart.is_currently_rented
                            ? "#3b82f6"
                            : "#22c55e",
                      }}
                    />
                    {cart.status === "inactive"
                      ? "Inactive"
                      : cart.is_currently_rented
                      ? "Active: In Use"
                      : "Active: Not in Use"}
                  </div>
                  {showDepositBadge && formattedDeposit && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <Shield className="h-3.5 w-3.5 text-slate-600" />
                      <span>{`Dep: $${formattedDeposit}`}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {(cart.key_code || cart.access_code) && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                      <div className="flex flex-col gap-2 text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                        {cart.key_code && (
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            <div className="flex flex-col text-xs font-semibold uppercase tracking-wider text-gray-600">
                              <span>Key Code</span>
                              <span className="font-mono text-base normal-case text-gray-900">{cart.key_code}</span>
                            </div>
                          </div>
                        )}
                        {cart.access_code && (
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <div className="flex flex-col text-xs font-semibold uppercase tracking-wider text-gray-600">
                              <span>Access Code</span>
                              <span className="font-mono text-base normal-case text-gray-900">{cart.access_code}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Last Service:{" "}
                    {cart.last_serviced_at
                      ? new Date(cart.last_serviced_at).toLocaleDateString()
                      : "Not recorded"}
                  </p>
                  {cart.access_instructions && (
                    <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700 border border-gray-100">
                      {cart.access_instructions}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal (Hidden Logic) */}
      <AddCartModal
        cart={selectedCart}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedCart(null);
        }}
        showTrigger={false}
      />
    </div>
  );
}
