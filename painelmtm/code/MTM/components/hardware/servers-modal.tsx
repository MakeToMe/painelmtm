"use client";

import { X } from "lucide-react";
import { serverPlans } from "./server-plans";
import { storagePlans } from "./storage-plans";
import { useState } from "react";

type ServerType = "compute" | "storage";

interface ServersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServersModal({ isOpen, onClose }: ServersModalProps) {
  const [activeTab, setActiveTab] = useState<ServerType>("compute");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/90"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-6xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab("compute")}
              className={`flex-1 p-6 text-xl font-semibold transition-all border-b-2 hover:bg-zinc-800/50 ${
                activeTab === "compute" 
                  ? "text-emerald-500 border-emerald-500" 
                  : "text-zinc-400 border-transparent hover:text-emerald-400"
              }`}
            >
              Servidores de Computação
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`flex-1 p-6 text-xl font-semibold transition-all border-b-2 hover:bg-zinc-800/50 ${
                activeTab === "storage" 
                  ? "text-emerald-500 border-emerald-500" 
                  : "text-zinc-400 border-transparent hover:text-emerald-400"
              }`}
            >
              Servidores de Armazenamento
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-6 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scroll">
          <div className="p-6">
            <div className="overflow-x-auto table-container">
              <table className="w-full">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="py-4 px-6 text-left text-gray-400 font-medium whitespace-nowrap min-w-[200px]">PLANO</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium whitespace-nowrap min-w-[180px]">CPU</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium whitespace-nowrap min-w-[120px]">MEMÓRIA</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium whitespace-nowrap min-w-[140px]">ARMAZENAMENTO</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium whitespace-nowrap min-w-[120px]">BANDA</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "compute" && serverPlans.map((plan) => (
                    <tr
                      key={plan.name}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-emerald-500">{plan.name}</div>
                          <div className="text-sm text-emerald-400/80">
                            {plan.price.currency} {plan.price.value}/mês
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <div className="text-gray-200">{plan.cpu.cores}</div>
                          <div className="text-sm text-gray-500">{plan.cpu.details}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.ram}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.storage}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.bandwidth}</td>
                    </tr>
                  ))}
                  {activeTab === "storage" && storagePlans.map((plan) => (
                    <tr
                      key={plan.name}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-emerald-500">{plan.name}</div>
                          <div className="text-sm text-emerald-400/80">
                            {plan.price.currency} {plan.price.value}/mês
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <div className="text-gray-200">{plan.cpu.cores}</div>
                          {plan.cpu.details && (
                            <div className="text-sm text-gray-500">{plan.cpu.details}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.ram}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.storage}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-200">{plan.bandwidth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 p-6 bg-zinc-900">
          <div className="text-sm text-gray-400">
            ¹ Os limites de largura de banda são diferentes para a região APAC. 
            Passe o mouse sobre a largura de banda para vê-los.
          </div>
        </div>
      </div>
    </div>
  );
}
