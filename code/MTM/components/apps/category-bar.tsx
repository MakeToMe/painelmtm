'use client';

import { motion } from 'framer-motion';

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  const allCategories = ['Todos', ...categories];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2 min-w-max p-2">
        {allCategories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${selectedCategory === category 
                ? 'bg-emerald-500 text-white' 
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
