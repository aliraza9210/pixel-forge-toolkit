import { motion } from 'framer-motion';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="section-heading mb-3">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: October 2026</p>
        </motion.div>

        <div className="card-depth p-8">
          <Section title="1. Information We Collect">
            <p>When you use PixelForge, we collect information you provide directly (such as account registration data) and information generated through your use of our tools.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Account data:</strong> Name and email address when you create an account.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Usage data:</strong> Tool usage patterns, browser type, and general geographic region (country level). We do not collect IP addresses beyond what's necessary for rate limiting.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Uploaded files:</strong> Files you upload for processing are temporarily stored in secure environments solely for the purpose of completing your requested operation.</p>
          </Section>

          <Section title="2. File Processing and Retention">
            <p>All uploaded files are processed in isolated, temporary environments. Files are automatically and permanently deleted within 24 hours of upload for anonymous users, and within 7 days for registered users (Pro accounts).</p>
            <p>We do not analyze the contents of your files beyond what is required to perform the tool operation you requested. We do not use your file contents for training AI models.</p>
          </Section>

          <Section title="3. Cookies and Session Data">
            <p>We use strictly necessary cookies to maintain your authentication session when you are logged in. These are HttpOnly, Secure cookies and cannot be accessed by JavaScript.</p>
            <p>We do not use third-party advertising cookies or tracking pixels.</p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell, trade, or rent your personal data to third parties. We may share data with trusted service providers who assist in operating our platform, subject to strict confidentiality agreements.</p>
          </Section>

          <Section title="5. Security">
            <p>We implement industry-standard security measures including TLS encryption in transit, isolated processing environments, and access controls to protect your data.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@pixelforge.io. Registered users may also delete their account from the Settings page.</p>
          </Section>

          <Section title="7. Contact">
            <p>For privacy-related questions, contact us at <strong style={{ color: 'var(--text-primary)' }}>privacy@pixelforge.io</strong>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
