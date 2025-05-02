'use client'

import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ResourceInfoCellProps {
  totalValue: string
  usedPercentage: number
  type: 'cpu' | 'memory' | 'storage'
  label?: string
}

export function ResourceInfoCell({ totalValue, usedPercentage, type, label }: ResourceInfoCellProps) {
  // Garantir que o valor esteja entre 0 e 100
  const safeValue = Math.min(Math.max(0, usedPercentage), 100)
  const formattedValue = Math.round(safeValue)
  
  // Definir cores com base no tipo de recurso
  const getColor = () => {
    switch (type) {
      case 'cpu':
        return '#22d3ee' // cyan
      case 'memory':
        return '#a855f7' // purple
      case 'storage':
        return '#22c55e' // green
      default:
        return '#22d3ee'
    }
  }
  
  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Usado', value: safeValue },
    { name: 'Livre', value: 100 - safeValue }
  ]
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <div className="relative h-14 w-14">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={12}
                outerRadius={20}
                paddingAngle={2}
                dataKey="value"
                stroke="#fff"
                strokeWidth={1}
              >
                <Cell key={`cell-0`} fill={getColor()} />
                <Cell key={`cell-1`} fill="#334155" /> {/* Cor do espaço livre */}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-slate-300">{label || totalValue}</span>
          <span className="text-xs font-medium text-white">{formattedValue}% utilizado</span>
        </div>
      </div>
    </div>
  )
}
