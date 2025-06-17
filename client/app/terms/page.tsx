import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(224,71.4%,4.1%)]">
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)] mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Terms & Conditions
          </h1>
          <p className="text-[hsl(217.9,10.6%,64.9%)] text-lg">
            Last updated: June 18, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                By accessing and using FreeFlow, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">2. Service Description</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                FreeFlow provides peer-to-peer communication services including video calls, text chat, and group communication. 
                Our services are provided "as is" and we reserve the right to modify or discontinue the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li>You must be at least 13 years old to use this service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to use the service for illegal or unauthorized purposes</li>
                <li>You will not transmit harmful, offensive, or inappropriate content</li>
                <li>You will respect other users' privacy and rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">4. Privacy and Data</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We are committed to protecting your privacy. Our peer-to-peer architecture ensures that your communications 
                are direct between users. Please refer to our Privacy Policy for detailed information about data handling.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">5. Limitation of Liability</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                FreeFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">6. Termination</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice, 
                for conduct that we believe violates these Terms of Service or is harmful to other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">7. Changes to Terms</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or through the service. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">8. Contact Information</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
                <br />
                Email: legal@freeflow.com
                <br />
                Created by: Atharva Sagar and Akash
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
