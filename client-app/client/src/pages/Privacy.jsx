import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen p-6 md:p-12" style={{ background: '#0A0A0A', color: '#E5E5E5' }}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
                    style={{ color: '#888' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 md:p-12 rounded-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Shield size={24} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to Mithra Life OS ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We collect information that you voluntarily provide to us when you register on the application, specifically:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Personal information (Name, Email address)</li>
                                <li>Authentication credentials (via Google OAuth or Email/Password)</li>
                                <li>User content (Tasks, Journal entries, Calendar events)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. Google User Data</h2>
                            <p className="mb-2">Our application's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                            <p>Specifically, if you choose to connect your Google Calendar:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>We access your calendar events solely to display them within the Mithra dashboard.</li>
                                <li>We do not store your calendar data permanently on our servers; it is fetched in real-time or cached locally.</li>
                                <li>We do not share your Google user data with third-party AI models without your explicit consent.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. How We Use Your Information</h2>
                            <p>We use the information we collect or receive:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send you administrative information.</li>
                                <li>To protect our Services.</li>
                                <li>To improve your user experience through AI-driven insights (processed locally or securely).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Contact Us</h2>
                            <p>
                                If you have questions or comments about this policy, you may email us at support@mithra.ai.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-white/5 text-xs">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
