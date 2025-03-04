'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RiUserLine, RiMailLine, RiWhatsappLine, RiMapPinLine, RiLockPasswordLine, RiLoader4Line } from 'react-icons/ri'
import { KeyRound, AlertTriangle, UserX } from "lucide-react"
import { toast } from 'sonner'
import { MtmUser } from '@/types/user'

// Componente de badge de verificação
const VerificationBadge = ({ isVerified }: { isVerified: boolean }) => (
  <Badge 
    className={`
      ${isVerified 
        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30' 
        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'}
      shadow-sm card-neomorphic px-2 py-0.5
    `}
  >
    {isVerified ? "Verificado" : "Não Verificado"}
  </Badge>
)

export default function PerfilPage() {
  const { profile } = useAuth()
  const [formData, setFormData] = useState<Partial<MtmUser>>(profile || {})
  const [dirtyBlocks, setDirtyBlocks] = useState<{
    pessoal: boolean;
    contato: boolean;
    endereco: boolean;
    seguranca: boolean;
    integracoes: boolean;
  }>({
    pessoal: false,
    contato: false,
    endereco: false,
    seguranca: false,
    integracoes: false
  })
  const [isEmailVerified, setIsEmailVerified] = useState(profile?.email_valid || false)
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(profile?.whatsapp_valid || false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savingBlock, setSavingBlock] = useState<string | null>(null)
  const [integracoes, setIntegracoes] = useState<Array<{
    uid?: string;
    nome: string;
    chave: string;
    secret: string;
    url: string;
    origem: string;
  }>>([])
  const [novaIntegracao, setNovaIntegracao] = useState({
    nome: '',
    chave: '',
    secret: '',
    url: '',
    origem: 'api'
  })
  const [adicionandoIntegracao, setAdicionandoIntegracao] = useState(false)
  const [editandoIntegracao, setEditandoIntegracao] = useState<string | null>(null)
  const [excluindoIntegracao, setExcluindoIntegracao] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      // Mapear o perfil
      const mappedProfile = {
        ...profile
      };
      setFormData(mappedProfile);
      setIsEmailVerified(profile.email_valid || false);
      setIsWhatsAppVerified(profile.whatsapp_valid || false);
      
      // Carregar integrações do usuário
      fetchIntegracoes();
    }
  }, [profile])

  const fetchIntegracoes = async () => {
    if (!profile?.uid) return;
    
    try {
      const response = await fetch(`/api/integracoes?uid=${profile.uid}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro ao buscar integrações:', data.error);
        return;
      }
      
      setIntegracoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, blockType: 'pessoal' | 'contato' | 'endereco' | 'seguranca' | 'integracoes') => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setDirtyBlocks(prev => ({ ...prev, [blockType]: true }))
  }

  const handleSave = async (blockType: 'pessoal' | 'contato' | 'endereco' | 'seguranca' | 'integracoes') => {
    console.log(`Iniciando salvamento do bloco: ${blockType}`)
    setSavingBlock(blockType)
    setIsSubmitting(true)
    try {
      // Garantir que o UID esteja presente nos dados
      if (!formData.uid && profile?.uid) {
        setFormData(prev => ({ ...prev, uid: profile.uid }))
      }
      
      // Criar uma cópia dos dados com o UID garantido
      const dataToSave = { 
        ...formData,
        uid: formData.uid || profile?.uid 
      };
      
      console.log('Dados a serem salvos:', dataToSave)

      if (!dataToSave.uid) {
        console.error('UID não disponível para salvar o perfil')
        toast.error('Erro ao salvar: UID não disponível')
        return
      }

      // Chama a API route ao invés do Supabase diretamente
      console.log('Enviando requisição para a API...')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      })

      const result = await response.json()
      console.log('Resposta da API:', result)

      if (!response.ok) {
        console.error('Erro ao salvar perfil:', result.error)
        console.error('Detalhes do erro:', result.details || 'Sem detalhes adicionais')
        toast.error(`Erro ao salvar alterações: ${result.error}`)
        return
      }

      console.log('Perfil atualizado com sucesso:', result)
      toast.success('Alterações salvas com sucesso!')
      setDirtyBlocks(prev => ({ ...prev, [blockType]: false }))
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error(`Erro ao salvar alterações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
      setSavingBlock(null)
    }
  }

  const fetchAddressByCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '')
    
    // Verifica se tem 8 dígitos
    if (cleanCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
          cep: data.cep // Formato com hífen
        }))
        setDirtyBlocks(prev => ({ ...prev, endereco: true }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setIsLoadingCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    handleInputChange(e, 'endereco')
    
    const cleanCep = value.replace(/\D/g, '')
    
    // Se o CEP tem 8 dígitos, busca o endereço
    if (cleanCep.length === 8) {
      fetchAddressByCep(value)
    } 
    // Se o CEP foi apagado, limpa os campos de endereço
    else if (cleanCep.length === 0) {
      setFormData(prev => ({
        ...prev,
        rua: '',
        bairro: '',
        cidade: '',
        uf: ''
      }))
      setDirtyBlocks(prev => ({ ...prev, endereco: true }))
    }
  }

  return (
    <div className={`p-4 ${dirtyBlocks.pessoal || dirtyBlocks.contato || dirtyBlocks.endereco || dirtyBlocks.seguranca || dirtyBlocks.integracoes ? 'pb-24' : 'pb-4'} max-w-7xl mx-auto`}>
      <div className="bg-card rounded-lg p-6 mb-6 flex items-center gap-6 card-neomorphic">
        <div className="relative">
          <div className="rounded-full overflow-hidden border-4 border-border/30 shadow-lg">
            <Image
              src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
              alt="Foto de perfil"
              width={100}
              height={100}
              className="rounded-full"
              priority
            />
          </div>
          <button 
            className="absolute bottom-0 right-0 bg-button-dark text-white p-2 rounded-full hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 btn-neomorphic"
            title="Alterar foto"
          >
            <RiUserLine size={18} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{formData.nome}</h1>
          <p className="text-muted-foreground">{formData.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <section className="bg-card rounded-lg p-6 card-neomorphic">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="p-2 rounded-lg bg-button-dark/50 shadow-inner card-neomorphic">
              <RiUserLine className="text-primary" size={20} />
            </div>
            Informações Pessoais
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Nome Completo</label>
              <Input
                name="nome"
                value={formData.nome || ''}
                onChange={(e) => handleInputChange(e, 'pessoal')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Documento</label>
              <Input
                name="documento"
                value={formData.documento || ''}
                onChange={(e) => handleInputChange(e, 'pessoal')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
          </div>
          {dirtyBlocks.pessoal && (
            <div className="mt-6 flex justify-end">
              <Button 
                type="button" 
                onClick={() => handleSave('pessoal')}
                disabled={isSubmitting}
                className={`btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 ${savingBlock === 'pessoal' ? 'opacity-80' : ''}`}
              >
                {savingBlock === 'pessoal' ? (
                  <>
                    <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Contato */}
        <section className="bg-card rounded-lg p-6 card-neomorphic">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="p-2 rounded-lg bg-button-dark/50 shadow-inner card-neomorphic">
              <RiMailLine className="text-primary" size={20} />
            </div>
            Contato
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm text-muted-foreground">Email</label>
                <VerificationBadge isVerified={isEmailVerified} />
              </div>
              <Input
                name="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange(e, 'contato')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm text-muted-foreground">WhatsApp</label>
                <VerificationBadge isVerified={isWhatsAppVerified} />
              </div>
              <Input
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={(e) => handleInputChange(e, 'contato')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
          </div>
          {dirtyBlocks.contato && (
            <div className="mt-6 flex justify-end">
              <Button 
                type="button" 
                onClick={() => handleSave('contato')}
                disabled={isSubmitting}
                className={`btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 ${savingBlock === 'contato' ? 'opacity-80' : ''}`}
              >
                {savingBlock === 'contato' ? (
                  <>
                    <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Endereço */}
        <section className="bg-card rounded-lg p-6 card-neomorphic">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="p-2 rounded-lg bg-button-dark/50 shadow-inner card-neomorphic">
              <RiMapPinLine className="text-primary" size={20} />
            </div>
            Endereço
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">CEP</label>
              <Input
                name="cep"
                value={formData.cep || ''}
                onChange={handleCepChange}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">UF</label>
              <Input
                name="uf"
                value={formData.uf || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Cidade</label>
              <Input
                name="cidade"
                value={formData.cidade || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Bairro</label>
              <Input
                name="bairro"
                value={formData.bairro || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Rua</label>
              <Input
                name="rua"
                value={formData.rua || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                disabled={isLoadingCep}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Número</label>
              <Input
                name="numero"
                value={formData.numero || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Complemento</label>
              <Input
                name="complemento"
                value={formData.complemento || ''}
                onChange={(e) => handleInputChange(e, 'endereco')}
                className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
              />
            </div>
          </div>
          {dirtyBlocks.endereco && (
            <div className="mt-6 flex justify-end">
              <Button 
                type="button" 
                onClick={() => handleSave('endereco')}
                disabled={isSubmitting}
                className={`btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 ${savingBlock === 'endereco' ? 'opacity-80' : ''}`}
              >
                {savingBlock === 'endereco' ? (
                  <>
                    <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Integrações */}
        <section className="bg-card rounded-lg p-6 card-neomorphic">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-button-dark/50 shadow-inner card-neomorphic">
              <svg className="text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13C10.8284 13 11.5 13.6716 11.5 14.5C11.5 15.3284 10.8284 16 10 16H6C5.17157 16 4.5 15.3284 4.5 14.5C4.5 13.6716 5.17157 13 6 13H10Z" fill="currentColor"/>
                <path d="M14 11C13.1716 11 12.5 10.3284 12.5 9.5C12.5 8.67157 13.1716 8 14 8H18C18.8284 8 19.5 8.67157 19.5 9.5C19.5 10.3284 18.8284 11 18 11H14Z" fill="currentColor"/>
                <path d="M13.5 9.5C13.5 10.0523 13.0523 10.5 12.5 10.5C11.9477 10.5 11.5 10.0523 11.5 9.5V8.5C11.5 7.94772 11.9477 7.5 12.5 7.5C13.0523 7.5 13.5 7.94772 13.5 8.5V9.5Z" fill="currentColor"/>
                <path d="M12.5 16.5C13.0523 16.5 13.5 16.0523 13.5 15.5V14.5C13.5 13.9477 13.0523 13.5 12.5 13.5C11.9477 13.5 11.5 13.9477 11.5 14.5V15.5C11.5 16.0523 11.9477 16.5 12.5 16.5Z" fill="currentColor"/>
              </svg>
            </div>
            Integrações
          </h2>
          
          {/* Botão para adicionar nova integração */}
          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200"
              onClick={() => setAdicionandoIntegracao(true)}
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Nova Integração
            </Button>
          </div>
            
          {/* Formulário para adicionar nova integração */}
          {adicionandoIntegracao && (
            <div className="mt-4 p-4 bg-muted/10 rounded-md border border-border/30 card-neomorphic">
              <h3 className="text-md font-semibold mb-3 text-white">Nova Integração</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <Input
                    value={novaIntegracao.nome}
                    onChange={(e) => setNovaIntegracao(prev => ({ ...prev, nome: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder="Nome da integração"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Chave</label>
                  <Input
                    value={novaIntegracao.chave}
                    onChange={(e) => setNovaIntegracao(prev => ({ ...prev, chave: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder="Chave de API"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Secret</label>
                  <Input
                    type="password"
                    value={novaIntegracao.secret}
                    onChange={(e) => setNovaIntegracao(prev => ({ ...prev, secret: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder="Secret (opcional)"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">URL</label>
                  <Input
                    value={novaIntegracao.url}
                    onChange={(e) => setNovaIntegracao(prev => ({ ...prev, url: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder="URL da API (opcional)"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200"
                    onClick={async () => {
                      if (!novaIntegracao.nome || !novaIntegracao.chave) {
                        toast.error('Nome e chave são obrigatórios');
                        return;
                      }
                      
                      setIsSubmitting(true);
                      try {
                        const response = await fetch('/api/integracoes', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            titular: profile?.uid,
                            ...novaIntegracao
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          toast.error(`Erro ao salvar integração: ${data.error}`);
                          return;
                        }
                        
                        toast.success('Integração salva com sucesso!');
                        setNovaIntegracao({
                          nome: '',
                          chave: '',
                          secret: '',
                          url: '',
                          origem: 'api'
                        });
                        setAdicionandoIntegracao(false);
                        fetchIntegracoes();
                      } catch (error) {
                        console.error('Erro ao salvar integração:', error);
                        toast.error(`Erro ao salvar integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                    onClick={() => {
                      setAdicionandoIntegracao(false);
                      setNovaIntegracao({
                        nome: '',
                        chave: '',
                        secret: '',
                        url: '',
                        origem: 'api'
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
            
          {/* Lista de integrações existentes */}
          {integracoes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-3 text-white">Integrações Existentes</h3>
              <div className="space-y-3">
                {integracoes.map((integracao) => (
                  <div key={integracao.uid} className="p-3 bg-muted/10 rounded-md border border-border/30 card-neomorphic">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-white">{integracao.nome}</h4>
                        <p className="text-xs text-muted-foreground">Origem: {integracao.origem}</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Botão de Visualizar/Editar */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="btn-neomorphic bg-button-dark/50 text-primary hover:bg-button-dark/70 active:bg-button-dark/80 border-primary/30"
                          onClick={() => setEditandoIntegracao(integracao.uid || null)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        {/* Botão de Excluir */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="btn-neomorphic bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30"
                          onClick={() => setExcluindoIntegracao(integracao.uid || null)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dirtyBlocks.integracoes && (
            <div className="mt-6 flex justify-end">
              <Button 
                type="button" 
                onClick={() => handleSave('integracoes')}
                disabled={isSubmitting}
                className={`btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 ${savingBlock === 'integracoes' ? 'opacity-80' : ''}`}
              >
                {savingBlock === 'integracoes' ? (
                  <>
                    <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          )}
        </section>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {excluindoIntegracao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirmação de Exclusão
            </h3>
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-4">
              <p className="text-sm text-red-400 font-bold mb-2">ESTA AÇÃO É IRREVERSÍVEL</p>
              <p className="text-sm text-red-400">
                Todos os dados desta integração serão permanentemente excluídos.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 btn-neomorphic bg-red-900/50 text-red-400 hover:bg-red-900/70 active:bg-red-900/80 border-red-500/30"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/integracoes?id=${excluindoIntegracao}&uid=${profile?.uid}`, {
                      method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                      toast.error(`Erro ao excluir integração: ${data.error}`);
                      return;
                    }
                    
                    toast.success('Integração excluída com sucesso!');
                    fetchIntegracoes();
                  } catch (error) {
                    console.error('Erro ao excluir integração:', error);
                    toast.error(`Erro ao excluir integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                  } finally {
                    setExcluindoIntegracao(null);
                  }
                }}
              >
                EXCLUIR
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40"
                onClick={() => setExcluindoIntegracao(null)}
              >
                CANCELAR
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edição de integração */}
      {editandoIntegracao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Detalhes da Integração
            </h3>
            
            {integracoes.filter(i => i.uid === editandoIntegracao).map(integracao => (
              <div key={integracao.uid} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <Input
                    value={integracao.nome}
                    onChange={(e) => {
                      const updatedIntegracoes = integracoes.map(i => 
                        i.uid === editandoIntegracao ? { ...i, nome: e.target.value } : i
                      );
                      setIntegracoes(updatedIntegracoes);
                      setDirtyBlocks(prev => ({ ...prev, integracoes: true }));
                    }}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Chave</label>
                  <Input
                    value={integracao.chave}
                    onChange={(e) => {
                      const updatedIntegracoes = integracoes.map(i => 
                        i.uid === editandoIntegracao ? { ...i, chave: e.target.value } : i
                      );
                      setIntegracoes(updatedIntegracoes);
                      setDirtyBlocks(prev => ({ ...prev, integracoes: true }));
                    }}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Secret</label>
                  <Input
                    type="password"
                    value={integracao.secret}
                    onChange={(e) => {
                      const updatedIntegracoes = integracoes.map(i => 
                        i.uid === editandoIntegracao ? { ...i, secret: e.target.value } : i
                      );
                      setIntegracoes(updatedIntegracoes);
                      setDirtyBlocks(prev => ({ ...prev, integracoes: true }));
                    }}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">URL</label>
                  <Input
                    value={integracao.url}
                    onChange={(e) => {
                      const updatedIntegracoes = integracoes.map(i => 
                        i.uid === editandoIntegracao ? { ...i, url: e.target.value } : i
                      );
                      setIntegracoes(updatedIntegracoes);
                      setDirtyBlocks(prev => ({ ...prev, integracoes: true }));
                    }}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80"
                    onClick={async () => {
                      try {
                        const integracaoAtual = integracoes.find(i => i.uid === editandoIntegracao);
                        if (!integracaoAtual) return;
                        
                        const response = await fetch(`/api/integracoes?id=${editandoIntegracao}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            uid: editandoIntegracao,
                            titular: profile?.uid,
                            ...integracaoAtual
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          toast.error(`Erro ao atualizar integração: ${data.error}`);
                          return;
                        }
                        
                        toast.success('Integração atualizada com sucesso!');
                        fetchIntegracoes();
                        setDirtyBlocks(prev => ({ ...prev, integracoes: false }));
                      } catch (error) {
                        console.error('Erro ao atualizar integração:', error);
                        toast.error(`Erro ao atualizar integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                      } finally {
                        setEditandoIntegracao(null);
                      }
                    }}
                  >
                    Salvar Alterações
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40"
                    onClick={() => {
                      setEditandoIntegracao(null);
                      fetchIntegracoes(); // Recarrega para descartar alterações
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Segurança - Agora em largura completa */}
      <section className="bg-card rounded-lg p-6 mt-6 card-neomorphic w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da Segurança */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-button-dark/50 shadow-inner card-neomorphic">
                <RiLockPasswordLine className="text-primary" size={20} />
              </div>
              Segurança
            </h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              Sua senha foi definida em: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Data não disponível'}
            </p>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200"
              onClick={() => {/* Função para alterar senha */}}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
          
          {/* Coluna do Danger Zone */}
          <div className="border-l border-border/30 pl-6">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-900/50 shadow-inner card-neomorphic">
                <AlertTriangle className="text-red-400" size={16} />
              </div>
              Danger Zone
            </h2>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-4">
              <p className="text-sm text-red-400">
                Atenção: Encerrar sua conta é uma ação irreversível. Todos os seus dados serão permanentemente excluídos.
              </p>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full btn-neomorphic bg-red-900/50 text-red-400 hover:bg-red-900/70 active:bg-red-900/80 border-red-500/30 transition-all duration-200"
              onClick={() => {/* Função para encerrar conta */}}
            >
              <UserX className="mr-2 h-4 w-4" />
              Encerrar Conta
            </Button>
          </div>
        </div>
        
        {dirtyBlocks.seguranca && (
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              onClick={() => handleSave('seguranca')}
              disabled={isSubmitting}
              className={`btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 ${savingBlock === 'seguranca' ? 'opacity-80' : ''}`}
            >
              {savingBlock === 'seguranca' ? (
                <>
                  <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
