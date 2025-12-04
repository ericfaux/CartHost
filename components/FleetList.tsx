"use client";

import { useState } from "react";
import AddCartModal from "./AddCartModal";
import { deleteCart } from "../app/dashboard/actions";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fleet</h1>
          <p className="text-sm text-gray-500">Manage your carts and monitor their status.</p>
        </div>
        <AddCartModal />
      </div>

      {carts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
          No carts yet. Add your first cart to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {carts.map((cart) => {
            return (
              <div
                key={cart.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Cart</p>
                    <h3 className="text-lg font-semibold text-gray-900">{cart.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(cart)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                      aria-label={`Edit ${cart.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687 1.687c.55.55.55 1.44 0 1.99l-8.25 8.25-3.181.707.707-3.181 8.25-8.25c.55-.55 1.44-.55 1.99 0z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cart.id)}
                      disabled={deletingId === cart.id}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Delete ${cart.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 7.5h10.5M9.75 7.5v9a.75.75 0 001.5 0v-9m3 0v9a.75.75 0 001.5 0v-9m-7.5 0h10.5m-9-1.5h7.5l-.75-1.5h-6l-.75 1.5z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Key Code</span>
                    <span className="font-mono text-sm font-bold text-gray-900">{cart.key_code || "----"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddCartModal
        cart={selectedCart}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedCart(null);
          }
        }}
        showTrigger={false}
      />
    </div>
  );
}
