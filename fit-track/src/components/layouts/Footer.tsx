import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
      {/* Top section with newsletter */}
      <div className="border-b border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay updated with FitTrack
              </h3>
              <p className="text-indigo-200 mb-0">
                Get fitness tips, nutrition advice, and exclusive offers
                straight to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-md bg-indigo-800/50 border border-indigo-700 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                className="flex items-center justify-center px-6 py-3 bg-white text-indigo-700 rounded-md font-medium hover:bg-indigo-50 transition-colors duration-200 whitespace-nowrap"
                aria-label="Subscribe to newsletter"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div>
            <div className="mb-4">
              <Image
                src="/placeholder.svg?height=40&width=120"
                alt="FitTrack Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-indigo-200 mb-6">
              FitTrack helps you reach your fitness goals with comprehensive
              tracking and insights.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Workout Library
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Nutrition Guide
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Fitness Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-indigo-400 mr-2 mt-0.5" />
                <span className="text-indigo-200">support@fittrack.com</span>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-indigo-200 hover:text-white transition-colors duration-200"
                >
                  Partner with Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright and legal links */}
        <div className="pt-8 border-t border-indigo-800/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-indigo-300">
                &copy; {currentYear} FitTrack. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="#"
                className="text-sm text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Terms and Conditions"
              >
                Terms & Conditions
              </Link>
              <Link
                href="#"
                className="text-sm text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Privacy Policy"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Cookie Policy"
              >
                Cookie Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-indigo-300 hover:text-white transition-colors duration-200"
                aria-label="Contact Us"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
