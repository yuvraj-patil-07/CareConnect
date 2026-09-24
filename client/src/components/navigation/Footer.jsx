import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';
import { FiTwitter, FiInstagram, FiLinkedin, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const footerLinks = {
  Services: [
    { label: 'AC Service', href: '/services?category=ac-appliances' },
    { label: 'Cleaning', href: '/services?category=cleaning' },
    { label: 'Plumbing', href: '/services?category=plumbing' },
    { label: 'Electrical', href: '/services?category=electrical' },
    { label: 'Painting', href: '/services?category=painting' },
    { label: 'Pest Control', href: '/services?category=pest-control' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#careers' },
    { label: 'Blog', href: '#blog' },
    { label: 'Press', href: '#press' },
    { label: 'Partner With Us', href: '#partner' },
  ],
  Support: [
    { label: 'Help Center', href: '#help' },
    { label: 'Safety', href: '#safety' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'Dispute Resolution', href: '#disputes' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'Refund Policy', href: '#refund' },
  ],
};

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kochi', 'Lucknow', 'Jaipur'];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main footer */}
      <div className="container-app py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-hero-gradient flex items-center justify-center">
                <HiSparkles className="text-white text-sm" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Care<span className="text-primary-400">Connect</span>
                <span className="text-emerald-400 text-sm">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
              India's smartest AI-powered home services marketplace. Verified professionals, transparent pricing, real-time tracking.
            </p>
            {/* Contact */}
            <div className="space-y-2 mb-5">
              <a href="mailto:support@careconnect.ai" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <FiMail size={14} /> support@careconnect.ai
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <FiPhone size={14} /> +91 80000 00000
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FiMapPin size={14} /> Mumbai, India
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: <FiTwitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <FiInstagram size={16} />, href: '#', label: 'Instagram' },
                { icon: <FiLinkedin size={16} />, href: '#', label: 'LinkedIn' },
                { icon: <FiYoutube size={16} />, href: '#', label: 'YouTube' },
                { icon: <FaWhatsapp size={16} />, href: '#', label: 'WhatsApp' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-semibold text-white text-sm mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-xs mb-3">Available in:</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city}
                to={`/services?city=${city}`}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-lg transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container-app py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} CareConnect AI Technologies Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-xs">🇮🇳 Made in India</span>
              <span className="text-slate-600 text-xs">|</span>
              <span className="text-slate-500 text-xs">ISO 9001:2015 Certified</span>
              <span className="text-slate-600 text-xs">|</span>
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
