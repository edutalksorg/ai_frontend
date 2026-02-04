import React from 'react';
import LegalLayout from './LegalLayout';

const CookiePolicyPage: React.FC = () => {
    return (
        <LegalLayout title="Cookie Policy">
            <p>Last Updated: February 04, 2026</p>

            <p>
                EduTalks uses cookies and similar technologies to enhance your experience, analyze performance, and ensure the security of our platform.
            </p>

            <h3>1. What are Cookies?</h3>
            <p>
                Cookies are small text files stored on your device that help us recognize you and remember your preferences across different sessions.
            </p>

            <h3>2. How We Use Cookies</h3>
            <ul>
                <li><strong>Authentication:</strong> To keep you logged into your account as you navigate the site.</li>
                <li><strong>Preferences:</strong> To remember your language settings, theme choices (Dark Mode), and recently accessed lessons.</li>
                <li><strong>Security:</strong> To help identify and prevent unauthorized access or security risks.</li>
                <li><strong>Performance and Analytics:</strong> To understand how users interact with our platform, help us identify bugs, and improve the educational content.</li>
            </ul>

            <h3>3. Third-Party Cookies</h3>
            <p>
                We may use third-party services that also use cookies:
            </p>
            <ul>
                <li><strong>Razorpay:</strong> To facilitate secure and seamless payment transactions.</li>
                <li><strong>Analytics Providers:</strong> To help us measure traffic and usage trends for the service.</li>
            </ul>

            <h3>4. Managing Cookies</h3>
            <p>
                Most web browsers allow you to manage cookies through their settings. If you choose to decline cookies, some parts of EduTalks may not function as intended.
            </p>

            <hr className="border-slate-800 my-12" />

            <p className="text-sm">
                By continuing to use our site, you consent to our use of cookies according to this policy.
            </p>
        </LegalLayout>
    );
};

export default CookiePolicyPage;
