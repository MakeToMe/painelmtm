"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import Image from "next/image";

type LoginMethod = 'whatsapp' | 'email';
type ModalState = 'login' | 'criarConta';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: 'login' | 'criarConta';
}

export function LoginModal({ isOpen, onClose, initialState = 'login' }: LoginModalProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('whatsapp');
  const [modalState, setModalState] = useState<ModalState>(initialState);

  // Força o estado inicial quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setModalState(initialState);
    }
  }, [isOpen, initialState]);

  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    nome: '',
    documento: '',
    senha: ''
  });

  // Função para formatar número de WhatsApp
  const formatWhatsApp = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  // Função para formatar CPF/CNPJ
  const formatDocument = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      return value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      value = formatWhatsApp(value);
    } else if (field === 'documento') {
      value = formatDocument(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="relative w-full max-w-5xl rounded-2xl bg-zinc-900 p-6 shadow-xl my-4">
            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 transition-colors bg-zinc-800/50 z-50"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-zinc-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Lado Esquerdo - Imagem */}
              <div className="lg:flex-1 relative rounded-xl overflow-hidden h-48 lg:h-auto">
                <Transition
                  show={true}
                  enter="transition-opacity duration-500"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-500"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <img 
                    src={modalState === 'login' 
                      ? "https://studio.rardevops.com/storage/v1/object/public/mtm/login.jpg"
                      : "https://studio.rardevops.com/storage/v1/object/public/mtm/criar_conta.jpg"
                    }
                    alt={modalState === 'login' ? "Login" : "Criar Conta"}
                    className="w-full h-full object-cover"
                  />
                </Transition>
              </div>

              {/* Lado Direito - Formulário */}
              <div className="lg:flex-1 flex flex-col justify-between items-center py-4 lg:py-8">
                <div className="w-full flex flex-col items-center">
                  {/* Ícone */}
                  <div className="w-16 lg:w-20 h-16 lg:h-20 bg-zinc-800/50 rounded-2xl p-4 backdrop-blur-sm border border-zinc-700/50 mb-4 lg:mb-6">
                    {modalState === 'login' ? (
                      <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                      </svg>
                    ) : (
                      <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                  </div>

                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                    {modalState === 'login' ? 'Bem-vindo de volta!' : 'Criar Conta'}
                  </h2>

                  {modalState === 'login' && (
                    <p className="text-sm lg:text-base text-gray-400 mb-6 lg:mb-8 text-center">
                      Escolha como deseja fazer login
                    </p>
                  )}

                  {modalState === 'login' ? (
                    <>
                      {/* Container dos botões de escolha */}
                      <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg mb-6 lg:mb-8 w-full">
                        <button 
                          onClick={() => setLoginMethod('whatsapp')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-4 py-2 rounded-md transition-all duration-300 ${
                            loginMethod === 'whatsapp' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <svg className="w-4 lg:w-5 h-4 lg:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                          </svg>
                          <span className="text-sm lg:text-base">WhatsApp</span>
                        </button>
                        <button 
                          onClick={() => setLoginMethod('email')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-4 py-2 rounded-md transition-all duration-300 ${
                            loginMethod === 'email' 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <svg className="w-4 lg:w-5 h-4 lg:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          <span className="text-sm lg:text-base">E-mail</span>
                        </button>
                      </div>

                      {/* Input de Login */}
                      <div className="w-full mb-6 lg:mb-8">
                        <input
                          type={loginMethod === 'email' ? 'email' : 'tel'}
                          placeholder={loginMethod === 'email' ? 'Digite seu E-mail' : 'Digite seu WhatsApp'}
                          value={loginMethod === 'email' ? formData.email : formData.whatsapp}
                          onChange={(e) => handleInputChange(loginMethod === 'email' ? 'email' : 'whatsapp', e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                        />
                      </div>
                    </>
                  ) : (
                    // Formulário de Criar Conta
                    <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 w-full">
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      />
                      <input
                        type="text"
                        placeholder="CPF ou CNPJ"
                        value={formData.documento}
                        onChange={(e) => handleInputChange('documento', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      />
                      <input
                        type="password"
                        placeholder="Senha"
                        value={formData.senha}
                        onChange={(e) => handleInputChange('senha', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      />
                    </div>
                  )}

                  {/* Botão Confirmar */}
                  <button 
                    className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm lg:text-base"
                  >
                    CONFIRMAR
                  </button>
                </div>

                {/* Botão Alternar Estado */}
                <button 
                  onClick={() => setModalState(state => state === 'login' ? 'criarConta' : 'login')}
                  className="w-full px-6 py-3 bg-transparent hover:bg-zinc-800 text-gray-400 hover:text-white font-medium rounded-lg transition-colors border border-zinc-700 mt-6 lg:mt-8 text-sm lg:text-base"
                >
                  {modalState === 'login' ? 'CRIAR CONTA' : 'FAZER LOGIN'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
