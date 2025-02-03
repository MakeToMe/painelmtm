"use client";

export interface Server {
  plan: string;
  price: string;
  cpu: string;
  cpuDetails: string;
  ram: string;
  storage: string;
  bandwidth: string;
}

export const servers: Server[] = [
  {
    plan: "NVMe 2 GB",
    price: "$ 4,00",
    cpu: "1 núcleo AMD EPYC",
    cpuDetails: "(parte justa)",
    ram: "2 GB DDR4",
    storage: "10 GB NVMe",
    bandwidth: "1 TB"
  },
  {
    plan: "NVMe 4 GB",
    price: "$ 6,00",
    cpu: "2 núcleos AMD EPYC",
    cpuDetails: "(parte justa)",
    ram: "4 GB DDR4",
    storage: "20 GB NVMe",
    bandwidth: "1 TB"
  },
  {
    plan: "NVMe 8 GB",
    price: "$ 9,00",
    cpu: "2 núcleos AMD EPYC",
    cpuDetails: "(parte justa)",
    ram: "8 GB DDR4",
    storage: "35 GB NVMe",
    bandwidth: "2 TB"
  },
  {
    plan: "NVMe 12 GB",
    price: "US$ 12,00",
    cpu: "4 núcleos AMD EPYC",
    cpuDetails: "(1 dedicado, 3 núcleos compartilhados)",
    ram: "12 GB DDR4",
    storage: "50 GB NVMe",
    bandwidth: "3 TB"
  },
  {
    plan: "NVMe 16 GB",
    price: "US$ 15,00",
    cpu: "4 núcleos AMD EPYC",
    cpuDetails: "(2 núcleos dedicados e 2 núcleos compartilhados)",
    ram: "16 GB DDR4",
    storage: "75 GB NVMe",
    bandwidth: "4 TB"
  },
  {
    plan: "NVMe 24 GB",
    price: "$ 22,00",
    cpu: "6 núcleos AMD EPYC",
    cpuDetails: "(2 núcleos dedicados, 4 núcleos compartilhados)",
    ram: "24 GB DDR4",
    storage: "100 GB NVMe",
    bandwidth: "6 TB"
  },
  {
    plan: "NVMe 32 GB",
    price: "US$ 29,00",
    cpu: "8 núcleos AMD EPYC",
    cpuDetails: "(3 núcleos dedicados e 5 núcleos compartilhados)",
    ram: "32 GB DDR4",
    storage: "125 GB NVMe",
    bandwidth: "8 TB"
  },
  {
    plan: "NVMe 48 GB",
    price: "$ 39,00",
    cpu: "8 núcleos AMD EPYC",
    cpuDetails: "(4 núcleos dedicados e 4 núcleos compartilhados)",
    ram: "48 GB DDR4",
    storage: "150 GB NVMe",
    bandwidth: "12 TB"
  },
  {
    plan: "NVMe 64 GB",
    price: "$ 49,00",
    cpu: "12 núcleos AMD EPYC",
    cpuDetails: "(6 núcleos dedicados e 6 compartilhados)",
    ram: "64 GB DDR4",
    storage: "200 GB NVMe",
    bandwidth: "15 TB"
  },
  {
    plan: "NVMe 96 GB",
    price: "$ 69,00",
    cpu: "16 núcleos AMD EPYC",
    cpuDetails: "(8 núcleos dedicados, 8 núcleos compartilhados de forma justa)",
    ram: "96 GB DDR4",
    storage: "250 GB NVMe",
    bandwidth: "20 TB"
  }
];