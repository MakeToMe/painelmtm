"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const links = [
  { label: "Termos de Uso", href: "/termos-uso" },
  { label: "Termos do Serviço", href: "/termos-servico" },
  { label: "Política de Privacidade", href: "/privacidade" }
];

export function ComplianceColumn() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-emerald-500">
        Centro de Conformidade
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}