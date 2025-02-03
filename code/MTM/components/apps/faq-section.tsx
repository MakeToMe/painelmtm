'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqText: string;
}

export function FAQSection({ faqText }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Parse FAQ text into question/answer pairs
  const parseFAQ = (text: string): FAQItem[] => {
    console.log('Parsing FAQ text:', text); // Debug log

    if (!text) {
      console.log('No FAQ text provided');
      return [];
    }

    const items: FAQItem[] = [];
    // Primeiro, divide por linhas e remove linhas vazias
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    console.log('Lines after split:', lines); // Debug log

    let currentQuestion = '';
    let currentAnswer = '';
    
    for (const line of lines) {
      // Remove numeração se existir (e.g., "1. ")
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      
      // Se a linha termina com ? é uma pergunta
      if (cleanLine.endsWith('?')) {
        if (currentQuestion && currentAnswer) {
          items.push({ 
            question: currentQuestion, 
            answer: currentAnswer.trim() 
          });
          currentAnswer = '';
        }
        currentQuestion = cleanLine;
      } else if (currentQuestion) {
        // Se já temos uma pergunta, isso é parte da resposta
        currentAnswer += (currentAnswer ? '\n' : '') + cleanLine;
      }
    }
    
    // Adiciona o último item se existir
    if (currentQuestion && currentAnswer) {
      items.push({ 
        question: currentQuestion, 
        answer: currentAnswer.trim() 
      });
    }

    console.log('Parsed FAQ items:', items); // Debug log
    
    return items;
  };

  const faqItems = parseFAQ(faqText);

  console.log('FAQ Items length:', faqItems.length); // Debug log

  if (!faqItems.length) {
    console.log('No FAQ items found, returning null'); // Debug log
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full py-8" id="faq">
      <h2 className="text-3xl font-bold text-emerald-500 mb-8">Perguntas Frequentes</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-white font-medium pr-8">{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-emerald-500 transform transition-transform duration-200 flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 py-4 text-zinc-300 border-t border-zinc-800 bg-zinc-800/30">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
