'use client'

import { useState, useEffect } from 'react'
import { RiTimeLine } from 'react-icons/ri'

export function DigitalClock() {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<string>('')

  useEffect(() => {
    // Função para atualizar o relógio
    const updateClock = () => {
      const now = new Date()
      
      // Formatar hora no formato 24h
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}:${seconds}`)
      
      // Formatar data
      const day = now.getDate().toString().padStart(2, '0')
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const year = now.getFullYear()
      setDate(`${day}/${month}/${year}`)
      
      // Dia da semana
      const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      setDayOfWeek(daysOfWeek[now.getDay()])
    }
    
    // Atualizar imediatamente
    updateClock()
    
    // Configurar intervalo para atualizar a cada segundo
    const interval = setInterval(updateClock, 1000)
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800/50 rounded-lg border from-blue-500 to-indigo-500 border-blue-500/30 p-4 relative overflow-hidden">
      {/* Efeito de glow */}
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-blue-500 to-indigo-500"></div>
      
      {/* Ícone e texto no canto superior esquerdo */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-slate-700/70">
          <RiTimeLine className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-slate-300 text-sm font-medium">Horário UTC -3h - TZ Brasil</span>
      </div>
      
      <div className="flex flex-col items-center justify-center h-full pt-8">
        <div className="text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent from-blue-400 to-indigo-300 font-mono text-center tracking-wider">
          {time}
        </div>
        
        <div className="text-xs text-slate-400 flex flex-col items-center">
          <span className="font-medium">{dayOfWeek}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
