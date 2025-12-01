import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-sans">
      {/* Contenedor principal centrado */}
      <div className="flex-1 flex flex-col">
        {/* Header centrado (solo se muestra al inicio) */}
        {!hasInteracted && (
          <header className="text-center pt-12 px-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Asistente de Trámites Municipales
            </h1>
          </header>
        )}

        {/* Chat principal */}
        <main className={`flex-1 flex items-center justify-center p-4 ${hasInteracted ? 'pt-6' : 'pt-8'}`}>
          <div className={`w-full ${hasInteracted ? 'max-w-6xl h-full' : 'max-w-4xl'} mx-auto`}>
            <ChatInterface
              onFirstInteraction={() => setHasInteracted(true)}
              hasInteracted={hasInteracted}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
