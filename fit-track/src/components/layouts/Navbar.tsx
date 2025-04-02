"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, User } from "lucide-react";
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
    <nav className="bg-gradient-to-r from-indigo-700 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center group"
              aria-label="Home page"
              tabIndex={0}
            >
              <span className="text-white text-xl font-bold group-hover:text-indigo-200 transition-colors duration-200">
                FitTrack
              </span>
            </Link>

            {session && (
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "bg-indigo-800 text-white shadow-md"
                        : "text-indigo-100 hover:bg-indigo-500/50 hover:text-white"
                    }`}
                    aria-current={pathname === link.href ? "page" : undefined}
                    aria-label={link.name}
                    tabIndex={0}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-indigo-800/30 px-3 py-1.5 rounded-full hover:bg-indigo-800/50 transition-colors duration-200"
                  aria-label="View profile"
                  tabIndex={0}
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        width={28}
                        height={28}
                      />
                    ) : (
                      <User className="h-4 w-4 text-indigo-700" />
                    )}
                  </div>
                  <span className="text-indigo-100 text-sm font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-800 rounded-md hover:bg-indigo-900 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-600"
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
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-800 rounded-md hover:bg-indigo-900 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-600"
                  aria-label="Sign in"
                  tabIndex={0}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-indigo-100 border border-indigo-400 rounded-md hover:bg-indigo-500 hover:border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-600"
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
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-indigo-800 shadow-lg">
          {session &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.name}
              </Link>
            ))}

          {session ? (
            <div className="pt-4 pb-3 border-t border-indigo-700">
              <Link href="/profile" className="flex items-center px-3">
                <div className="h-9 w-9 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      width={36}
                      height={36}
                    />
                  ) : (
                    <User className="h-5 w-5 text-indigo-700" />
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {session.user?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-indigo-200">
                    {session.user?.email || ""}
                  </div>
                </div>
              </Link>
              <div className="mt-3 px-2">
                <button
                  onClick={handleSignOut}
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-900 hover:bg-indigo-700 text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-indigo-700 space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-900 hover:bg-indigo-700 text-center"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-indigo-100 border border-indigo-500 hover:bg-indigo-700 text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
