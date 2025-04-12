"use client";

import { motion } from "framer-motion";
import { HardwareFeatures } from "./hardware-features";
import { HardwareSpecs } from "./hardware-specs";
import { HardwareGlobe } from "./hardware-globe";
import { DataCenterLocations } from "./datacenter-locations";
import { ServersButton } from "./servers-button";
import { VMGrid } from "@/components/servers/vm-grid";
import { StorageVMGrid } from "@/components/servers/storage-vm-grid";

export function HardwareSection() {
  return (
    <section id="hardware" className="py-24 relative overflow-hidden">
      {/* Dynamic background with gradient and pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-emerald-500">Hardware</h2>
          <p className="text-gray-400 text-lg mt-4">
            Infraestrutura robusta e escalável para suas aplicações
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive 3D Globe showing server locations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] order-2 lg:order-1"
          >
            <HardwareGlobe />
          </motion.div>

          {/* Hardware Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <HardwareFeatures />
          </motion.div>
        </div>

        {/* Hardware Specs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <HardwareSpecs />
          <ServersButton />
          
          {/* VM Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <VMGrid />
          </motion.div>

          {/* Storage VM Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <StorageVMGrid />
          </motion.div>
        </motion.div>

        {/* Data Center Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <DataCenterLocations />
        </motion.div>
      </div>
    </section>
  );
}