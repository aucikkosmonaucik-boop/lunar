import React, { useState } from 'react';
import { Send } from 'lucide-react';

const inputClass =
  'w-full bg-transparent border-b-2 border-gray-200 py-4 text-[16px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#1a1a1a] transition-colors duration-300';

const labelClass =
  'block text-[11px] uppercase tracking-[0.4em] text-gray-400 font-medium mb-3';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 6000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center px-6 pt-8 pb-28">

      {/* ── Header ──────────────────────────── */}
      <div className="text-center mb-16 w-full">
        <p className="text-[11px] text-wonders-gold font-bold uppercase tracking-[0.45em] mb-5">
          Get in Touch
        </p>
        <h1
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          className="text-6xl md:text-7xl tracking-widest text-[#1a1a1a] uppercase font-light mb-6"
        >
          Contact Us
        </h1>
        <div className="w-12 h-[1px] bg-wonders-gold mx-auto mb-6" />
        <p className="text-gray-400 text-[14px] uppercase tracking-widest font-light max-w-sm mx-auto leading-relaxed">
          We'd love to hear from you. We'll respond within 24 hours.
        </p>
      </div>

      {/* ── Form / Success ───────────────────── */}
      <div className="w-full max-w-xl mx-auto">
        {isSubmitted ? (
          <div className="bg-[#f5eeeb] border border-[#e8ddd8] p-14 text-center">
            <div className="w-16 h-16 rounded-full border border-[#ddd0c8] flex items-center justify-center mx-auto mb-7">
              <Send className="w-6 h-6 text-[#1a1a1a] stroke-[1.3]" />
            </div>
            <h3
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              className="text-4xl tracking-widest text-[#1a1a1a] uppercase mb-5 font-light"
            >
              Message Sent
            </h3>
            <div className="w-8 h-[1px] bg-[#c8b8ae] mx-auto mb-5" />
            <p className="text-[14px] text-gray-400 font-light tracking-wide leading-relaxed">
              Thank you for reaching out. We will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <label htmlFor="name" className={labelClass}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className={labelClass}>Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help you?"
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className={labelClass}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Write your message here..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Submit — centered */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.45em] py-5 px-14 hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
};

export default ContactPage;
