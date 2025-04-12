'use client'

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useRef } from "react";
import { RiServerLine, RiArrowDownSLine } from 'react-icons/ri';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

interface User {
  uid: string;
  nome: string;
  email: string;
}

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serverData: ServerFormData) => void;
}

export interface ServerFormData {
  nome: string;
  sistema: string;
  ip: string;
  senha?: string;
  cpu: number;
  ram: number;
  banda: number;
  storage: number;
  location: string;
  providerLoginUrl: string;
  providerLogin: string;
  providerPassword: string;
  titular?: string; // ID do usuário titular (apenas para admin)
  tipo: 'Computação' | 'Armazenamento'; // Novo campo para o tipo de servidor
}

export function AddServerModal({ isOpen, onClose, onSave }: AddServerModalProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.admin === true;
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tipoDropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<ServerFormData>({
    nome: '',
    sistema: '',
    ip: '',
    senha: '',
    cpu: 1,
    ram: 1,
    banda: 1,
    storage: 10,
    location: '',
    providerLoginUrl: '',
    providerLogin: '',
    providerPassword: '',
    titular: '',
    tipo: 'Computação' // Valor padrão
  });

  // Buscar usuários se o usuário for admin
  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchUsers();
    }
  }, [isAdmin, isOpen]);

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      // Usar a mesma abordagem do sistema, passando uid e isAdmin como parâmetros
      const response = await fetch(`/api/users?uid=${profile?.uid}&isAdmin=true`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar usuários');
      }
      
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
        // Define o usuário atual como titular padrão se não houver titular definido
        if (!formData.titular && profile?.uid) {
          setFormData(prev => ({ ...prev, titular: profile.uid }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedUser = users.find(user => user.uid === formData.titular);

  // Fechar dropdown quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (tipoDropdownRef.current && !tipoDropdownRef.current.contains(event.target as Node)) {
        setShowTipoDropdown(false);
      }
    }

    // Adicionar listener apenas quando algum dropdown estiver aberto
    if (showUserDropdown || showTipoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showTipoDropdown]);

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-white">Adicionar Servidor</h2>
                    
                    {/* Dropdown de seleção de tipo - visível para todos */}
                    <div className="relative ml-3" ref={tipoDropdownRef}>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-muted/20 border border-border/50 rounded-md shadow-sm hover:bg-muted/30 focus:outline-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTipoDropdown(!showTipoDropdown);
                        }}
                      >
                        <span className="truncate max-w-[120px]">
                          {formData.tipo}
                        </span>
                        <RiArrowDownSLine className="text-muted-foreground" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {showTipoDropdown && (
                        <div 
                          className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-card/95 backdrop-blur-sm border border-border/50 z-50 max-h-60 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {['Computação', 'Armazenamento'].map((tipo) => (
                              <button
                                key={tipo}
                                type="button"
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted/40 ${
                                  formData.tipo === tipo ? 'bg-primary/20 text-white' : 'text-white'
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleInputChange('tipo', tipo);
                                  setShowTipoDropdown(false);
                                }}
                              >
                                {tipo}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Dropdown de seleção de usuário - apenas para admin */}
                    {isAdmin && (
                      <div className="relative ml-3" ref={dropdownRef}>
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-muted/20 border border-border/50 rounded-md shadow-sm hover:bg-muted/30 focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserDropdown(!showUserDropdown);
                          }}
                        >
                          <span className="truncate max-w-[120px]">
                            {isUsersLoading 
                              ? 'Carregando...' 
                              : selectedUser?.nome || 'Selecionar usuário'}
                          </span>
                          <RiArrowDownSLine className="text-muted-foreground" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {showUserDropdown && (
                          <div 
                            className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-card/95 backdrop-blur-sm border border-border/50 z-50 max-h-60 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              {users.map((user) => (
                                <button
                                  key={user.uid}
                                  type="button"
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted/40 ${
                                    formData.titular === user.uid ? 'bg-primary/20 text-white' : 'text-white'
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleInputChange('titular', user.uid);
                                    setShowUserDropdown(false);
                                  }}
                                >
                                  <div className="font-medium">{user.nome}</div>
                                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-white"
                    variant="ghost"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="space-y-6">
                    {/* Primeira linha - Nome e Sistema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome de referência */}
                      <div>
                        <label className="text-sm text-muted-foreground">Nome de referência</label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          placeholder="Informe um nome amigável"
                          autoComplete="off"
                        />
                      </div>

                      {/* Sistema Operacional */}
                      <div>
                        <label className="text-sm text-muted-foreground">Sistema Operacional</label>
                        <Input
                          value={formData.sistema}
                          onChange={(e) => handleInputChange('sistema', e.target.value)}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          placeholder="Ex.: Ubuntu 20"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Segunda linha - IP e Localidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* IP da VM */}
                      <div>
                        <label className="text-sm text-muted-foreground">Informe o IP da VM</label>
                        <Input
                          value={formData.ip}
                          onChange={(e) => handleInputChange('ip', e.target.value)}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          placeholder="11.11.11.11"
                          autoComplete="off"
                        />
                      </div>
                      
                      {/* Localidade */}
                      <div>
                        <label className="text-sm text-muted-foreground">Localidade</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          placeholder="Ex: Nova York"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Terceira linha - CPU e RAM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quantidade de CPU */}
                      <div>
                        <label className="text-sm text-muted-foreground">Quantidade de CPU</label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={formData.cpu}
                          onChange={(e) => handleInputChange('cpu', parseInt(e.target.value))}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          autoComplete="off"
                        />
                      </div>

                      {/* Quantidade de RAM */}
                      <div>
                        <label className="text-sm text-muted-foreground">Quantidade de RAM</label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={formData.ram}
                          onChange={(e) => handleInputChange('ram', parseInt(e.target.value))}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Quarta linha - Banda e Storage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quantidade de banda */}
                      <div>
                        <label className="text-sm text-muted-foreground">Quantidade de banda</label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={formData.banda}
                          onChange={(e) => handleInputChange('banda', parseInt(e.target.value))}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          autoComplete="off"
                        />
                      </div>

                      {/* Espaço em disco */}
                      <div>
                        <label className="text-sm text-muted-foreground">Espaço em disco</label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={formData.storage}
                          onChange={(e) => handleInputChange('storage', parseInt(e.target.value))}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Senha */}
                    <div>
                      <label className="text-sm text-muted-foreground">Senha</label>
                      <Input
                        type="password"
                        value={formData.senha}
                        onChange={(e) => handleInputChange('senha', e.target.value)}
                        className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                        placeholder="••••••••••"
                        autoComplete="new-password"
                      />
                    </div>

                    {/* Informações do Provedor - disponível para todos os usuários */}
                    <div className="mt-2 pt-4 border-t border-border/30">
                      <h4 className="text-sm font-medium text-white mb-4">Informações do Provedor</h4>
                      
                      {/* URL de login do provedor */}
                      <div className="mb-4">
                        <label className="text-sm text-muted-foreground">URL de login do provedor</label>
                        <Input
                          value={formData.providerLoginUrl}
                          onChange={(e) => handleInputChange('providerLoginUrl', e.target.value)}
                          className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          placeholder="https://painel.provedor.com/login"
                          autoComplete="off"
                        />
                      </div>

                      {/* Login e Senha do provedor */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Login do provedor */}
                        <div>
                          <label className="text-sm text-muted-foreground">Login do provedor</label>
                          <Input
                            value={formData.providerLogin}
                            onChange={(e) => handleInputChange('providerLogin', e.target.value)}
                            className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                            placeholder="usuario@provedor.com"
                            autoComplete="off"
                          />
                        </div>

                        {/* Senha do provedor */}
                        <div>
                          <label className="text-sm text-muted-foreground">Senha do provedor</label>
                          <Input
                            type="password"
                            value={formData.providerPassword}
                            onChange={(e) => handleInputChange('providerPassword', e.target.value)}
                            className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                            placeholder="••••••••••"
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                      onClick={onClose}
                    >
                      CANCELAR
                    </Button>
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="flex-1 btn-neomorphic bg-[#1E9A4F] text-white hover:bg-[#1E9A4F]/90 active:bg-[#1E9A4F]/80 transition-all duration-200"
                    >
                      SALVAR
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
