import React, { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

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
        <div className="flex justify-between items-center h-16">
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
            <Link href="/login">
              <button className="ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold">
                Login / Sign Up
              </button>
            </Link>
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
            <Link href="/login">
              <button
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold w-full"
                onClick={() => setOpen(false)}
              >
                Login / Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
