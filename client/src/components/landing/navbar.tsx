import React, { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { QuickAnonymousJoin } from "@/components/auth/QuickAnonymousJoin";

const navLinks = [
  //   { name: "Home", href: "/" },
  { name: "How it Works", href: "#how" },
  { name: "Features", href: "#features" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow sticky top-0 z-30">
      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 px-5">
          {/* Logo */}
          <Link href="/" className=" gap-2">
            <span className="font-bold text-xl text-orange-600">JumboJolt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-orange-600 font-medium transition"
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2 ml-4">
              <QuickAnonymousJoin
                onSuccess={() => window.location.reload()}
                variant="outline"
                size="sm"
              />
              <Link href="/login">
                <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold">
                  Login / Sign Up
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow">
          <div className="flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 py-2 px-2 rounded hover:bg-orange-50 font-medium"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <QuickAnonymousJoin
                onSuccess={() => {
                  setOpen(false);
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="w-full"
              />
              <Link href="/login">
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold w-full"
                  onClick={() => setOpen(false)}
                >
                  Login / Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
