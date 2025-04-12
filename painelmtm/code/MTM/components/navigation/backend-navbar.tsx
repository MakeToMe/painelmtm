"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginModal } from "../auth/login-modal";

export function BackendNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalState, setModalState] = useState<'login' | 'criarConta'>('login');
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "Backend", href: "#backend" },
    { name: "Módulos", href: "#modulos" },
    { name: "Preços", href: "#precos" },
    { name: "WhatsApp", href: "#bonus" },
    { name: "Início", href: "/" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasScrolled || isOpen ? 'bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800' : 'bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-sm font-bold text-zinc-900">MTM</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-emerald-500">
                Make To Me
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden min-[1200px]:flex min-[1200px]:items-center min-[1200px]:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Login Button and Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* Login Button */}
              <button
                onClick={() => {
                  setModalState('login');
                  setIsLoginModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
              >
                Área do Cliente
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="min-[1200px]:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-[1200px]:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialState={modalState}
      />
    </>
  );
}
