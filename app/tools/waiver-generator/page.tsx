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
import {
  getWaiverContent,
  getWaiverDisplayName,
  type AssetType,
  type WaiverSection,
} from "@/lib/waiverText";

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

const ASSET_TYPES = [
  { value: "", label: "Select an asset type" },
  { value: "golf_cart", label: "Golf Cart" },
  { value: "bike", label: "Bicycle / E-Bike" },
  { value: "hot_tub", label: "Hot Tub" },
];

export default function WaiverGeneratorPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [hostName, setHostName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [state, setState] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "">("");

  const openBetaModal = () => setIsBetaModalOpen(true);
  const closeBetaModal = () => setIsBetaModalOpen(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Fake delay to make it feel like work is happening
    await new Promise((resolve) => setTimeout(resolve, 800));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Get the waiver content based on asset type
    const selectedAssetType = assetType || "golf_cart";
    const waiverContent = getWaiverContent(selectedAssetType as AssetType);
    const assetDisplayName = getWaiverDisplayName(selectedAssetType as AssetType);

    // Helper function to check page break
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Helper function to add wrapped text
    const addWrappedText = (
      text: string,
      fontSize: number,
      isBold = false,
      indent = 0
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      const lineHeight = fontSize * 0.4;
      checkPageBreak(lines.length * lineHeight + 4);
      doc.text(lines, margin + indent, yPos);
      yPos += lines.length * lineHeight + 4;
    };

    // Helper function to add bullet points
    const addBulletPoints = (bullets: string[], fontSize: number, indent = 5) => {
      bullets.forEach((bullet) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "normal");
        const bulletText = `• ${bullet}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - indent);
        const lineHeight = fontSize * 0.4;
        checkPageBreak(lines.length * lineHeight + 2);
        doc.text(lines, margin + indent, yPos);
        yPos += lines.length * lineHeight + 2;
      });
    };

    // Helper function to render a section
    const renderSection = (section: WaiverSection) => {
      // Section title
      addWrappedText(section.title, 11, true);

      // Section content
      if (section.content) {
        addWrappedText(section.content, 10, false);
      }

      // Bullet points
      if (section.bullets && section.bullets.length > 0) {
        addBulletPoints(section.bullets, 10);
      }

      // Subsections (for bike waiver rules of operation)
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          yPos += 2;
          addWrappedText(subsection.title, 10, true, 5);
          addBulletPoints(subsection.bullets, 10, 10);
        });
      }

      yPos += 4;
    };

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(waiverContent.title, contentWidth);
    doc.text(titleLines, pageWidth / 2, yPos, { align: "center" });
    yPos += titleLines.length * 6 + 10;

    // Intro paragraph
    addWrappedText(waiverContent.intro, 10, false);

    // Additional intro (for bike waiver)
    if (waiverContent.additionalIntro) {
      addWrappedText(waiverContent.additionalIntro, 10, false);
    }

    yPos += 4;

    // Render all sections
    waiverContent.sections.forEach((section) => {
      renderSection(section);
    });

    // Add governing law section with state
    const stateDisplay = state || "[State]";
    yPos += 4;
    addWrappedText("GOVERNING LAW", 11, true);
    addWrappedText(
      `This agreement shall be governed by and construed in accordance with the laws of the state of ${stateDisplay}. Any dispute arising under this agreement shall be resolved in the courts of ${stateDisplay}.`,
      10
    );

    yPos += 8;

    // Signature lines
    checkPageBreak(50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text("Renter Signature: _______________________________", margin, yPos);
    yPos += 10;

    doc.text("Print Name: _______________________________", margin, yPos);
    yPos += 10;

    doc.text("Date: _______________________________", margin, yPos);

    // Save the PDF
    const fileName = assetType
      ? `${assetDisplayName.replace(/[\s\/]+/g, "_")}_Waiver.pdf`
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
              Free Rental Waiver Generator
            </h1>
            <p className="text-lg text-ink-subtle max-w-2xl mx-auto">
              Generate a professional liability waiver for your golf cart, bike,
              or hot tub rental in seconds. Fill in your details below and
              download your PDF.
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
                  label="Asset Type"
                  name="assetType"
                  options={ASSET_TYPES}
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as AssetType | "")}
                  hint="Type of rental asset"
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
