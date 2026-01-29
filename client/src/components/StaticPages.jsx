import React from 'react';
import { Link } from 'react-router-dom';

const PageLayout = ({ title, children }) => (
  <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
    <div className="container mx-auto max-w-4xl bg-steam-light p-8 rounded-xl border border-gray-800 shadow-xl">
      <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">{title}</h1>
      <div className="text-gray-300 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  </div>
);

export const Support = () => (
  <PageLayout title="Help Center">
    <p>Welcome to GameStore Support. How can we help you today?</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-steam-dark p-6 rounded border border-gray-700 hover:border-steam-accent cursor-pointer transition">
            <h3 className="font-bold text-white mb-2">Account Issues</h3>
            <p className="text-sm text-gray-400">Login problems, security, and profile management.</p>
        </div>
        <div className="bg-steam-dark p-6 rounded border border-gray-700 hover:border-steam-accent cursor-pointer transition">
            <h3 className="font-bold text-white mb-2">Purchases & Refunds</h3>
            <p className="text-sm text-gray-400">Billing questions, refund requests, and transaction history.</p>
        </div>
        <div className="bg-steam-dark p-6 rounded border border-gray-700 hover:border-steam-accent cursor-pointer transition">
            <h3 className="font-bold text-white mb-2">Game Technical Support</h3>
            <p className="text-sm text-gray-400">Crashes, installation errors, and performance issues.</p>
        </div>
        <div className="bg-steam-dark p-6 rounded border border-gray-700 hover:border-steam-accent cursor-pointer transition">
            <h3 className="font-bold text-white mb-2">Community & Safety</h3>
            <p className="text-sm text-gray-400">Report harassment, ban appeals, and community guidelines.</p>
        </div>
    </div>
  </PageLayout>
);

export const FAQ = () => (
  <PageLayout title="Frequently Asked Questions">
    <div className="space-y-6">
        <details className="group">
            <summary className="font-bold text-white cursor-pointer list-none flex justify-between items-center">
                <span>How do I refund a game?</span>
                <span className="text-steam-accent transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-400 pl-4 border-l-2 border-gray-700">
                You can request a refund within 14 days of purchase if you have played for less than 2 hours. Go to Support {'>'} Purchases.
            </p>
        </details>
        <details className="group">
            <summary className="font-bold text-white cursor-pointer list-none flex justify-between items-center">
                <span>Is GameStore free to use?</span>
                <span className="text-steam-accent transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-400 pl-4 border-l-2 border-gray-700">
                Creating an account is free. You only pay for the games you buy. We also have a selection of Free-to-Play titles.
            </p>
        </details>
        <details className="group">
            <summary className="font-bold text-white cursor-pointer list-none flex justify-between items-center">
                <span>Can I share my library?</span>
                <span className="text-steam-accent transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-400 pl-4 border-l-2 border-gray-700">
                Yes, Family Sharing allows you to share your library with up to 5 family members on the same device.
            </p>
        </details>
    </div>
  </PageLayout>
);

export const SystemStatus = () => (
  <PageLayout title="System Status">
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-green-900/20 p-4 rounded border border-green-500/30">
            <span className="font-bold text-white">Store Services</span>
            <span className="text-green-400 font-bold flex items-center gap-2">● Operational</span>
        </div>
        <div className="flex justify-between items-center bg-green-900/20 p-4 rounded border border-green-500/30">
            <span className="font-bold text-white">Community & Chat</span>
            <span className="text-green-400 font-bold flex items-center gap-2">● Operational</span>
        </div>
        <div className="flex justify-between items-center bg-green-900/20 p-4 rounded border border-green-500/30">
            <span className="font-bold text-white">Multiplayer Servers</span>
            <span className="text-green-400 font-bold flex items-center gap-2">● Operational</span>
        </div>
        <div className="flex justify-between items-center bg-yellow-900/20 p-4 rounded border border-yellow-500/30">
            <span className="font-bold text-white">Image CDN</span>
            <span className="text-yellow-400 font-bold flex items-center gap-2">● Degraded Performance</span>
        </div>
    </div>
  </PageLayout>
);

export const Contact = () => (
  <PageLayout title="Contact Us">
    <p className="mb-6">Have a specific question? Reach out to our team.</p>
    <form className="space-y-4 max-w-lg">
        <div>
            <label className="block text-sm font-bold mb-1 text-gray-400">Email Address</label>
            <input type="email" className="w-full bg-steam-dark border border-gray-700 rounded p-2 text-white outline-none focus:border-steam-accent" />
        </div>
        <div>
            <label className="block text-sm font-bold mb-1 text-gray-400">Subject</label>
            <input type="text" className="w-full bg-steam-dark border border-gray-700 rounded p-2 text-white outline-none focus:border-steam-accent" />
        </div>
        <div>
            <label className="block text-sm font-bold mb-1 text-gray-400">Message</label>
            <textarea className="w-full bg-steam-dark border border-gray-700 rounded p-2 text-white outline-none focus:border-steam-accent h-32"></textarea>
        </div>
        <button className="bg-steam-accent text-white px-6 py-2 rounded font-bold hover:bg-blue-500 transition">Send Message</button>
    </form>
  </PageLayout>
);

export const Privacy = () => (
  <PageLayout title="Privacy Policy">
    <p>Last updated: January 2026</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">1. Data Collection</h3>
    <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">2. Use of Information</h3>
    <p>We use the information we collect to provide, maintain, and improve our services, such as to process transactions and send you related information.</p>
  </PageLayout>
);

export const Terms = () => (
  <PageLayout title="Terms of Service">
    <p>Welcome to GameStore. By using our services, you agree to these terms.</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">1. License</h3>
    <p>GameStore grants you a personal, non-exclusive, non-transferable, limited license to use the content and services.</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">2. User Conduct</h3>
    <p>You agree not to violate any laws, third-party rights, or our policies.</p>
  </PageLayout>
);

export const Cookies = () => (
  <PageLayout title="Cookie Policy">
    <p>We use cookies to improve your experience.</p>
    <ul className="list-disc pl-5 mt-4 space-y-2">
        <li><strong>Essential Cookies:</strong> Required for the site to function (e.g., login, cart).</li>
        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the site.</li>
        <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements.</li>
    </ul>
  </PageLayout>
);

export const Refunds = () => (
  <PageLayout title="Refund Policy">
    <p>We want you to be happy with your purchase.</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">Standard Refund Policy</h3>
    <p>Refunds are typically available for purchases made within the last 14 days, provided the title has been played for less than 2 hours.</p>
    <h3 className="text-xl font-bold text-white mt-6 mb-2">How to Request</h3>
    <p>Navigate to the Support page, select "Purchases," and find the transaction you wish to refund.</p>
  </PageLayout>
);
