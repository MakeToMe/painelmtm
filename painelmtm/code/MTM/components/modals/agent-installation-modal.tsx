'use client'

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { RiCheckboxCircleLine, RiErrorWarningLine, RiLoader4Line } from 'react-icons/ri';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface AgentInstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverData: {
    uid: string;
    ip: string;
    nome: string;
    user_ssh: string;
    senha: string;
  };
}

interface ServerStatus {
  papel: string | null;
  cpu: number | null;
  ram: number | null;
  storage: number | null;
  sistema: string | null;
  status: string | null;
}

export function AgentInstallationModal({ isOpen, onClose, serverData }: AgentInstallationModalProps) {
  const { profile } = useAuth();
  const [installationStep, setInstallationStep] = useState<'connecting' | 'collecting' | 'installing' | 'completed' | 'error'>('connecting');
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Função para monitorar o status do servidor em tempo real
  useEffect(() => {
    if (!isOpen || !serverData?.uid) return;
    
    // Resetar estados
    setInstallationStep('connecting');
    setServerStatus(null);
    setErrorMessage(null);
    setElapsedTime(0);
    
    // Iniciar timer para o tempo decorrido
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Referência para os intervalos
    const intervals: {[key: string]: NodeJS.Timeout} = {};
    
    // Iniciar o processo de instalação do agente
    const startInstallation = async () => {
      try {
        // Verificar se já existe um agente instalado
        const serverAlreadyConfigured = await checkServerInitialStatus();
        if (serverAlreadyConfigured) return;
        
        // Iniciar conexão SSH e executar o comando de instalação
        const response = await fetch('/api/ssh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ip: serverData.ip,
            user: serverData.user_ssh,
            password: serverData.senha,
            serverId: serverData.uid
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Erro ao conectar via SSH:', data.error);
          setErrorMessage(data.error || 'Falha ao conectar com o servidor');
          setInstallationStep('error');
          return;
        }
        
        console.log('Conexão SSH iniciada com sucesso');
        
        // Iniciar o polling para verificar o status do servidor
        startPolling();
      } catch (error) {
        console.error('Erro ao iniciar instalação:', error);
        setErrorMessage('Falha ao iniciar o processo de instalação');
        setInstallationStep('error');
      }
    };
    
    // Verificar status inicial do servidor
    const checkServerInitialStatus = async () => {
      try {
        if (!profile?.uid) return false;
        
        const response = await fetch(`/api/servidores?uid=${profile.uid}&id=${serverData.uid}`);
        if (!response.ok) return false;
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const server = data[0];
          
          // Se o servidor já tem o papel final definido, pular para completed
          if (['Manager', 'Worker', 'Servidor Web'].includes(server.papel || '')) {
            setServerStatus({
              papel: server.papel,
              cpu: server.cpu,
              ram: server.ram,
              storage: server.storage,
              sistema: server.sistema,
              status: server.status
            });
            setInstallationStep('completed');
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.error('Erro ao verificar status inicial:', error);
        return false;
      }
    };
    
    // Função para verificar periodicamente o status do servidor
    const startPolling = () => {
      intervals.polling = setInterval(async () => {
        try {
          if (!profile?.uid) return;
          
          const response = await fetch(`/api/servidores?uid=${profile.uid}&id=${serverData.uid}`);
          if (!response.ok) return;
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            const server = data[0];
            
            // Atualizar o estado do servidor com os dados mais recentes
            const newServerState = {
              papel: server.papel,
              cpu: server.cpu,
              ram: server.ram,
              storage: server.storage,
              sistema: server.sistema,
              status: server.status
            };
            
            // Atualizar o estado do servidor para exibição
            setServerStatus(newServerState);
            
            // Verificar o valor de papel para determinar a etapa atual
            if (server.papel === 'login') {
              // Etapa de conexão concluída
              setInstallationStep('collecting');
              console.log('Etapa de conexão concluída: papel = login');
            } 
            else if (server.papel === 'identificado') {
              // Etapa de coleta concluída
              setInstallationStep('installing');
              console.log('Etapa de coleta concluída: papel = identificado');
            } 
            else if (server.papel && server.papel.toLowerCase() === 'agente') {
              // Continuar na etapa de instalação (com check verde)
              // Usamos um hack visual aqui: definimos como 'completed' e depois voltamos para 'installing'
              // para forçar a atualização do ícone
              setInstallationStep('completed');
              setTimeout(() => {
                setInstallationStep('installing');
              }, 100);
              console.log('Etapa de instalação em andamento: papel = agente');
            } 
            else if (['Manager', 'Worker', 'Servidor Web'].includes(server.papel || '')) {
              // Instalação concluída
              setInstallationStep('completed');
              console.log('Instalação concluída: papel =', server.papel);
              
              // Parar o polling quando a instalação estiver concluída
              if (intervals.polling) {
                clearInterval(intervals.polling);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000); // Verificar a cada 5 segundos
    };
    
    // Iniciar o processo
    startInstallation();
    
    // Limpar todos os intervalos quando o componente for desmontado
    return () => {
      clearInterval(timer);
      
      // Limpar todos os intervalos
      Object.values(intervals).forEach(interval => {
        clearTimeout(interval);
        clearInterval(interval);
      });
    };
  }, [isOpen, serverData?.uid, profile]);
  
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Renderizar ícone baseado no passo atual
  const renderStepIcon = (step: string, currentStep: string) => {
    if (installationStep === 'error') {
      return <RiErrorWarningLine className="h-6 w-6 text-red-500" />;
    }
    
    // Ordem das etapas
    const steps = ['connecting', 'collecting', 'installing', 'completed'];
    
    // Índice da etapa atual e da etapa sendo renderizada
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    // Verificar se a etapa já foi concluída (está antes da etapa atual)
    const isPreviousStep = stepIndex < currentIndex;
    
    // Verificar se é a etapa atual
    const isCurrentStep = step === currentStep;
    
    // Verificar se é a última etapa e está concluída
    const isCompletedFinalStep = step === 'completed' && 
                                currentStep === 'completed' && 
                                serverStatus && 
                                ['Manager', 'Worker', 'Servidor Web'].includes(serverStatus.papel || '');
    
    // Verificar se estamos na etapa de instalação e o papel é 'agente'
    const isAgentInstallStep = step === 'installing' && 
                              serverStatus && 
                              serverStatus.papel && 
                              serverStatus.papel.toLowerCase() === 'agente';
    
    // Etapas anteriores: mostrar check verde (concluídas)
    if (isPreviousStep) {
      return <RiCheckboxCircleLine className="h-6 w-6 text-green-500" />;
    }
    
    // Etapa de instalação com papel 'agente': mostrar check verde
    if (isAgentInstallStep) {
      return <RiCheckboxCircleLine className="h-6 w-6 text-green-500" />;
    }
    
    // Etapa atual: mostrar spinner girando (em progresso)
    if (isCurrentStep && !isCompletedFinalStep && !isAgentInstallStep) {
      return <RiLoader4Line className="h-6 w-6 text-blue-500 animate-spin" />;
    }
    
    // Etapa final concluída: mostrar check verde
    if (isCompletedFinalStep) {
      return <RiCheckboxCircleLine className="h-6 w-6 text-green-500" />;
    }
    
    // Etapas futuras: mostrar círculo vazio
    return <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>;
  };
  
  if (!isOpen) return null;
  
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-card p-6 rounded-lg shadow-lg card-neomorphic w-[95%] max-w-3xl mx-auto my-auto max-h-[85vh] overflow-y-auto max-[500px]:p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Instalando Agente MTM</h2>
                  
                  {/* Só permitir fechar se a instalação estiver completa ou com erro */}
                  {(installationStep === 'error' || (installationStep === 'completed' && serverStatus && ['Manager', 'Worker', 'Servidor Web'].includes(serverStatus.papel || ''))) && (
                    <Button
                      type="button"
                      onClick={onClose}
                      className="text-muted-foreground hover:text-white"
                      variant="ghost"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Servidor:</span>
                    <span className="font-medium">{serverData.nome}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">IP:</span>
                    <span className="font-medium">{serverData.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo decorrido:</span>
                    <span className="font-medium">{formatElapsedTime(elapsedTime)}</span>
                  </div>
                </div>
                
                {/* Passos da instalação */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4">
                    {renderStepIcon('connecting', installationStep)}
                    <div className="flex-1">
                      <h3 className="font-medium">Conectando</h3>
                      <p className="text-sm text-muted-foreground">
                        Estabelecendo conexão segura com o servidor
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {renderStepIcon('collecting', installationStep)}
                    <div className="flex-1">
                      <h3 className="font-medium">Coletando dados</h3>
                      <p className="text-sm text-muted-foreground">
                        Identificando configuração do servidor
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {renderStepIcon('installing', installationStep)}
                    <div className="flex-1">
                      <h3 className="font-medium">Instalando Agente</h3>
                      <p className="text-sm text-muted-foreground">
                        Executando a instalação
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {renderStepIcon('completed', installationStep)}
                    <div className="flex-1">
                      <h3 className="font-medium">Instalação concluída</h3>
                      <p className="text-sm text-muted-foreground">
                        Agente instalado e configurado com sucesso
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Mensagem de erro */}
                {installationStep === 'error' && errorMessage && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
                    <h3 className="font-medium text-red-400 mb-1">Erro na instalação</h3>
                    <p className="text-sm">{errorMessage}</p>
                    {errorMessage.includes('SSH') && (
                      <p className="text-sm mt-2 text-yellow-400">
                        O servidor pode estar inacessível ou as credenciais podem estar incorretas.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Informações do servidor (apenas quando a instalação estiver completamente concluída) */}
                {installationStep === 'completed' && serverStatus && ['Manager', 'Worker', 'Servidor Web'].includes(serverStatus.papel || '') && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-md p-4 mb-6">
                    <h3 className="font-medium text-green-400 mb-3">Informações do Servidor</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Função</p>
                        <p className="font-medium">{serverStatus.papel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sistema</p>
                        <p className="font-medium">{serverStatus.sistema}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPU</p>
                        <p className="font-medium">{serverStatus.cpu} cores</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memória RAM</p>
                        <p className="font-medium">{serverStatus.ram} GB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Armazenamento</p>
                        <p className="font-medium">{serverStatus.storage} GB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{serverStatus.status}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Botões de ação */}
                <div className="flex justify-end gap-3">
                  {installationStep === 'error' && (
                    <>
                      {errorMessage && errorMessage.includes('SSH') && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="btn-neomorphic bg-blue-600 text-white hover:bg-blue-600/90 active:bg-blue-600/80 transition-all duration-200"
                          onClick={() => {
                            // Fechar este modal e voltar para o modal anterior
                            onClose();
                          }}
                        >
                          VOLTAR E EDITAR
                        </Button>
                      )}
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="btn-neomorphic bg-[#1E9A4F] text-white hover:bg-[#1E9A4F]/90 active:bg-[#1E9A4F]/80 transition-all duration-200"
                        onClick={() => {
                          // Reiniciar o processo
                          setInstallationStep('connecting');
                          setErrorMessage(null);
                        }}
                      >
                        TENTAR NOVAMENTE
                      </Button>
                    </>
                  )}
                  
                  {((installationStep === 'completed' && serverStatus && ['Manager', 'Worker', 'Servidor Web'].includes(serverStatus.papel || '')) || installationStep === 'error') && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                      onClick={onClose}
                    >
                      FECHAR
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
