"use client";

import AddCartModal from "./AddCartModal";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
};

export default function FleetList({ carts }: { carts: Cart[] }) {
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
    </div>
  );
}
