import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-[hsl(217.9,10.6%,64.9%)] text-lg">
            Last updated: June 18, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">1. Information We Collect</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4">
                FreeFlow is designed with privacy in mind. We collect minimal information necessary to provide our services:
              </p>
              <ul className="list-disc list-inside text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li>Account information (username, email for authentication)</li>
                <li>Technical data (IP address, browser type, device information)</li>
                <li>Usage data (connection logs, feature usage statistics)</li>
                <li>Communications metadata (call duration, participant count - not content)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">2. Peer-to-Peer Architecture</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                Our peer-to-peer communication system ensures that your video calls and messages are transmitted directly 
                between participants. We do not store, record, or have access to the content of your communications. 
                Your conversations remain private between you and your intended recipients.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">3. How We Use Your Information</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4">
                We use collected information solely for:
              </p>
              <ul className="list-disc list-inside text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li>Providing and maintaining our communication services</li>
                <li>User authentication and account security</li>
                <li>Technical support and troubleshooting</li>
                <li>Service improvement and analytics (aggregated, non-personal data)</li>
                <li>Legal compliance when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">4. Data Storage and Security</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We implement industry-standard security measures to protect your data. Personal information is encrypted 
                in transit and at rest. We retain account information only as long as necessary to provide services or 
                as required by law. Communication content is never stored on our servers due to our P2P architecture.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">5. Third Party Services</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We use minimal third-party services for authentication (Clerk) and basic analytics. These services 
                have their own privacy policies and are selected based on their commitment to user privacy. 
                We do not sell or share personal information with advertisers or marketing companies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">6. Your Rights</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential data collection</li>
                <li>Data portability where technically feasible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">7. Cookies and Tracking</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We use essential cookies for authentication and basic functionality. We do not use tracking cookies 
                for advertising purposes. You can control cookie preferences through your browser settings, though 
                disabling essential cookies may impact service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">8. Children's Privacy</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                Our service is not intended for children under 13. We do not knowingly collect personal information 
                from children under 13. If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">9. Changes to Privacy Policy</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                We may update this privacy policy from time to time. We will notify users of significant changes 
                via email or service notifications. Continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] mb-4">10. Contact Us</h2>
              <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                For privacy-related questions or requests, contact us at:
                <br />
                Email: privacy@freeflow.com
                <br />
                Created by: Atharva Sagar and Akash
                <br />
                <br />
                We are committed to protecting your privacy and will respond to inquiries within 30 days.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
