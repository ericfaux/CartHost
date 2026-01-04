import { MarketingNav, Footer } from "../../components/marketing";
import { Badge } from "../../components/ui/Badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <MarketingNav />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Badge variant="neutral" className="mb-4">Data Protocol</Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink mb-4">
              Privacy Policy
            </h1>
            <p className="text-ink-subtle font-mono text-sm">
              Last Updated: January 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-ink-subtle">
            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">1. Data We Collect</h2>
              <p className="mb-4">
                CartHost acts as a data processor for Hosts and a data controller for account information. We collect:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Account Data:</strong> Name, email, and property details for Hosts.</li>
                <li><strong>Guest Data:</strong> Names, signatures, and device metadata (IP address, User Agent) collected via waivers.</li>
                <li><strong>Evidence Data:</strong> Photos, timestamps, and geolocation data uploaded during inspections.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">2. How We Use Your Data</h2>
              <p className="mb-4">
                Your data is used strictly to provide the Service, specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Generating "Evidence Packets" for liability protection.</li>
                <li>Authenticating users and managing fleet access.</li>
                <li>Improving the security and functionality of the platform.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">3. Data Retention & Evidence</h2>
              <p className="mb-4">
                Because CartHost is a liability protection tool, we retain rental records, waivers, and photos ("Evidence") for a period determined by the Host's subscription plan or until account deletion, to ensuring you have access to records in case of future disputes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">4. Third-Party Sharing</h2>
              <p className="mb-4">
                We do not sell your data. We share data only with essential infrastructure providers (e.g., Supabase for database hosting, Vercel for hosting) required to operate the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">5. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this privacy policy or your data rights, please contact us at support@carthost.app.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
