'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RiUserLine, RiMailLine, RiWhatsappLine, RiMapPinLine, RiLockPasswordLine } from 'react-icons/ri'
import { toast } from 'sonner'
import { MtmUser } from '@/types/user'

export default function PerfilPage() {
  const { profile } = useAuth()
  const [formData, setFormData] = useState<Partial<MtmUser>>(profile || {})
  const [isDirty, setIsDirty] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(profile?.email_valid || false)
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(profile?.whatsapp_valid || false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    try {
      // Temporariamente removido para permitir o build
      console.log('Dados a serem salvos:', formData)

      // Chama a API route ao invés do Supabase diretamente
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Erro ao salvar perfil:', result.error)
        toast.error('Erro ao salvar alterações')
        return
      }

      console.log('Perfil atualizado:', result)
      toast.success('Alterações salvas com sucesso!')
      setIsDirty(false)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao salvar alterações')
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
        setIsDirty(true)
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setIsLoadingCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    handleInputChange(e)
    
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
      setIsDirty(true)
    }
  }

  const VerificationBadge = ({ isVerified }: { isVerified: boolean }) => (
    <Badge 
      className={`
        ${isVerified 
          ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' 
          : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}
      `}
    >
      {isVerified ? "Verificado" : "Não Verificado"}
    </Badge>
  )

  return (
    <div className={`p-4 ${isDirty ? 'pb-24' : 'pb-4'} max-w-7xl mx-auto`}>
      <div className="bg-card/50 text-card-foreground rounded-lg p-4 mb-6 flex items-center gap-6">
        <div className="relative">
          <Image
            src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
            alt="Foto de perfil"
            width={100}
            height={100}
            className="rounded-full border-4 border-border"
            priority
          />
          <button 
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Alterar foto"
          >
            <RiUserLine size={18} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{formData.nome}</h1>
          <p className="text-muted-foreground">{formData.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informações Pessoais */}
        <section className="bg-card/50 text-card-foreground rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RiUserLine className="text-primary" />
            </div>
            Informações Pessoais
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Nome Completo</label>
              <Input
                name="nome"
                value={formData.nome || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Documento</label>
              <Input
                name="documento"
                value={formData.documento || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
              />
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="bg-card/50 text-card-foreground rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RiMailLine className="text-primary" />
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
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
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
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
              />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-card/50 text-card-foreground rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RiMapPinLine className="text-primary" />
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
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">UF</label>
              <Input
                name="uf"
                value={formData.uf || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Cidade</label>
              <Input
                name="cidade"
                value={formData.cidade || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Bairro</label>
              <Input
                name="bairro"
                value={formData.bairro || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
                disabled={isLoadingCep}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Rua</label>
              <Input
                name="rua"
                value={formData.rua || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
                disabled={isLoadingCep}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Número</label>
              <Input
                name="numero"
                value={formData.numero || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Complemento</label>
              <Input
                name="complemento"
                value={formData.complemento || ''}
                onChange={handleInputChange}
                className="mt-1 bg-background border-border hover:bg-muted/10 focus:bg-muted/10"
              />
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section className="bg-card/50 text-card-foreground rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RiLockPasswordLine className="text-primary" />
            </div>
            Segurança
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sua senha foi definida em: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Data não disponível'}
          </p>
          <Button variant="outline" className="w-full">
            Alterar Senha
          </Button>
        </section>
      </div>

      {isDirty && (
        <div className="fixed bottom-8 right-6 z-50">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  )
}
