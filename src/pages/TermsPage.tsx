import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#121212] min-h-screen px-6 pt-2 md:pt-4 pb-20 animate-fade-in flex flex-col items-center w-full transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <p className="text-[11px] text-wonders-gold uppercase tracking-[0.45em] mb-4 font-bold">Legal Notice</p>
          <h1 
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-5xl md:text-6xl tracking-widest text-[#1a1a1a] dark:text-[#F5F5F5] uppercase font-light mb-8"
          >
            Terms of Service
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto" />
        </div>

        <div className="space-y-12 text-[#1a1a1a] dark:text-[#F5F5F5] leading-relaxed font-light flex flex-col items-center text-center">
          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center text-[#1a1a1a] dark:text-[#F5F5F5]">1. Introduction</h2>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] mb-4 text-center">
              Welcome to Lunar. These Terms of Service govern your use of our website located at mylunar.shop operated by Lunar Jewellery.
            </p>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] text-center">
              By accessing or using our website, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center text-[#1a1a1a] dark:text-[#F5F5F5]">2. Intellectual Property</h2>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] text-center">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Lunar Jewellery. Our intellectual property may not be used in connection with any product or service without the prior written consent of Lunar Jewellery.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center text-[#1a1a1a] dark:text-[#F5F5F5]">3. User Responsibilities</h2>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] text-center">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center text-[#1a1a1a] dark:text-[#F5F5F5]">4. Limitation of Liability</h2>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] text-center">
              In no event shall Lunar Jewellery, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="w-full">
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6 text-center text-[#1a1a1a] dark:text-[#F5F5F5]">5. Governing Law</h2>
            <p className="text-[15px] text-gray-600 dark:text-[#AAAAAA] text-center">
              These Terms shall be governed and construed in accordance with the laws of Ireland, without regard to its conflict of law provisions.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 dark:border-[#2E2E2E] mt-20 w-full text-center">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-[#888888]">Last updated: March 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
