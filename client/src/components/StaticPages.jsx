import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const PageLayout = ({ title, children }) => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen ${theme.colors.bg} pt-20 pb-32 px-6`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto max-w-4xl ${theme.colors.card} p-10 md:p-16 rounded-[3rem] border ${theme.colors.border} ${theme.colors.shadow}`}
      >
        <h1 className={`text-4xl md:text-5xl font-black ${theme.colors.text} mb-10 border-b ${theme.colors.border} pb-8 tracking-tighter italic`}>{title}</h1>
        <div className={`opacity-70 leading-relaxed space-y-6 text-lg font-medium ${theme.colors.text}`}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const Support = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Help Center">
            <p>Welcome to GameStore Support. How can we help you today?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className={`${theme.colors.bg} p-6 rounded border ${theme.colors.border} hover:border-blue-500 cursor-pointer transition shadow-sm group`}>
                    <h3 className={`font-bold ${theme.colors.text} mb-2 group-hover:text-blue-500 transition`}>Account Issues</h3>
                    <p className="text-sm opacity-60">Login problems, security, and profile management.</p>
                </div>
                <div className={`${theme.colors.bg} p-6 rounded border ${theme.colors.border} hover:border-blue-500 cursor-pointer transition shadow-sm group`}>
                    <h3 className={`font-bold ${theme.colors.text} mb-2 group-hover:text-blue-500 transition`}>Purchases & Refunds</h3>
                    <p className="text-sm opacity-60">Billing questions, refund requests, and transaction history.</p>
                </div>
                <div className={`${theme.colors.bg} p-6 rounded border ${theme.colors.border} hover:border-blue-500 cursor-pointer transition shadow-sm group`}>
                    <h3 className={`font-bold ${theme.colors.text} mb-2 group-hover:text-blue-500 transition`}>Game Technical Support</h3>
                    <p className="text-sm opacity-60">Crashes, installation errors, and performance issues.</p>
                </div>
                <div className={`${theme.colors.bg} p-6 rounded border ${theme.colors.border} hover:border-blue-500 cursor-pointer transition shadow-sm group`}>
                    <h3 className={`font-bold ${theme.colors.text} mb-2 group-hover:text-blue-500 transition`}>Community & Safety</h3>
                    <p className="text-sm opacity-60">Report harassment, ban appeals, and community guidelines.</p>
                </div>
            </div>
        </PageLayout>
    );
};

export const FAQ = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Frequently Asked Questions">
            <div className="space-y-6">
                <details className="group">
                    <summary className={`font-bold ${theme.colors.text} cursor-pointer list-none flex justify-between items-center`}>
                        <span>How do I refund a game?</span>
                        <span className={`${theme.colors.accent} transition group-open:rotate-180`}>▼</span>
                    </summary>
                    <p className={`mt-2 text-sm opacity-70 pl-4 border-l-2 ${theme.colors.border}`}>
                        You can request a refund within 14 days of purchase if you have played for less than 2 hours. Go to Support {'>'} Purchases.
                    </p>
                </details>
                <details className="group">
                    <summary className={`font-bold ${theme.colors.text} cursor-pointer list-none flex justify-between items-center`}>
                        <span>Is GameStore free to use?</span>
                        <span className={`${theme.colors.accent} transition group-open:rotate-180`}>▼</span>
                    </summary>
                    <p className={`mt-2 text-sm opacity-70 pl-4 border-l-2 ${theme.colors.border}`}>
                        Creating an account is free. You only pay for the games you buy. We also have a selection of Free-to-Play titles.
                    </p>
                </details>
                <details className="group">
                    <summary className={`font-bold ${theme.colors.text} cursor-pointer list-none flex justify-between items-center`}>
                        <span>Can I share my library?</span>
                        <span className={`${theme.colors.accent} transition group-open:rotate-180`}>▼</span>
                    </summary>
                    <p className={`mt-2 text-sm opacity-70 pl-4 border-l-2 ${theme.colors.border}`}>
                        Yes, Family Sharing allows you to share your library with up to 5 family members on the same device.
                    </p>
                </details>
            </div>
        </PageLayout>
    );
};

export const SystemStatus = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="System Status">
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-green-500/10 p-4 rounded border border-green-500/30">
                    <span className={`font-bold ${theme.colors.text}`}>Store Services</span>
                    <span className="text-green-500 font-bold flex items-center gap-2">● Operational</span>
                </div>
                <div className="flex justify-between items-center bg-green-500/10 p-4 rounded border border-green-500/30">
                    <span className={`font-bold ${theme.colors.text}`}>Community & Chat</span>
                    <span className="text-green-500 font-bold flex items-center gap-2">● Operational</span>
                </div>
                <div className="flex justify-between items-center bg-green-500/10 p-4 rounded border border-green-500/30">
                    <span className={`font-bold ${theme.colors.text}`}>Multiplayer Servers</span>
                    <span className="text-green-500 font-bold flex items-center gap-2">● Operational</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-500/10 p-4 rounded border border-yellow-500/30">
                    <span className={`font-bold ${theme.colors.text}`}>Image CDN</span>
                    <span className="text-yellow-500 font-bold flex items-center gap-2">● Degraded Performance</span>
                </div>
            </div>
        </PageLayout>
    );
};

export const Contact = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Contact Us">
            <p className="mb-6">Have a specific question? Reach out to our team.</p>
            <form className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-bold mb-1 opacity-60">Email Address</label>
                    <input type="email" className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} outline-none focus:border-blue-500 transition`} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 opacity-60">Subject</label>
                    <input type="text" className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} outline-none focus:border-blue-500 transition`} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 opacity-60">Message</label>
                    <textarea className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} outline-none focus:border-blue-500 transition h-32`}></textarea>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-500 transition shadow-lg">Send Message</button>
            </form>
        </PageLayout>
    );
};

export const Privacy = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Privacy Policy">
            <p>Last updated: January 2026</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>1. Data Collection</h3>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>2. Use of Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, such as to process transactions and send you related information.</p>
        </PageLayout>
    );
};

export const Terms = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Terms of Service">
            <p>Welcome to GameStore. By using our services, you agree to these terms.</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>1. License</h3>
            <p>GameStore grants you a personal, non-exclusive, non-transferable, limited license to use the content and services.</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>2. User Conduct</h3>
            <p>You agree not to violate any laws, third-party rights, or our policies.</p>
        </PageLayout>
    );
};

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

export const Refunds = () => {
    const { theme } = useTheme();
    return (
        <PageLayout title="Refund Policy">
            <p>We want you to be happy with your purchase.</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>Standard Refund Policy</h3>
            <p>Refunds are typically available for purchases made within the last 14 days, provided the title has been played for less than 2 hours.</p>
            <h3 className={`text-xl font-bold ${theme.colors.text} mt-6 mb-2`}>How to Request</h3>
            <p>Navigate to the Support page, select &quot;Purchases,&quot; and find the transaction you wish to refund.</p>
        </PageLayout>
    );
};
