import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen px-6 pt-2 md:pt-4 pb-20 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.45em] mb-4">Legal Notice</p>
          <h1 
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-5xl md:text-6xl tracking-widest text-[#1a1a1a] uppercase font-light mb-8"
          >
            Terms of Service
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto" />
        </div>

        <div className="space-y-12 text-[#1a1a1a] leading-relaxed font-light flex flex-col items-center text-center">
          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center">1. Introduction</h2>
            <p className="text-[15px] text-gray-600 mb-4 text-center">
              Welcome to Lunar. These Terms of Service govern your use of our website located at mylunar.ie operated by Lunar Jewellery.
            </p>
            <p className="text-[15px] text-gray-600 text-center">
              By accessing or using our website, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center">2. Intellectual Property</h2>
            <p className="text-[15px] text-gray-600 text-center">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Lunar Jewellery. Our intellectual property may not be used in connection with any product or service without the prior written consent of Lunar Jewellery.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center">3. User Responsibilities</h2>
            <p className="text-[15px] text-gray-600 text-center">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center">4. Limitation of Liability</h2>
            <p className="text-[15px] text-gray-600 text-center">
              In no event shall Lunar Jewellery, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center">5. Governing Law</h2>
            <p className="text-[15px] text-gray-600 text-center">
              These Terms shall be governed and construed in accordance with the laws of Ireland, without regard to its conflict of law provisions.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 mt-20 w-full text-center">
            <p className="text-[11px] uppercase tracking-widest text-gray-400">Last updated: March 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
