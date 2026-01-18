"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import {
  MarketingNav,
  BetaAccessModal,
  ToolUpsell,
  Footer,
} from "@/components/marketing";

const US_STATES = [
  { value: "", label: "Select a state" },
  { value: "Alabama", label: "Alabama" },
  { value: "Alaska", label: "Alaska" },
  { value: "Arizona", label: "Arizona" },
  { value: "Arkansas", label: "Arkansas" },
  { value: "California", label: "California" },
  { value: "Colorado", label: "Colorado" },
  { value: "Connecticut", label: "Connecticut" },
  { value: "Delaware", label: "Delaware" },
  { value: "Florida", label: "Florida" },
  { value: "Georgia", label: "Georgia" },
  { value: "Hawaii", label: "Hawaii" },
  { value: "Idaho", label: "Idaho" },
  { value: "Illinois", label: "Illinois" },
  { value: "Indiana", label: "Indiana" },
  { value: "Iowa", label: "Iowa" },
  { value: "Kansas", label: "Kansas" },
  { value: "Kentucky", label: "Kentucky" },
  { value: "Louisiana", label: "Louisiana" },
  { value: "Maine", label: "Maine" },
  { value: "Maryland", label: "Maryland" },
  { value: "Massachusetts", label: "Massachusetts" },
  { value: "Michigan", label: "Michigan" },
  { value: "Minnesota", label: "Minnesota" },
  { value: "Mississippi", label: "Mississippi" },
  { value: "Missouri", label: "Missouri" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "Nevada", label: "Nevada" },
  { value: "New Hampshire", label: "New Hampshire" },
  { value: "New Jersey", label: "New Jersey" },
  { value: "New Mexico", label: "New Mexico" },
  { value: "New York", label: "New York" },
  { value: "North Carolina", label: "North Carolina" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Ohio", label: "Ohio" },
  { value: "Oklahoma", label: "Oklahoma" },
  { value: "Oregon", label: "Oregon" },
  { value: "Pennsylvania", label: "Pennsylvania" },
  { value: "Rhode Island", label: "Rhode Island" },
  { value: "South Carolina", label: "South Carolina" },
  { value: "South Dakota", label: "South Dakota" },
  { value: "Tennessee", label: "Tennessee" },
  { value: "Texas", label: "Texas" },
  { value: "Utah", label: "Utah" },
  { value: "Vermont", label: "Vermont" },
  { value: "Virginia", label: "Virginia" },
  { value: "Washington", label: "Washington" },
  { value: "West Virginia", label: "West Virginia" },
  { value: "Wisconsin", label: "Wisconsin" },
  { value: "Wyoming", label: "Wyoming" },
];

const VEHICLE_TYPES = [
  { value: "", label: "Select a vehicle type" },
  { value: "Golf Cart", label: "Golf Cart" },
  { value: "E-Bike", label: "E-Bike" },
  { value: "Scooter", label: "Scooter" },
  { value: "ATV", label: "ATV" },
  { value: "UTV", label: "UTV" },
];

export default function WaiverGeneratorPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [hostName, setHostName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [state, setState] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Fake delay to make it feel like work is happening
    await new Promise((resolve) => setTimeout(resolve, 800));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * (fontSize * 0.4) + 4;
    };

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RENTAL LIABILITY WAIVER & RELEASE", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    // Dynamic legal text
    const hostDisplay = companyName || hostName || "[Host Name/Company]";
    const vehicleDisplay = vehicleType || "[Vehicle Type]";
    const stateDisplay = state || "[State]";

    addWrappedText(
      `1. AGREEMENT: This agreement is between ${hostDisplay} ("Owner") and Guest ("Renter") for the rental of a ${vehicleDisplay} in the state of ${stateDisplay}. By signing below, Renter acknowledges that they have read, understood, and agree to be bound by the terms and conditions set forth in this waiver.`,
      11
    );
    yPos += 4;

    // Assumption of Risk
    addWrappedText("2. ASSUMPTION OF RISK", 12, true);
    addWrappedText(
      `Renter acknowledges that operating a ${vehicleDisplay} involves inherent risks, including but not limited to: collision with other vehicles, pedestrians, or objects; loss of control; mechanical failure; adverse weather conditions; and uneven or hazardous terrain. Renter voluntarily assumes all risks associated with the operation of the rented vehicle, whether known or unknown, and accepts full responsibility for any injury, death, or property damage that may result.`,
      11
    );
    yPos += 4;

    // Vehicle Condition
    addWrappedText("3. VEHICLE CONDITION", 12, true);
    addWrappedText(
      `Renter acknowledges that they have inspected the ${vehicleDisplay} prior to rental and found it to be in satisfactory and safe operating condition. Renter agrees to report any defects, damage, or mechanical issues immediately to Owner. Renter accepts the vehicle "as-is" and agrees to return it in the same condition, normal wear and tear excepted. Renter shall be responsible for any damage to the vehicle during the rental period, excluding normal wear and tear.`,
      11
    );
    yPos += 4;

    // Release of Liability
    addWrappedText("4. RELEASE OF LIABILITY", 12, true);
    addWrappedText(
      `In consideration of being permitted to rent and operate the ${vehicleDisplay}, Renter hereby releases, waives, discharges, and covenants not to sue ${hostDisplay}, its owners, officers, employees, agents, and affiliates from any and all liability, claims, demands, actions, or causes of action whatsoever arising out of or relating to any loss, damage, or injury, including death, that may be sustained by Renter or any property belonging to Renter, while participating in this rental activity, regardless of whether caused by the negligence of the released parties or otherwise.`,
      11
    );
    yPos += 4;

    // Governing Law
    addWrappedText("5. GOVERNING LAW", 12, true);
    addWrappedText(
      `This agreement shall be governed by and construed in accordance with the laws of the state of ${stateDisplay}. Any dispute arising under this agreement shall be resolved in the courts of ${stateDisplay}.`,
      11
    );
    yPos += 8;

    // Acknowledgment
    addWrappedText(
      "By signing below, Renter acknowledges that they have read this waiver in its entirety, understand its contents, and agree to be bound by its terms.",
      11
    );
    yPos += 12;

    // Signature lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text("Renter Signature: _______________________________", margin, yPos);
    yPos += 10;

    doc.text("Print Name: _______________________________", margin, yPos);
    yPos += 10;

    doc.text("Date: _______________________________", margin, yPos);

    // Save the PDF
    const fileName = vehicleType
      ? `${vehicleType.replace(/\s+/g, "_")}_Waiver.pdf`
      : "Rental_Waiver.pdf";
    doc.save(fileName);

    setIsGenerating(false);
  };

  const isFormValid = hostName || companyName;

  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav onRequestAccess={openBetaModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-4">
              Free Golf Cart Waiver Generator
            </h1>
            <p className="text-lg text-ink-subtle max-w-2xl mx-auto">
              Generate a professional liability waiver for your rental business
              in seconds. Fill in your details below and download your PDF.
            </p>
          </div>

          {/* Form Card */}
          <div className="max-w-xl mx-auto">
            <div className="bg-surface rounded-dossier-surface border border-rule shadow-dossier-surface p-6 sm:p-8">
              <div className="space-y-5">
                <Input
                  label="Host Name"
                  name="hostName"
                  placeholder="John Smith"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  hint="Your name as the rental operator"
                />

                <Input
                  label="Company Name"
                  name="companyName"
                  placeholder="Beach Carts LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  hint="Optional - will be used instead of host name if provided"
                />

                <Select
                  label="State"
                  name="state"
                  options={US_STATES}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  hint="Where your rental business operates"
                />

                <Select
                  label="Vehicle Type"
                  name="vehicleType"
                  options={VEHICLE_TYPES}
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  hint="Type of vehicle being rented"
                />

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!isFormValid}
                  >
                    {isGenerating ? "Generating..." : "Download PDF"}
                  </Button>
                  {!isFormValid && (
                    <p className="text-sm text-ink-muted mt-2 text-center">
                      Please enter a host name or company name to generate your
                      waiver.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ToolUpsell Section */}
      <section className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ToolUpsell variant="waiver" onRequestAccess={openBetaModal} />
        </div>
      </section>

      <Footer />

      <BetaAccessModal isOpen={isBetaModalOpen} onClose={closeBetaModal} />
    </div>
  );
}
