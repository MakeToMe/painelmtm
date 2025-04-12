"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

type LoginMethod = 'whatsapp' | 'email';
type ModalState = 'login' | 'criarConta' | 'esqueceuSenha';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: ModalState;
}

export function LoginModal({ isOpen, onClose, initialState = 'login' }: LoginModalProps) {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('whatsapp');
  const [modalState, setModalState] = useState<ModalState>(initialState);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [previewRedirectAttempted, setPreviewRedirectAttempted] = useState(false);

  // Detectar se estamos em um ambiente de preview
  useEffect(() => {
    // Verificar se estamos em um iframe (comum em previews de editores)
    const inIframe = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    };
    
    setIsPreview(inIframe());
  }, []);

  // Força o estado inicial quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setModalState(initialState);
      setLoginSuccess(false);
    }
  }, [isOpen, initialState]);

  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    nome: '',
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

  const handleInputChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      value = formatWhatsApp(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (modalState === 'login') {
        const identifier = loginMethod === 'email' ? formData.email : formData.whatsapp
        
        // Validar dados
        if (!identifier) {
          throw new Error(`${loginMethod === 'email' ? 'Email' : 'WhatsApp'} é obrigatório`)
        }
        if (!formData.senha) {
          throw new Error('Senha é obrigatória')
        }

        console.log('Tentando login com:', {
          identifier,
          loginMethod,
          hasPassword: !!formData.senha
        })

        await signIn(
          identifier,
          formData.senha,
          loginMethod
        )
        console.log('Login bem sucedido');
        
        // Indicar que o login foi bem-sucedido e manter o modal aberto com o spinner
        setLoginSuccess(true);
        
        // Adicionando um atraso para garantir que o token seja processado
        // e a navegação ocorra de forma mais suave
        setTimeout(() => {
          // Se estamos no preview, tentamos abrir o dashboard em uma nova aba
          // e também tentamos navegar normalmente como fallback
          if (isPreview) {
            try {
              // Tentar abrir em nova aba (pode ser bloqueado por pop-up blockers)
              window.open('/dashboard', '_blank');
              setPreviewRedirectAttempted(true);
            } catch (e) {
              console.error("Erro ao tentar abrir nova aba:", e);
            }
            
            // Também tentamos a navegação normal como fallback
            router.push('/dashboard');
          } else {
            // Navegação normal para browsers
            router.push('/dashboard');
          }
          
          // Só fechamos o modal após iniciar a navegação
          setTimeout(() => {
            onClose();
          }, isPreview ? 3000 : 0);
        }, 1500);
      } else if (modalState === 'criarConta') {
        // Validar dados de cadastro
        if (!formData.email) throw new Error('Email é obrigatório')
        if (!formData.senha) throw new Error('Senha é obrigatória')
        if (!formData.nome) throw new Error('Nome é obrigatório')
        if (!formData.whatsapp) throw new Error('WhatsApp é obrigatório')

        await signUp(formData.email, formData.senha, {
          nome: formData.nome,
          whatsapp: formData.whatsapp,
          email: formData.email
        })
        
        // Indicar que o cadastro foi bem-sucedido
        setLoginSuccess(true);
        
        // Adicionando um pequeno atraso para garantir que o token seja processado
        // antes de fechar o modal (a navegação já ocorre no auth-context)
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro no handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.')
      setLoginSuccess(false);
    } finally {
      if (!loginSuccess) {
        setLoading(false);
      }
    }
  }

  // Função para recuperar senha
  const handleRecoverPassword = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('https://rarwhk.rardevops.com/webhook/recovery_pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'recuperarSenha',
          email: formData.email
        })
      })

      const data = await response.json()

      if (data.email === 'incorreto') {
        setError('E-mail não encontrado')
        return
      }

      if (data.email === 'correto') {
        // Mostrar mensagem de sucesso e voltar para login
        alert('Uma nova senha foi enviada para seu e-mail!')
        setModalState('login')
        return
      }

      // Se chegou aqui é porque houve algum erro inesperado
      throw new Error('Erro ao processar sua solicitação')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        {/* Overlay com blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-3xl bg-zinc-900 rounded-2xl overflow-hidden shadow-xl transform transition-all border-4 border-emerald-500">
              {loginSuccess ? (
                // Tela de sucesso com spinner
                <div className="flex flex-col items-center justify-center p-10 h-[400px]">
                  <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-bold text-white mb-2">Autenticação bem-sucedida!</h2>
                  <p className="text-gray-400 text-center mb-2">
                    {isPreview 
                      ? "Tentando navegar para o dashboard..." 
                      : "Redirecionando para o dashboard..."}
                  </p>
                  {isPreview && (
                    <>
                      <p className="text-sm text-emerald-500 text-center mt-2">
                        No ambiente de preview, a navegação pode ser limitada.
                      </p>
                      <button 
                        onClick={() => window.open('/dashboard', '_blank')}
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        Abrir Dashboard em Nova Aba
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-row h-[580px] md:h-[620px]">
                  {/* Lado Esquerdo - Imagem */}
                  <div className="hidden md:block w-1/2 relative overflow-hidden">
                    <Transition
                      show={true}
                      enter="transition-opacity duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                    >
                      <img 
                        src={modalState === 'login' 
                          ? "https://studio.rardevops.com/storage/v1/object/public/mtm/login.jpg"
                          : modalState === 'criarConta' 
                            ? "https://studio.rardevops.com/storage/v1/object/public/mtm/criar_conta.jpg"
                            : "https://studio.rardevops.com/storage/v1/object/public/mtm/password-manager.png"
                        }
                        alt={modalState === 'login' ? "Login" : modalState === 'criarConta' ? "Criar Conta" : "ESQUECEU A SENHA"}
                        className="w-full h-full object-cover"
                      />
                    </Transition>
                  </div>

                  {/* Lado Direito - Formulário */}
                  <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col overflow-y-auto">
                    <div className="flex-1">
                      {/* Botão Fechar */}
                      <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Ícone e Título */}
                      <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto mb-4 lg:mb-6">
                        {modalState === 'login' ? (
                          <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                          </svg>
                        ) : modalState === 'criarConta' ? (
                          <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        ) : (
                          <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                          </svg>
                        )}
                      </div>

                      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                        {modalState === 'login' ? 'Bem-vindo de volta!' : modalState === 'criarConta' ? 'Criar Conta' : 'ESQUECEU A SENHA'}
                      </h2>

                      {modalState === 'login' && (
                        <p className="text-sm lg:text-base text-gray-400 mb-4 lg:mb-6 text-center">
                          Escolha como deseja fazer login
                        </p>
                      )}

                      {modalState === 'login' ? (
                        <>
                          {/* Container dos botões de escolha */}
                          <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg mb-4 w-full">
                            <button 
                              onClick={() => setLoginMethod('whatsapp')}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-4 py-2 rounded-md transition-all duration-300 ${
                                loginMethod === 'whatsapp' 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <svg className="w-4 lg:w-5 h-4 lg:h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
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
                          <div className="w-full space-y-3 mb-4">
                            <input
                              type={loginMethod === 'email' ? 'email' : 'tel'}
                              placeholder={loginMethod === 'email' ? 'Digite seu E-mail' : 'Digite seu WhatsApp'}
                              value={loginMethod === 'email' ? formData.email : formData.whatsapp}
                              onChange={(e) => handleInputChange(loginMethod === 'email' ? 'email' : 'whatsapp', e.target.value)}
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                            />
                            <input
                              type="password"
                              placeholder="Digite sua senha"
                              value={formData.senha}
                              onChange={(e) => handleInputChange('senha', e.target.value)}
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                            />
                          </div>
                        </>
                      ) : modalState === 'criarConta' ? (
                        // Formulário de Criar Conta
                        <div className="space-y-3 mb-4 w-full">
                          <input
                            type="text"
                            placeholder="Nome completo"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
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
                      ) : (
                        // Formulário de ESQUECEU A SENHA
                        <div className="space-y-3 mb-4 w-full">
                          <input
                            type="email"
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                          />
                        </div>
                      )}

                      {/* Botão Confirmar */}
                      <form onSubmit={modalState === 'esqueceuSenha' ? handleRecoverPassword : handleSubmit}>
                        <button 
                          type="submit"
                          disabled={loading}
                          className={`w-full px-4 py-2.5 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm lg:text-base mb-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                              <span>PROCESSANDO...</span>
                            </div>
                          ) : modalState === 'esqueceuSenha' ? 'RECUPERAR SENHA' : 'CONFIRMAR'}
                        </button>
                      </form>

                      {/* Mensagem de erro */}
                      {error && (
                        <p className="mt-1 mb-2 text-red-500 text-sm text-center">
                          {error}
                        </p>
                      )}

                      {/* Botões de Ação - Sempre visíveis no final */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            if (modalState === 'login') {
                              setModalState('criarConta')
                            } else if (modalState === 'criarConta') {
                              setModalState('login')
                            } else {
                              setModalState('login')
                            }
                          }}
                          className="w-full px-4 py-2.5 md:px-6 md:py-3 bg-transparent hover:bg-zinc-800 text-gray-400 hover:text-white font-medium rounded-lg transition-colors border border-zinc-700 text-sm lg:text-base"
                        >
                          {modalState === 'login' ? 'CRIAR CONTA' : modalState === 'criarConta' ? 'FAZER LOGIN' : 'VOLTAR PARA LOGIN'}
                        </button>

                        {modalState === 'login' && (
                          <button 
                            onClick={() => setModalState('esqueceuSenha')}
                            className="w-full px-4 py-2.5 md:px-6 md:py-3 bg-transparent hover:bg-zinc-800 text-gray-400 hover:text-white font-medium rounded-lg transition-colors border border-zinc-700 text-sm lg:text-base"
                          >
                            ESQUECEU A SENHA?
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
