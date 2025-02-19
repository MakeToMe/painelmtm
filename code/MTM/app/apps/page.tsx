'use client';

import { useState, useEffect } from 'react';
import { AppsNavbar } from '@/components/apps/navbar';
import { CategoryBar } from '@/components/apps/category-bar';
import { AppData } from '@/types/app-data';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ParticlesAnimation } from '@/components/apps/particles-animation';

export default function AppsPage() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filteredApps, setFilteredApps] = useState<AppData[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      const { data } = await supabase
        .from('list_apps')
        .select('*')
        .order('ordem');

      if (!data) return;
      
      setApps(data);
      
      // Extrair categorias únicas e ordenar alfabeticamente
      const uniqueCategories = [...new Set(data.map(app => app.categoria))].sort();
      setCategories(uniqueCategories);
    };

    loadApps();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredApps(apps);
    } else {
      setFilteredApps(apps.filter(app => app.categoria === selectedCategory));
    }
  }, [selectedCategory, apps]);

  return (
    <main className="min-h-screen bg-black relative">
      {/* Gradientes e padrões de fundo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <ParticlesAnimation />
      </div>

      <AppsNavbar />
      
      <div className="container mx-auto px-4 pt-32 pb-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Título e Descrição */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Nossos Aplicativos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Explore nossa coleção de aplicativos projetados para otimizar seus processos e impulsionar sua produtividade.
            </motion.p>
          </div>

          {/* Barra de Categorias */}
          <CategoryBar 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Grid de Apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/apps/${app.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300 relative group">
                    <div className="flex items-center gap-4 mb-4">
                      {app.icone && (
                        <div className="w-12 h-12 flex items-center justify-center">
                          <img 
                            src={app.icone} 
                            alt={`Ícone do ${app.nome}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-white">{app.nome}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-zinc-700/50 text-emerald-400 text-sm font-medium rounded-full">
                        {app.categoria}
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {app.descricao}
                    </p>

                    <div className="flex justify-end">
                      <span className="text-emerald-500 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
