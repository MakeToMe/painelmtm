"use client";

import { BackendNavbar } from "@/components/navigation/backend-navbar";
import { BackendSection } from "@/components/backend/backend-section";
import { ModulesSection } from "@/components/plans/plans-section";
import { PlanosContainer } from '@/components/planos/planos-container';
import { WhatsAppSection } from "@/components/whatsapp/whatsapp-section";
import { Footer } from "@/components/footer/footer";
import { NetworkAnimation } from "@/components/ui/network-animation";

export default function Backend() {
  return (
    <main className="relative min-h-screen bg-zinc-950">
      <NetworkAnimation />
      <BackendNavbar />
      <BackendSection />
      <ModulesSection />
      <PlanosContainer />
      <WhatsAppSection />
      <Footer />
    </main>
  );
}
