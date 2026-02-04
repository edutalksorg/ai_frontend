import React from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <LegalLayout title="Privacy Policy">
            <p>Effective Date: February 04, 2026</p>

            <p>
                At EduTalks, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our English learning platform.
            </p>

            <h3>1. Information We Collect</h3>
            <ul>
                <li><strong>Personal Information:</strong> Name, email address, password, and profile picture provided during registration.</li>
                <li><strong>Educational Data:</strong> Performance in quizzes, topics studied, and progress metrics.</li>
                <li><strong>Voice Data:</strong> Audio recordings you submit for AI-powered pronunciation analysis.</li>
                <li><strong>Communication Data:</strong> Data related to your participation in Voice Rooms and peer-to-peer calls (call timestamps, participants).</li>
                <li><strong>Payment Information:</strong> Transaction details processed through Razorpay. We do not store full credit card numbers on our servers.</li>
                <li><strong>Network Data:</strong> Referral codes used and your list of connected friends.</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <ul>
                <li>To provide and maintain our services, including AI pronunciation feedback.</li>
                <li>To process your subscriptions and payments securely via Razorpay.</li>
                <li>To facilitate real-time voice communications between users using Agora and Socket.io.</li>
                <li>To analyze app usage and improve our learning algorithms.</li>
                <li>To send you essential account updates and promotional newsletters (with your consent).</li>
            </ul>

            <h3>3. Sharing Your Information</h3>
            <p>
                We do not sell your personal data. We share information with trusted service providers only as necessary:
            </p>
            <ul>
                <li><strong>Razorpay:</strong> For secure payment processing.</li>
                <li><strong>Agora:</strong> For real-time voice calling infrastructure.</li>
                <li><strong>Socket.io:</strong> For real-time signaling and notifications.</li>
            </ul>

            <h3>4. Data Security</h3>
            <p>
                We use industry-standard encryption (SSL/TLS) and secure database practices to protect your information. Your data is stored on secure servers with restricted access.
            </p>

            <h3>5. Your Rights</h3>
            <p>
                You can update your profile, change your password, and request account deletion at any time through your settings page. You may also contact us to request a copy of your personal data.
            </p>

            <h3>6. Children's Privacy</h3>
            <p>
                EduTalks is designed for users aged 13 and above. If we discover we have collected data from a child under 13 without parental consent, we will delete it immediately.
            </p>

            <h3>7. Changes to This Policy</h3>
            <p>
                We may update this policy periodically to reflect changes in our practices or for legal reasons. Your continued use of the platform after changes signifies your acceptance.
            </p>

            <hr className="border-slate-800 my-12" />

            <p className="text-sm">
                If you have any questions about this Privacy Policy, please contact us at: <br />
                <span className="text-blue-400">privacy@edutalks.com</span>
            </p>
        </LegalLayout>
    );
};

export default PrivacyPolicyPage;
