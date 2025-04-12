import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Página não encontrada</h2>
        <Link
          href="/"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors inline-block"
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  )
}
