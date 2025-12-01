import React, { useState, useRef, useEffect } from 'react';
import { getGuidance } from '../apiService';
import FeedbackButtons from './FeedbackButtons';

export default function ChatInterface({ onFirstInteraction, hasInteracted }) {
  // Generar session_id único al montar el componente (memoria conversacional)
  const [sessionId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  });

  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente virtual para trámites municipales con <strong>memoria conversacional</strong>. Puedo recordar nuestra conversación, así que puedes hacerme preguntas de seguimiento. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const hasInteractedRef = useRef(false);

  // Log del session_id para debugging
  useEffect(() => {
    console.log('🧠 Memoria conversacional activa - Session ID:', sessionId);
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Notificar primera interacción
    if (!hasInteractedRef.current && onFirstInteraction) {
      hasInteractedRef.current = true;
      onFirstInteraction();
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Enviar con session_id para memoria conversacional
      const assistantResponse = await getGuidance(inputValue, sessionId);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse.guidanceHtml,
        downloadUrl: assistantResponse.downloadUrl,
        documentName: assistantResponse.documentName,
        sources: assistantResponse.sources,
        userQuery: inputValue, // Track user query for feedback
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '<p class="text-red-600">Lo siento, ha ocurrido un error.</p>',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Preguntas Frecuentes', query: 'Preguntas Frecuentes' },
    { label: 'Guía Técnica: Optimiza tus consultas con el sistema RAG', query: 'ayuda con el rag' },
  ];

  const handleQuickAction = async (query) => {
    // Notificar primera interacción
    if (!hasInteractedRef.current && onFirstInteraction) {
      hasInteractedRef.current = true;
      onFirstInteraction();
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Enviar con session_id para memoria conversacional
      const assistantResponse = await getGuidance(query, sessionId);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse.guidanceHtml,
        sources: assistantResponse.sources,
        userQuery: query, // Track user query for feedback
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '<p class="text-red-600">Lo siento, ha ocurrido un error.</p>',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-2xl flex flex-col ${hasInteracted ? 'h-[calc(100vh-2rem)]' : 'h-[70vh] max-h-[800px]'}`}>
      {/* Header con indicador de memoria activa */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-700 font-semibold flex items-center">
            Accesos rápidos
          </p>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Memoria activa
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action.query)}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-medium bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Área de mensajes del chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-4 ${
              msg.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                🤖
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
              <div
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
              {/* Add feedback buttons for assistant messages (except initial greeting) */}
              {msg.role === 'assistant' && msg.id !== 'init' && msg.userQuery && (
                <FeedbackButtons
                  message={msg}
                  sessionId={sessionId}
                  onFeedbackSubmit={() => console.log('Feedback submitted for message:', msg.id)}
                />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                👤
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              🤖
            </div>
            <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
              <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta aquí..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
