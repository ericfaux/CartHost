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
  Bath,
  CarFront,
  Banknote,
  Lock,
  Shield,
  QrCode,
  Square,
  Activity,
} from "lucide-react";
import AddCartModal from "./AddCartModal";
import { deleteCart, forceEndRental } from "../app/dashboard/actions";
import QrCodeModal from "./QrCodeModal";
import { PageHeader } from "./ui/Panel";
import { Button, IconButton } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { HealthIndicator, ServiceMeter } from "./ui/Meters";
import { EmptyState } from "./ui/EmptyState";
import { useTour } from "../app/dashboard/tour-context";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
  last_serviced_at?: string | null;
  access_instructions?: string | null;
  type?: string | null;
  requires_lock_photo?: boolean | null;
  requires_plug_photo?: boolean | null;
  status: string;
  access_type: "included" | "upsell";
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
  deposit_amount?: number | null;
  is_currently_rented: boolean;
  active_rental_id?: string | null;
  tripsSinceService: number;
  photo_requirements?: string[] | null;
  custom_photo_required?: boolean | null;
  custom_photo_label?: string | null;
};

export default function FleetList({ carts }: { carts: Cart[] }) {
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [qrAsset, setQrAsset] = useState<Cart | null>(null);

  // Tour context for QR button highlighting
  const { isOpen: isTourOpen, currentStepData } = useTour();
  const isQrStepActive = isTourOpen && currentStepData?.id === "qr-button";

  const handleEdit = (cart: Cart) => {
    setSelectedCart(cart);
    setIsEditOpen(true);
  };

  const handleForceEnd = async (rentalId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to manually end this guest session? This will mark the rental as completed."
    );
    if (!confirmed) return;

    try {
      setEndingId(rentalId);
      const result = await forceEndRental(rentalId);
      if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to end rental", error);
      alert("Failed to end rental. Please try again.");
    } finally {
      setEndingId(null);
    }
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

  const getCartTypeConfig = (type?: string | null) => {
    switch (type) {
      case "gas":
        return { icon: Fuel, bg: "bg-accent-warning/10", color: "text-accent-warning" };
      case "bike":
        return { icon: Bike, bg: "bg-purple-50", color: "text-purple-600" };
      case "hot_tub":
        return { icon: Bath, bg: "bg-cyan-50", color: "text-cyan-600" };
      default:
        return { icon: Zap, bg: "bg-accent-info/10", color: "text-accent-info" };
    }
  };

  const getHealthStatus = (trips: number): "healthy" | "due_soon" | "overdue" => {
    if (trips >= 30) return "overdue";
    if (trips >= 20) return "due_soon";
    return "healthy";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Fleet"
        subtitle="Manage your vehicles, access codes, and track status"
        actions={
          <AddCartModal
            trigger={(open) => (
              <Button variant="primary" onClick={open} icon={<Plus className="h-4 w-4" />}>
                Add Asset
              </Button>
            )}
          />
        }
      />

      {carts.length === 0 ? (
        <EmptyState
          icon={<CarFront className="h-6 w-6" />}
          title="No vehicles yet"
          description="Get started by adding your first golf cart, e-bike, or other rentable asset."
          action={
            <AddCartModal
              trigger={(open) => (
                <Button variant="ops" onClick={open} icon={<Plus className="h-4 w-4" />}>
                  Add Your First Asset
                </Button>
              )}
            />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {carts.map((cart, index) => {
            const typeConfig = getCartTypeConfig(cart.type);
            const TypeIcon = typeConfig.icon;
            const tripsCount = typeof cart.tripsSinceService === "number" ? cart.tripsSinceService : 0;
            const healthStatus = getHealthStatus(tripsCount);

            const depositAmount = typeof cart.deposit_amount === "number" ? cart.deposit_amount : 0;
            const showDepositBadge = depositAmount > 0;
            const formattedDeposit = showDepositBadge
              ? depositAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : null;

            // Highlight the QR button only on the first card during the tour step
            const shouldHighlightQr = isQrStepActive && index === 0;

            return (
              <div
                key={cart.id}
                className="group dossier-panel p-5 flex flex-col transition-all hover:shadow-dossier-elevated"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-dossier-control ${typeConfig.bg}`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                  </div>
                  <div className={`flex gap-0.5 transition-opacity ${shouldHighlightQr ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <IconButton
                      icon={<QrCode className="h-4 w-4" />}
                      label="Generate QR Code"
                      onClick={() => setQrAsset(cart)}
                      className={shouldHighlightQr ? "ring-2 ring-accent-ops ring-offset-2 animate-pulse" : ""}
                      data-tour={shouldHighlightQr ? "tour-qr-button" : undefined}
                    />
                    <IconButton
                      icon={<Edit2 className="h-4 w-4" />}
                      label="Edit"
                      onClick={() => handleEdit(cart)}
                    />
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete"
                      variant="danger"
                      onClick={() => handleDelete(cart.id)}
                      disabled={deletingId === cart.id}
                    />
                  </div>
                </div>

                {/* Name & Status */}
                <h3 className="mt-4 font-heading text-lg font-bold text-ink truncate">
                  {cart.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {cart.status === "inactive" ? (
                    <Badge variant="neutral">Inactive</Badge>
                  ) : cart.is_currently_rented ? (
                    <Badge variant="active" pulse>In Use</Badge>
                  ) : (
                    <Badge variant="success">Available</Badge>
                  )}

                  {/* Upsell Price */}
                  {cart.access_type === "upsell" && cart.upsell_price !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-dossier-chip bg-accent-success/10 text-accent-success text-xs font-semibold">
                      <Banknote className="h-3 w-3" />
                      ${cart.upsell_price}
                      {cart.upsell_unit ? ` / ${cart.upsell_unit}` : ""}
                    </span>
                  )}

                  {/* Deposit Badge */}
                  {showDepositBadge && formattedDeposit && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-dossier-chip bg-ink/5 text-ink-subtle text-xs font-semibold">
                      <Shield className="h-3 w-3" />
                      ${formattedDeposit}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 flex-1 space-y-3">
                  {/* Force End Button */}
                  {cart.is_currently_rented && cart.active_rental_id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleForceEnd(cart.active_rental_id!)}
                      disabled={endingId === cart.active_rental_id}
                      loading={endingId === cart.active_rental_id}
                      icon={<Square className="h-3.5 w-3.5 fill-current" />}
                    >
                      Manually End Session
                    </Button>
                  )}

                  {/* Access Codes */}
                  {(cart.key_code || cart.access_code) && (
                    <div className="flex flex-wrap gap-3 p-3 bg-paper rounded-dossier-control border border-rule">
                      {cart.key_code && (
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-ink-muted" />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Key</p>
                            <p className="font-mono text-sm font-semibold text-ink">{cart.key_code}</p>
                          </div>
                        </div>
                      )}
                      {cart.access_code && (
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-ink-muted" />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Lock</p>
                            <p className="font-mono text-sm font-semibold text-ink">{cart.access_code}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Access Instructions */}
                  {cart.access_instructions && (
                    <div className="p-3 bg-paper rounded-dossier-control border border-rule">
                      <p className="text-xs text-ink-subtle">{cart.access_instructions}</p>
                    </div>
                  )}
                </div>

                {/* Footer - Service Info */}
                <div className="mt-4 pt-4 border-t border-rule">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                      Service Status
                    </span>
                    <HealthIndicator status={healthStatus} />
                  </div>
                  <ServiceMeter current={tripsCount} threshold={30} showStatus={false} />
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      Last: {cart.last_serviced_at
                        ? new Date(cart.last_serviced_at).toLocaleDateString()
                        : "Never"}
                    </span>
                    <span className="font-mono">{tripsCount}/30 trips</span>
                  </div>
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
      <QrCodeModal
        isOpen={!!qrAsset}
        onClose={() => setQrAsset(null)}
        assetId={qrAsset?.id ?? ""}
        assetName={qrAsset?.name ?? ""}
      />
    </div>
  );
}
