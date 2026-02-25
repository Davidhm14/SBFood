function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-orange-500 mb-8">
          🍽️ SB Food
        </h1>
        <div className="bg-slate-800 p-8 rounded-xl">
          <h2 className="text-2xl mb-4">Estado del sistema:</h2>
          <div className="space-y-2">
            <p>✅ API corriendo en localhost:4000</p>
            <p>✅ PostgreSQL conectado</p>
            <p>🚀 Listo para desarrollar módulos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
