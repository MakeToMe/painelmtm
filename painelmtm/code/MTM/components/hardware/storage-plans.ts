export interface StoragePlan {
  name: string;
  price: {
    value: string;
    currency: string;
  };
  cpu: {
    cores: string;
    details?: string;
  };
  ram: string;
  storage: string;
  bandwidth: string;
}

export const storagePlans: StoragePlan[] = [
  {
    name: "Armazenamento 1 TB",
    price: {
      value: "5,00",
      currency: "$"
    },
    cpu: {
      cores: "1 núcleo vCPU"
    },
    ram: "1024 MB",
    storage: "1000 GB",
    bandwidth: "2500 GB"
  },
  {
    name: "Armazenamento 2 TB",
    price: {
      value: "9,00",
      currency: "$"
    },
    cpu: {
      cores: "1 núcleo vCPU"
    },
    ram: "1024 MB",
    storage: "2000 GB",
    bandwidth: "5000 GB"
  },
  {
    name: "Armazenamento 3 TB",
    price: {
      value: "12,00",
      currency: "US$"
    },
    cpu: {
      cores: "1 núcleo vCPU"
    },
    ram: "2048 MB",
    storage: "3000 GB",
    bandwidth: "7500 GB"
  },
  {
    name: "Armazenamento 4 TB",
    price: {
      value: "16,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos vCPU"
    },
    ram: "2048 MB",
    storage: "4000 GB",
    bandwidth: "10000 GB"
  },
  {
    name: "Armazenamento 5 TB",
    price: {
      value: "20,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos vCPU"
    },
    ram: "2048 MB",
    storage: "5000 GB",
    bandwidth: "12500 GB"
  },
  {
    name: "Armazenamento 6 TB",
    price: {
      value: "24,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos vCPU"
    },
    ram: "2048 MB",
    storage: "6000 GB",
    bandwidth: "15000 GB"
  },
  {
    name: "Armazenamento 8 TB",
    price: {
      value: "32,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos vCPU"
    },
    ram: "2048 MB",
    storage: "8000 GB",
    bandwidth: "20000 GB"
  },
  {
    name: "Armazenamento 10 TB",
    price: {
      value: "38,00",
      currency: "$"
    },
    cpu: {
      cores: "2 núcleos vCPU"
    },
    ram: "2048 MB",
    storage: "10000 GB",
    bandwidth: "25000 GB"
  }
];
