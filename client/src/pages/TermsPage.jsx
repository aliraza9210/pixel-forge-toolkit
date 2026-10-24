import { motion } from 'framer-motion';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="section-heading mb-3">Terms of Service</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: October 2026</p>
        </motion.div>

        <div className="card-depth p-8">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using PixelForge, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>PixelForge provides web-based image and document processing tools. We reserve the right to modify, suspend, or discontinue any feature at any time with reasonable notice.</p>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to use PixelForge to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload content that violates intellectual property rights</li>
              <li>Upload content that is illegal, harmful, or offensive</li>
              <li>Attempt to circumvent rate limits or abuse the service</li>
              <li>Use automated tools to scrape or bulk-download content</li>
              <li>Interfere with the security or integrity of our systems</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            <p>You retain full ownership of any files you upload to PixelForge. By uploading, you grant us a limited, temporary license solely to process your files as instructed by you.</p>
            <p>The PixelForge name, logo, software, and interfaces are the intellectual property of PixelForge and may not be reproduced without written permission.</p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>PixelForge is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            <p>We strongly recommend maintaining your own backups of important files before processing them.</p>
          </Section>

          <Section title="6. Account Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.</p>
          </Section>

          <Section title="7. Changes to Terms">
            <p>We may update these terms from time to time. Continued use of PixelForge after changes constitutes acceptance of the new terms.</p>
          </Section>

          <Section title="8. Contact">
            <p>Questions about these terms: <strong style={{ color: 'var(--text-primary)' }}>legal@pixelforge.io</strong></p>
          </Section>
        </div>
      </div>
    </div>
  );
}
