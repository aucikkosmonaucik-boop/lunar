import React, { useState } from 'react';
import { Send, MapPin, Mail, Clock } from 'lucide-react';

const inputClass =
  'w-full bg-transparent border-b border-gray-200 py-3 text-[14px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#1a1a1a] transition-colors duration-300';

const labelClass =
  'block text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-2';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Page Header ──────────────────────────── */}
      <div className="text-center pt-12 pb-20 px-4">
        <p className="text-[10px] text-wonders-gold font-bold uppercase tracking-[0.4em] mb-5">
          Get in Touch
        </p>
        <h1
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          className="text-6xl md:text-7xl tracking-widest text-[#1a1a1a] uppercase font-light mb-6"
        >
          Contact Us
        </h1>
        <div className="w-12 h-[1px] bg-wonders-gold mx-auto mb-6" />
        <p className="text-gray-400 text-[13px] uppercase tracking-widest font-light max-w-md mx-auto leading-relaxed">
          We'd love to hear from you. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      {/* ── Main Content ─────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16 lg:gap-24 items-start">

          {/* ── Form ───────────────────────────────── */}
          <div>
            {isSubmitted ? (
              <div className="bg-[#f5eeeb] border border-[#e8ddd8] p-12 text-center">
                <div className="w-14 h-14 rounded-full border border-[#ddd0c8] flex items-center justify-center mx-auto mb-6">
                  <Send className="w-5 h-5 text-[#1a1a1a] stroke-[1.5]" />
                </div>
                <h3
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  className="text-3xl tracking-widest text-[#1a1a1a] uppercase mb-4 font-light"
                >
                  Message Sent
                </h3>
                <div className="w-8 h-[1px] bg-[#c8b8ae] mx-auto mb-5" />
                <p className="text-[13px] text-gray-400 font-light tracking-wide leading-relaxed">
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

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.4em] py-5 px-12 hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Send Message <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Info Panel ────────────────────────── */}
          <div className="space-y-10 pt-1">
            <div className="border-l-2 border-[#e8ddd8] pl-6">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium mb-8">
                Contact Info
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full border border-[#e8ddd8] flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Email</p>
                    <p className="text-[14px] text-[#1a1a1a] font-light tracking-wide">
                      hello@lunarboutique.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full border border-[#e8ddd8] flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Location</p>
                    <p className="text-[14px] text-[#1a1a1a] font-light tracking-wide leading-relaxed">
                      Warsaw, Poland
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full border border-[#e8ddd8] flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Response Time</p>
                    <p className="text-[14px] text-[#1a1a1a] font-light tracking-wide">
                      Within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative note */}
            <div className="bg-[#f5eeeb] border border-[#e8ddd8] p-6">
              <p className="text-[11px] text-gray-500 font-light leading-relaxed tracking-wide">
                For order-related inquiries, please include your order number in the subject line.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
