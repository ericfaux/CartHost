"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfile } from "../app/dashboard/settings/actions";

export type HostProfile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  company_name: string | null;
  property_name: string | null;
  billing_address: string | null;
  [key: string]: unknown;
};

type SettingsFormProps = {
  profile: HostProfile;
};

type UpdateProfileState = { success?: boolean; error?: string } | null;

const DEFAULT_WAIVER_TEXT = `By operating this vehicle you acknowledge receipt of the safety briefing, agree to return the cart fully charged, and accept liability for damages during your rental window.

Always obey posted property rules, report any maintenance issues immediately, and ensure guests are listed on the waiver.`;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [state, formAction] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    null
  );

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">
            Profile &amp; Contact
          </h2>
          <p className="text-sm text-gray-500">
            Keep your contact information current so renters and support can
            reach you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              defaultValue={profile.full_name ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Jane Host"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={profile.phone_number ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              defaultValue={profile.company_name ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Sunset Rentals"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="propertyName"
              className="text-sm font-medium text-gray-700"
            >
              Property Name
            </label>
            <input
              id="propertyName"
              name="propertyName"
              type="text"
              defaultValue={profile.property_name ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Lakeside Villas"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="billingAddress"
            className="text-sm font-medium text-gray-700"
          >
            Billing Address
          </label>
          <textarea
            id="billingAddress"
            name="billingAddress"
            rows={3}
            autoComplete="street-address"
            defaultValue={profile.billing_address ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="123 Coastal Hwy, Palm Grove, FL 32901"
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {state?.success && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800"
              role="status"
            >
              Success! Your profile has been updated.
            </div>
          )}

          {state?.error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
              role="alert"
            >
              {state.error}
            </div>
          )}

          <div className="sm:ml-auto">
            <SubmitButton />
          </div>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Rental Configuration
            </h2>
            <p className="text-sm text-gray-500">
              Customize the default waiver riders acknowledge before unlocking a
              cart.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Custom Waivers coming soon to Pro
          </span>
        </div>
        <textarea
          value={DEFAULT_WAIVER_TEXT}
          disabled
          rows={6}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
          <p className="text-sm text-gray-500">
            Track plan limits and upgrade when you&apos;re ready to scale.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Current Plan</p>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Free Tier
            </span>
            <div className="text-sm text-gray-500">Usage: 0 / 1 Vehicles</div>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
