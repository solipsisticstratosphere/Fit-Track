"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Workouts", href: "/workouts" },
    { name: "Meals", href: "/meals" },
    { name: "Weight", href: "/weight" },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignOut();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 shadow-xl sticky top-0 z-50 backdrop-blur-sm border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center group relative"
              aria-label="Home page"
              tabIndex={0}
            >
              <div className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
              <span className="relative text-white text-xl font-bold group-hover:text-indigo-100 transition-all duration-300 px-3 py-2">
                FitTrack
              </span>
            </Link>

            {/* Desktop Navigation */}
            {session && (
              <div className="hidden md:ml-10 md:flex md:space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                      pathname === link.href
                        ? "bg-indigo-800/60 text-white shadow-lg backdrop-blur-sm"
                        : "text-indigo-100 hover:bg-indigo-500/30 hover:text-white hover:shadow-md"
                    }`}
                    aria-current={pathname === link.href ? "page" : undefined}
                    aria-label={link.name}
                    tabIndex={0}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {pathname === link.href && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/40 to-indigo-700/40 rounded-lg" />
                    )}
                    <div className="absolute inset-0 bg-white/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 ease-out" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            {session ? (
              <div className="hidden md:flex items-center gap-3">
                {/* Profile Section */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 max-w-[220px] truncate bg-indigo-800/40 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-indigo-800/60 transition-all duration-300 group border border-indigo-600/30 hover:border-indigo-500/50"
                  aria-label="View profile"
                  tabIndex={0}
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <User className="h-4 w-4 text-indigo-700" />
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium leading-tight">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span className="text-indigo-200 text-xs">
                      View Profile
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-indigo-300 group-hover:text-white transition-colors duration-300" />
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  onKeyDown={handleKeyDown}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-indigo-900 rounded-xl hover:from-indigo-900 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-indigo-600 border border-indigo-700/50"
                  aria-label="Sign out"
                  tabIndex={0}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-indigo-900 rounded-xl hover:from-indigo-900 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-indigo-600"
                  aria-label="Sign in"
                  tabIndex={0}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 text-sm font-medium text-indigo-100 border-2 border-indigo-400/60 rounded-xl hover:bg-indigo-500/30 hover:border-indigo-300 hover:text-white transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-indigo-600"
                  aria-label="Register"
                  tabIndex={0}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-indigo-100 hover:text-white hover:bg-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-all duration-300 backdrop-blur-sm"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "opacity-0 rotate-180"
                        : "opacity-100 rotate-0"
                    }`}
                    aria-hidden="true"
                  />
                  <X
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "opacity-100 rotate-0"
                        : "opacity-0 -rotate-180"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute left-0 right-0 top-16 z-40 bg-gradient-to-b from-indigo-800 to-indigo-900 shadow-2xl border-t border-indigo-600/30 transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-4 pb-6 space-y-3 bg-gradient-to-b from-indigo-800 to-indigo-900 shadow-2xl border-t border-indigo-600/30">
          {session &&
            navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform ${
                  pathname === link.href
                    ? "bg-indigo-900/60 text-white shadow-lg scale-105"
                    : "text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: mobileMenuOpen
                    ? "slideInFromRight 0.3s ease-out forwards"
                    : "none",
                }}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

          {session ? (
            <div className="pt-6 pb-3 border-t border-indigo-700/50">
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-indigo-700/50 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <User className="h-5 w-5 text-indigo-700" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-indigo-800" />
                </div>
                <div className="ml-4">
                  <div className="text-base font-medium text-white">
                    {session.user?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-indigo-200">
                    {session.user?.email || ""}
                  </div>
                </div>
              </Link>
              <div className="mt-4 px-2">
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-indigo-900 to-indigo-800 hover:from-indigo-800 hover:to-indigo-700 text-center transition-all duration-300 shadow-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-6 pb-3 border-t border-indigo-700/50 space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-indigo-900 to-indigo-800 hover:from-indigo-800 hover:to-indigo-700 text-center transition-all duration-300 shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-3 rounded-xl text-base font-medium text-indigo-100 border-2 border-indigo-500/60 hover:bg-indigo-700/50 hover:border-indigo-400 text-center transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
