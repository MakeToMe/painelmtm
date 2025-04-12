'use client'

import React from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'cyan' | 'purple' | 'green' | 'blue'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  chart?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'cyan',
  trend,
  trendValue,
  chart
}: MetricCardProps) {
  
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-green-500 text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trendValue}
          </div>
        )
      case 'down':
        return (
          <div className="flex items-center text-red-500 text-xs">
            <TrendingDown className="w-3 h-3 mr-1" />
            {trendValue}
          </div>
        )
      case 'neutral':
        return (
          <div className="flex items-center text-gray-400 text-xs">
            <Minus className="w-3 h-3 mr-1" />
            {trendValue}
          </div>
        )
      default:
        return null
    }
  }
  
  const getGlowColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500"
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      case "purple":
        return "from-purple-500 to-pink-500"
      default:
        return "from-cyan-500 to-blue-500"
    }
  }
  
  return (
    <div className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      {/* Efeito de glow */}
      <div className={`absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl ${getGlowColor()}`}></div>
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-slate-700/70">
              {icon}
            </div>
            <span className="text-slate-300 text-sm font-medium">{title}</span>
          </div>
          
          <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
            {value}
          </div>
          
          {subtitle && (
            <div className="text-xs text-slate-400">
              {subtitle}
            </div>
          )}
        </div>
        
        {chart && (
          <div className="h-12 w-16">
            {chart}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="absolute bottom-2 right-2 flex items-center">
          {getTrendIcon()}
        </div>
      )}
    </div>
  )
}
