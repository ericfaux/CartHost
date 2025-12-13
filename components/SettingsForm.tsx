"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfile } from "../app/dashboard/settings/actions";
import { BikeWaiver, GolfCartWaiver } from "./WaiverContent";

export type HostProfile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  company_name: string | null;
  property_name: string | null;
  billing_address: string | null;
  default_deposit: number | null;
  welcome_message: string | null;
  additional_rules: string | null;
  enable_guest_text_support: boolean | null;
  show_financial_tiles: boolean | null;
  enable_sms_notifications: boolean | null;
  [key: string]: unknown;
};

type SettingsFormProps = {
  profile: HostProfile;
};

type UpdateProfileState = { success?: boolean; error?: string } | null;

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

  const [waiverPreview, setWaiverPreview] = useState<"golf_cart" | "bike">(
    "golf_cart"
  );
  const [additionalRules, setAdditionalRules] = useState<string>(
    profile.additional_rules ?? ""
  );

  const propertyNameForPreview = useMemo(() => {
    const name = profile.property_name?.trim();
    return name && name.length > 0 ? name : "Your Property";
  }, [profile.property_name]);

  const additionalRulesPreview = useMemo(() => {
    const trimmed = additionalRules.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [additionalRules]);

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

          <div className="space-y-2">
            <label
              htmlFor="defaultDeposit"
              className="text-sm font-medium text-gray-700"
            >
              Default Security Deposit ($)
            </label>
            <input
              id="defaultDeposit"
              name="defaultDeposit"
              type="number"
              defaultValue={profile.default_deposit ?? 0}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="0"
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

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Rental Configuration
              </h2>
              <p className="text-sm text-gray-500">
                Customize what guests see before they agree to the legal waiver.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Custom Waivers coming soon to Pro
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="welcomeMessage"
                  className="text-sm font-medium text-gray-700"
                >
                  Guest Welcome Message (Optional)
                </label>
                <input
                  id="welcomeMessage"
                  name="welcomeMessage"
                  type="text"
                  maxLength={100}
                  defaultValue={profile.welcome_message ?? ""}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Have a great stay at Sunset Villa!"
                />
                <p className="text-xs text-gray-500">
                  Displayed on the first screen when a guest scans the cart.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="additionalRules"
                  className="text-sm font-medium text-gray-700"
                >
                  Additional Rules &amp; Instructions (Optional)
                </label>
                <textarea
                  id="additionalRules"
                  name="additionalRules"
                  rows={4}
                  value={additionalRules}
                  onChange={(e) => setAdditionalRules(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Please park in the driveway only..."
                />
                <p className="text-xs text-gray-500">
                  Property-specific rules (e.g., parking, quiet hours). These
                  appear above the legal waiver.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-700">
                    Read-only waiver preview
                  </p>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setWaiverPreview("golf_cart")}
                      className={[
                        "rounded-md px-3 py-1 text-xs font-semibold transition",
                        waiverPreview === "golf_cart"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      Golf Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiverPreview("bike")}
                      className={[
                        "rounded-md px-3 py-1 text-xs font-semibold transition",
                        waiverPreview === "bike"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      Bike
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {waiverPreview === "golf_cart" ? (
                    <GolfCartWaiver />
                  ) : (
                    <BikeWaiver />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Guest Preview</p>
              <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-gray-100" />

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Welcome
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      Welcome to {propertyNameForPreview}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-yellow-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        Host Rules
                      </p>
                      <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Shows above waiver
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-800">
                      {additionalRulesPreview ?? (
                        <span className="text-gray-500">
                          e.g. Please park in the driveway only...
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        Legal Waiver
                      </p>
                      <span className="text-xs font-semibold text-gray-500">
                        Standard CartHost Waiver
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      (Tap to read full text)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    I Agree
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Preview is illustrative; guests will see your saved content.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Feature Configuration
              </h2>
              <p className="text-sm text-gray-500">
                Enable or disable the experiences your guests and team see.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="enableGuestTextSupport"
                defaultChecked={profile.enable_guest_text_support ?? true}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Guest Support Link</p>
                <p className="text-sm text-gray-500">
                  Show a 'Text Host' link in the guest app for issues.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="showFinancialTiles"
                defaultChecked={profile.show_financial_tiles ?? true}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Financial Dashboard</p>
                <p className="text-sm text-gray-500">
                  Show revenue, ride counts, and charts on the home page.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="enableSmsNotifications"
                defaultChecked={profile.enable_sms_notifications ?? true}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Guest SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Send automated text messages to guests (Welcome &amp; Return).
                </p>
              </div>
            </label>
          </div>
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
