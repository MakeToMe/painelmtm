"use client";

import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/hero/hero-section";
import { HardwareSection } from "@/components/hardware/hardware-section";
import { ServicesSection } from "@/components/services/services-section";
import { AdvantagesSection } from "@/components/advantages/advantages-section";
import { PriceSection } from '@/components/landing/price-section';
import { FAQSection } from "@/components/faq/faq-section";
import { Footer } from "@/components/footer/footer";
import { NetworkAnimation } from "@/components/ui/network-animation";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-zinc-950">
      <NetworkAnimation />
      <Navbar />
      <HeroSection />
      <HardwareSection />
      <ServicesSection />
      <AdvantagesSection />
      <PriceSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
