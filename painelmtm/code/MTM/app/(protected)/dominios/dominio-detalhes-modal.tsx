'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RiCloseLine } from 'react-icons/ri'

interface Dominio {
  Uid: string
  titular: string
  dominio_nome: string
  dominio_id: string | null
  conta_nome: string | null
  conta_id: string | null
  status: string | null
  created_at: string
}

interface DominioDetalhesModalProps {
  dominio: Dominio | null
  isOpen: boolean
  onClose: () => void
}

export default function DominioDetalhesModal({
  dominio,
  isOpen,
  onClose,
}: DominioDetalhesModalProps) {
  if (!dominio) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Domínio</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <RiCloseLine className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o domínio {dominio.dominio_nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
              <p className="text-sm">{dominio.Uid}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Nome</h4>
              <p className="text-sm">{dominio.dominio_nome}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Domínio ID</h4>
              <p className="text-sm">{dominio.dominio_id || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <div className="mt-1">
                {dominio.status ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dominio.status === 'ativo'
                        ? 'bg-green-100 text-green-800'
                        : dominio.status === 'inativo'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {dominio.status}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Conta</h4>
              <p className="text-sm">{dominio.conta_nome || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Conta ID</h4>
              <p className="text-sm">{dominio.conta_id || '-'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
            <p className="text-sm">
              {dominio.created_at
                ? format(new Date(dominio.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: ptBR,
                  })
                : '-'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
