import React from 'react';

const CookiesPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen px-6 py-20 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.45em] mb-4">Privacy Preference</p>
          <h1 
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-5xl md:text-6xl tracking-widest text-[#1a1a1a] uppercase font-light mb-8"
          >
            Cookies Policy
          </h1>
          <div className="w-12 h-[1px] bg-wonders-gold mx-auto" />
        </div>

        <div className="space-y-12 text-[#1a1a1a] leading-relaxed font-light text-center">
          <section>
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6">1. What are Cookies?</h2>
            <p className="text-[15px] text-gray-600">
              Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6">2. How Lunar uses Cookies</h2>
            <p className="text-[15px] text-gray-600 mb-4">
              When you use and access our Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
            </p>
            <ul className="list-none text-[15px] text-gray-600 space-y-3">
              <li>To enable certain functions of the Service</li>
              <li>To provide analytics</li>
              <li>To store your preferences</li>
              <li>To enable advertisements delivery, including behavioral advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6">3. Types of Cookies we use</h2>
            <p className="text-[15px] text-gray-600">
              We use both session and persistent cookies on the Service and we use different types of cookies to run the Service:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <strong className="text-[14px] uppercase tracking-wider block mb-2">Essential Cookies</strong>
                <p className="text-[15px] text-gray-600">We may use essential cookies to authenticate users and prevent fraudulent use of user accounts.</p>
              </div>
              <div>
                <strong className="text-[14px] uppercase tracking-wider block mb-2">Analytics Cookies</strong>
                <p className="text-[15px] text-gray-600">We may use analytics cookies to track information how the Service is used so that we can make improvements.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium mb-6">4. Your choices</h2>
            <p className="text-[15px] text-gray-600">
              If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 mt-20">
            <p className="text-[11px] uppercase tracking-widest text-gray-400">Last updated: March 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
