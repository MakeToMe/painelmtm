'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { useProfileRefresh } from '@/hooks/use-profile-refresh'
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
  const { refreshProfile } = useProfileRefresh(true) // Atualiza o perfil ao montar o componente
  const [formData, setFormData] = useState<Partial<MtmUser>>(profile || {})
  const [dirtyBlocks, setDirtyBlocks] = useState<{
    pessoal: boolean;
    contato: boolean;
    endereco: boolean;
    seguranca: boolean;
  }>({
    pessoal: false,
    contato: false,
    endereco: false,
    seguranca: false
  })
  const [isEmailVerified, setIsEmailVerified] = useState(profile?.email_valid || false)
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(profile?.whatsapp_valid || false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savingBlock, setSavingBlock] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      // Mapear o perfil
      const mappedProfile = {
        ...profile
      };
      setFormData(mappedProfile);
      setIsEmailVerified(profile.email_valid || false);
      setIsWhatsAppVerified(profile.whatsapp_valid || false);
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, blockType: 'pessoal' | 'contato' | 'endereco' | 'seguranca') => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setDirtyBlocks(prev => ({ ...prev, [blockType]: true }))
  }

  const handleSave = async (blockType: 'pessoal' | 'contato' | 'endereco' | 'seguranca') => {
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

      if (response.ok) {
        // Atualizar o estado do bloco
        setDirtyBlocks(prev => ({ ...prev, [blockType]: false }))
        toast.success('Dados salvos com sucesso!')
        
        // Atualizar o perfil no contexto de autenticação para refletir as mudanças
        await refreshProfile()
      } else {
        console.error('Erro ao salvar:', result)
        toast.error(`Erro ao salvar: ${result.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar os dados')
    } finally {
      setIsSubmitting(false)
      setSavingBlock(null)
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

  return (
    <div className={`p-4 ${dirtyBlocks.pessoal || dirtyBlocks.contato || dirtyBlocks.endereco || dirtyBlocks.seguranca ? 'pb-24' : 'pb-4'} max-w-7xl mx-auto`}>
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

        {/* Segurança */}
        <section className="bg-card rounded-lg p-6 card-neomorphic">
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

          <div className="mt-6 border-t border-border/30 pt-6">
            <h3 className="text-md font-semibold mb-4 text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-900/50 shadow-inner card-neomorphic">
                <AlertTriangle className="text-red-400" size={16} />
              </div>
              Danger Zone
            </h3>
            
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
    </div>
  )
}
