import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <FileText size={24} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using Mithra AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. User Accounts</h2>
                            <p>
                                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. Intellectual Property</h2>
                            <p>
                                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Mithra AI and its licensors.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. Termination</h2>
                            <p>
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Limitation of Liability</h2>
                            <p>
                                In no event shall Mithra AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">6. Changes</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
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
