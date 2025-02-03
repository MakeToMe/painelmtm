export interface ServerPlan {
  name: string;
  price: {
    value: string;
    currency: string;
  };
  cpu: {
    cores: string;
    details: string;
  };
  ram: string;
  storage: string;
  bandwidth: string;
}

export const serverPlans: ServerPlan[] = [
  {
    name: "NVMe 2 GB",
    price: {
      value: "4,00",
      currency: "$"
    },
    cpu: {
      cores: "1 núcleo AMD EPYC",
      details: "(parte justa)"
    },
    ram: "2 GB DDR4",
    storage: "10 GB NVMe",
    bandwidth: "1 TB"
  },
  {
    name: "NVMe 4 GB",
    price: {
      value: "6,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos AMD EPYC",
      details: "(parte justa)"
    },
    ram: "4 GB DDR4",
    storage: "20 GB NVMe",
    bandwidth: "1 TB"
  },
  {
    name: "NVMe 8 GB",
    price: {
      value: "9,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos AMD EPYC",
      details: "(parte justa)"
    },
    ram: "8 GB DDR4",
    storage: "35 GB NVMe",
    bandwidth: "2 TB"
  },
  {
    name: "NVMe 12 GB",
    price: {
      value: "12,00",
      currency: "US$"
    },
    cpu: {
      cores: "4 núcleos AMD EPYC",
      details: "(1 dedicado, 3 núcleos compartilhados)"
    },
    ram: "12 GB DDR4",
    storage: "50 GB NVMe",
    bandwidth: "3 TB"
  },
  {
    name: "NVMe 16 GB",
    price: {
      value: "15,00",
      currency: "US$"
    },
    cpu: {
      cores: "4 núcleos AMD EPYC",
      details: "(2 núcleos dedicados e 2 núcleos compartilhados)"
    },
    ram: "16 GB DDR4",
    storage: "75 GB NVMe",
    bandwidth: "4 TB"
  },
  {
    name: "NVMe 24 GB",
    price: {
      value: "22,00",
      currency: "$"
    },
    cpu: {
      cores: "6 núcleos AMD EPYC",
      details: "(2 núcleos dedicados, 4 núcleos compartilhados)"
    },
    ram: "24 GB DDR4",
    storage: "100 GB NVMe",
    bandwidth: "6 TB"
  },
  {
    name: "NVMe 32 GB",
    price: {
      value: "29,00",
      currency: "US$"
    },
    cpu: {
      cores: "8 núcleos AMD EPYC",
      details: "(3 núcleos dedicados e 5 núcleos compartilhados)"
    },
    ram: "32 GB DDR4",
    storage: "125 GB NVMe",
    bandwidth: "8 TB"
  },
  {
    name: "NVMe 48 GB",
    price: {
      value: "39,00",
      currency: "$"
    },
    cpu: {
      cores: "8 núcleos AMD EPYC",
      details: "(4 núcleos dedicados e 4 núcleos compartilhados)"
    },
    ram: "48 GB DDR4",
    storage: "150 GB NVMe",
    bandwidth: "12 TB"
  },
  {
    name: "NVMe 64 GB",
    price: {
      value: "49,00",
      currency: "$"
    },
    cpu: {
      cores: "12 núcleos AMD EPYC",
      details: "(6 núcleos dedicados e 6 compartilhados)"
    },
    ram: "64 GB DDR4",
    storage: "200 GB NVMe",
    bandwidth: "15 TB"
  },
  {
    name: "NVMe 96 GB",
    price: {
      value: "69,00",
      currency: "$"
    },
    cpu: {
      cores: "16 núcleos AMD EPYC",
      details: "(8 núcleos dedicados, 8 núcleos compartilhados de forma justa)"
    },
    ram: "96 GB DDR4",
    storage: "250 GB NVMe",
    bandwidth: "20 TB"
  }
];
