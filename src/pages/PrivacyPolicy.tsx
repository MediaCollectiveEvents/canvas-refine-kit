import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-script text-5xl md:text-7xl text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground font-body text-sm uppercase tracking-widest">
              Last Updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                1. Introduction
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                The Media Collective ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, register for our events, or interact with our services.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed">
                This policy complies with the General Data Protection Regulation (GDPR) (EU) 2016/679 and the UK GDPR. By using our services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>

            {/* Data Controller */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                2. Data Controller
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                The Media Collective is the data controller responsible for your personal data. If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-foreground font-body">
                  <strong>Email:</strong> privacy@themediacollective.com<br />
                  <strong>Address:</strong> The Media Collective, London, United Kingdom
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                3. Information We Collect
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We collect the following categories of personal data:
              </p>
              
              <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-3 mt-6">
                3.1 Information You Provide Directly
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2 mb-4">
                <li><strong>Identity Data:</strong> Full name, job title, company name</li>
                <li><strong>Contact Data:</strong> Email address, phone number, business address</li>
                <li><strong>Event Preferences:</strong> Events you wish to attend, sponsorship interests, speaking opportunities</li>
                <li><strong>Communications:</strong> Correspondence with us, feedback, and survey responses</li>
              </ul>

              <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-3 mt-6">
                3.2 Information Collected Automatically
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2">
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on site, navigation patterns</li>
                <li><strong>Cookie Data:</strong> Information collected through cookies and similar technologies (see our Cookie Policy)</li>
              </ul>
            </div>

            {/* Legal Basis */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                4. Legal Basis for Processing
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We process your personal data based on the following legal grounds under GDPR Article 6:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-3">
                <li>
                  <strong>Consent (Article 6(1)(a)):</strong> When you explicitly consent to receive marketing communications or register for events
                </li>
                <li>
                  <strong>Contract (Article 6(1)(b)):</strong> When processing is necessary to fulfill our contractual obligations, such as event registration
                </li>
                <li>
                  <strong>Legitimate Interests (Article 6(1)(f)):</strong> For business operations, improving our services, and networking facilitation, where such interests are not overridden by your rights
                </li>
                <li>
                  <strong>Legal Obligation (Article 6(1)(c)):</strong> When we are required to process data to comply with legal requirements
                </li>
              </ul>
            </div>

            {/* How We Use Your Data */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                5. How We Use Your Data
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2">
                <li>To process event registrations and manage your attendance</li>
                <li>To communicate about upcoming events, industry news, and opportunities</li>
                <li>To facilitate networking between members and attendees</li>
                <li>To process sponsorship and speaking inquiries</li>
                <li>To improve our website and services</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To send marketing communications (with your consent)</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                6. Data Sharing and Third Parties
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We do not sell your personal data. We may share your data with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2 mb-4">
                <li><strong>Event Venues:</strong> To facilitate event logistics and attendance management</li>
                <li><strong>Service Providers:</strong> Trusted third parties who assist with email delivery, website hosting, and analytics (under strict data processing agreements)</li>
                <li><strong>Event Sponsors:</strong> Only with your explicit consent and for networking purposes</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights</li>
              </ul>
              <p className="text-muted-foreground font-body leading-relaxed">
                All third-party processors are required to implement appropriate security measures and process data only on our instructions.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2">
                <li><strong>Event Registration Data:</strong> 3 years after the event date</li>
                <li><strong>Marketing Consent Records:</strong> Until consent is withdrawn, plus 1 year for audit purposes</li>
                <li><strong>Website Analytics:</strong> 26 months (anonymized data may be retained longer)</li>
                <li><strong>Correspondence:</strong> 3 years from last communication</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                8. Your Rights Under GDPR
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-3">
                <li>
                  <strong>Right of Access (Article 15):</strong> Request a copy of the personal data we hold about you
                </li>
                <li>
                  <strong>Right to Rectification (Article 16):</strong> Request correction of inaccurate or incomplete data
                </li>
                <li>
                  <strong>Right to Erasure (Article 17):</strong> Request deletion of your personal data ("right to be forgotten")
                </li>
                <li>
                  <strong>Right to Restriction (Article 18):</strong> Request limitation of processing in certain circumstances
                </li>
                <li>
                  <strong>Right to Data Portability (Article 20):</strong> Receive your data in a structured, machine-readable format
                </li>
                <li>
                  <strong>Right to Object (Article 21):</strong> Object to processing based on legitimate interests or for direct marketing
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time without affecting the lawfulness of prior processing
                </li>
              </ul>
              <p className="text-muted-foreground font-body leading-relaxed mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@themediacollective.com" className="text-primary hover:underline">privacy@themediacollective.com</a>. We will respond within 30 days.
              </p>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                Your data is primarily processed within the European Economic Area (EEA) and the United Kingdom. Where we transfer data outside these regions, we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission, or transfers to countries with an adequacy decision.
              </p>
            </div>

            {/* Security */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                10. Data Security
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-body space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication measures</li>
                <li>Staff training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                11. Cookies
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                Our website uses cookies to enhance your experience and analyze site usage. For detailed information about the cookies we use and how to manage your preferences, please see our Cookie Policy.
              </p>
            </div>

            {/* Children */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                12. Children's Privacy
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                Our services are not directed at individuals under 18 years of age. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child, we will take steps to delete it promptly.
              </p>
            </div>

            {/* Changes */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                13. Changes to This Policy
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on our website and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Complaints */}
            <div className="mb-12">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                14. Complaints
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                If you have concerns about how we handle your personal data, please contact us first at <a href="mailto:privacy@themediacollective.com" className="text-primary hover:underline">privacy@themediacollective.com</a>.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed">
                You also have the right to lodge a complaint with a supervisory authority. In the UK, this is the Information Commissioner's Office (ICO): <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a>
              </p>
            </div>

            {/* Contact */}
            <div className="bg-muted/50 p-8 rounded-lg">
              <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                For any questions or concerns about this Privacy Policy or your personal data, please contact:
              </p>
              <p className="text-foreground font-body">
                <strong>The Media Collective</strong><br />
                Email: <a href="mailto:privacy@themediacollective.com" className="text-primary hover:underline">privacy@themediacollective.com</a><br />
                London, United Kingdom
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
