"use client";

import { motion } from "framer-motion";

interface DataCenter {
  city: string;
  country: string;
  flag: string;
}

const dataCenters: DataCenter[] = [
  { city: "Amsterdam", country: "Netherlands", flag: "nl" },
  { city: "Chicago", country: "United States", flag: "us" },
  { city: "Hong Kong", country: "Hong Kong", flag: "hk" },
  { city: "London", country: "United Kingdom", flag: "gb" },
  { city: "Los Angeles", country: "United States", flag: "us" },
  { city: "New York", country: "United States", flag: "us" },
  { city: "Oslo", country: "Norway", flag: "no" },
  { city: "Stockholm", country: "Sweden", flag: "se" },
  { city: "Sydney", country: "Australia", flag: "au" },
  { city: "Tokyo", country: "Japan", flag: "jp" },
  { city: "Vienna", country: "Austria", flag: "at" },
  { city: "Zurich", country: "Switzerland", flag: "ch" },
];

export function DataCenterLocations() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-emerald-500">
          Data Centers Globais
        </h3>
        <p className="text-gray-400 mt-2">
          Presença em 12 localizações estratégicas ao redor do mundo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dataCenters.map((dc, index) => (
          <motion.div
            key={`${dc.city}-${dc.country}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 group-hover:border-emerald-500/50 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <span className={`fi fi-${dc.flag} w-6 h-4 rounded-sm`} />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-200 font-medium group-hover:text-emerald-400 transition-colors duration-300 truncate">
                    {dc.city}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {dc.country}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}