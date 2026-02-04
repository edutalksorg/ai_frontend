import React from 'react';
import LegalLayout from './LegalLayout';

const TermsPage: React.FC = () => {
    return (
        <LegalLayout title="Terms and Conditions">
            <p>Last Updated: February 04, 2026</p>

            <p>
                Welcome to EduTalks. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>

            <h3>1. Use of Services</h3>
            <ul>
                <li>You must be at least 13 years old to use EduTalks.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to use the platform only for lawful educational purposes.</li>
            </ul>

            <h3>2. User Conduct in Voice Rooms</h3>
            <ul>
                <li>Harassment, hate speech, or inappropriate behavior in Voice Rooms or peer-to-peer calls is strictly prohibited.</li>
                <li>Recording calls without the explicit consent of all participants is forbidden.</li>
                <li>We reserve the right to suspend or terminate accounts that violate our community standards.</li>
            </ul>

            <h3>3. Intellectual Property</h3>
            <ul>
                <li>All content provided by EduTalks (lessons, quizzes, AI algorithms, texts) is the property of EduTalks.</li>
                <li>You retain ownership of your voice recordings, but grant us a non-exclusive license to process them for the purpose of providing pronunciation feedback.</li>
            </ul>

            <h3>4. Subscriptions and Payments</h3>
            <ul>
                <li>Payments are processed securely via Razorpay. fees are non-refundable unless required by law.</li>
                <li>Subscription plans automatically renew unless canceled before the renewal date via your billing settings.</li>
                <li>Failure to pay subscription fees may result in the suspension of access to premium features.</li>
            </ul>

            <h3>5. AI Feedback Limitations</h3>
            <p>
                Our AI pronunciation feedback is an automated tool designed for guidance. While we strive for accuracy, it may not always match human expert assessment and is provided as-is.
            </p>

            <h3>6. Limitation of Liability</h3>
            <p>
                EduTalks is provided "as is" and "as available" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages resulting from your use of the service.
            </p>

            <h3>7. Termination</h3>
            <p>
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
            </p>

            <hr className="border-slate-800 my-12" />

            <p className="text-sm">
                By using EduTalks, you acknowledge that you have read and understood these Terms and Conditions.
            </p>
        </LegalLayout>
    );
};

export default TermsPage;
