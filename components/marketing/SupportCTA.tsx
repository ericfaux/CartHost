import Link from 'next/link';
import { Mail } from 'lucide-react';

export function SupportCTA() {
  return (
    <section id="support" className="border-t border-gray-200 bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
            Still have questions?
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We are currently in Private Beta. If you need help getting set up or have questions about the platform, reach out directly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="mailto:support@carthost.app"
              className="rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Log in to account <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
