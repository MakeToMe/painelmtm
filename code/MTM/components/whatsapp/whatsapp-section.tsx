"use client";

import { motion } from "framer-motion";
import { WhatsAppContent } from "./whatsapp-content";
import { WhatsAppAnimation } from "./whatsapp-animation";

export function WhatsAppSection() {
  return (
    <section id="bonus" className="py-24 relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-zinc-900/50 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <WhatsAppContent />
          <WhatsAppAnimation />
        </div>
      </div>
    </section>
  );
}