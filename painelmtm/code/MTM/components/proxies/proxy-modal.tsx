"use client";

import { Proxy } from "@/types/proxy";
import { useEffect, useState } from "react";
import { getProxies } from "@/lib/supabase/proxies";
import { supabase } from '@/lib/supabase';

interface ProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProxyModal({ isOpen, onClose }: ProxyModalProps) {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados iniciais
  const fetchProxies = async () => {
    try {
      const data = await getProxies();
      setProxies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proxies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProxies();

      // Inscrever para atualizações em tempo real
      const subscription = supabase
        .channel('joe-proxys-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escuta todos os eventos (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'joe-proxys',
          },
          async (payload) => {
            console.log('Realtime change received:', payload);
            
            // Atualizar a lista completa após qualquer mudança
            await fetchProxies();
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      // Cleanup: desinscrever quando o componente for desmontado
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Proxies</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
          {loading ? (
            <div className="text-center text-zinc-400">Carregando...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="grid gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-300">
                  <thead className="text-xs uppercase bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Em Uso</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">URI</th>
                      <th className="px-4 py-3">ID Proxy</th>
                      <th className="px-4 py-3">Cidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proxies.map((proxy) => (
                      <tr key={proxy.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="px-4 py-3">{proxy.id}</td>
                        <td className="px-4 py-3">{proxy.data}</td>
                        <td className="px-4 py-3">{proxy.em_uso}</td>
                        <td className="px-4 py-3">{proxy.whats}</td>
                        <td className="px-4 py-3">{proxy.status_proxy}</td>
                        <td className="px-4 py-3">{proxy.uri}</td>
                        <td className="px-4 py-3">{proxy.id_proxy}</td>
                        <td className="px-4 py-3">{proxy.ip_cidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
