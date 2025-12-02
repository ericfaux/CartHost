import { Lock } from "lucide-react";

export default function RentalInspectionPage() {
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
          <h2 className="text-lg font-semibold">Cart: Test Cart 1</h2>
        </div>
        <button className="w-full bg-black text-white rounded-lg py-3 font-semibold">
          Start Inspection
        </button>
      </div>
    </main>
  );
}
