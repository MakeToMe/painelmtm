'use client'

import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Text } from 'recharts'

interface ResourceUsageChartProps {
  value: number
  type: 'cpu' | 'memory' | 'storage'
  chartType?: 'pie' | 'bar' | 'line'
}

export function ResourceUsageChart({ value, type, chartType = 'bar' }: ResourceUsageChartProps) {
  // Garantir que o valor esteja entre 0 e 100
  const safeValue = Math.min(Math.max(0, value), 100)
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
  
  // Componente personalizado para exibir o valor percentual
  const ValueLabel = ({ x, y, width, height, value }: any) => {
    return (
      <Text 
        x={x + width / 2} 
        y={y + height / 2} 
        textAnchor="middle" 
        verticalAnchor="middle"
        fill="#fff"
        fontSize={10}
        fontWeight="bold"
      >
        {`${formattedValue}%`}
      </Text>
    );
  };
  
  // Dados para o gráfico de barras ou linha - simplificado para apenas um valor
  const barData = [
    { value: safeValue }
  ]
  
  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Usado', value: safeValue },
    { name: 'Livre', value: 100 - safeValue }
  ]
  
  // Função para renderizar o gráfico de pizza (usado para todos os tipos agora)
  const renderPieChart = () => {
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12">
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
        <span className="text-xs font-medium text-white">{formattedValue}%</span>
      </div>
    )
  }
  
  // Se o tipo de gráfico for explicitamente 'pie', use-o
  if (chartType === 'pie') {
    return renderPieChart()
  }
  
  // Para o tipo 'line', também usamos o gráfico de pizza para unificar
  if (chartType === 'line') {
    return renderPieChart()
  }
  
  // Padrão: também usamos o gráfico de pizza para unificar
  return renderPieChart()
}
