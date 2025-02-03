"use client";

import { AboutColumn } from "./about-column";
import { ComplianceColumn } from "./compliance-column";
import { ContactForm } from "./contact-form";

export function Footer() {
  return (
    <footer className="bg-zinc-900/80 border-t border-zinc-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AboutColumn />
          <ComplianceColumn />
          <ContactForm />
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800/50">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Make To Me. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}