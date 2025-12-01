import React, { useState } from 'react';
import { submitFeedback } from '../apiService';

export default function FeedbackButtons({ message, sessionId, onFeedbackSubmit }) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedCorrectness, setSelectedCorrectness] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(null);

  const handleCorrectness = (isCorrect) => {
    setSelectedCorrectness(isCorrect);
  };

  const handleRating = (stars) => {
    setRating(stars);
  };

  const handleSubmitFeedback = async () => {
    if (selectedCorrectness === null) {
      alert('Por favor selecciona si la respuesta fue correcta o incorrecta');
      return;
    }

    try {
      // Generate unique message_id
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await submitFeedback({
        message_id: messageId,
        session_id: sessionId,
        query: message.userQuery,
        answer: message.content,
        is_correct: selectedCorrectness,
        rating: rating,
        comment: comment || null,
        sources: message.sources || []
      });

      setFeedbackSubmitted(true);
      if (onFeedbackSubmit) {
        onFeedbackSubmit();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error al enviar feedback. Por favor intenta de nuevo.');
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Gracias por tu feedback
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      {/* Correctness buttons - always visible */}
      <div className="space-y-2">
        <span className="text-sm text-gray-600 font-medium block">¿Esta respuesta fue útil?</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleCorrectness(true)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all ${
              selectedCorrectness === true
                ? 'bg-green-500 text-white border-green-600'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            Correcta
          </button>
          <button
            onClick={() => handleCorrectness(false)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all ${
              selectedCorrectness === false
                ? 'bg-red-500 text-white border-red-600'
                : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            Incorrecta
          </button>
        </div>
      </div>

      {/* Star rating - always visible */}
      <div className="space-y-1">
        <span className="text-sm text-gray-600 font-medium block">Calificación (opcional):</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="text-2xl transition-transform hover:scale-110"
            >
              {star <= (rating || 0) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>

      {/* Comment - always visible */}
      <div className="space-y-1">
        <span className="text-sm text-gray-600 font-medium block">Comentario (opcional):</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmitFeedback}
        className="w-full px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={selectedCorrectness === null}
      >
        Enviar Feedback
      </button>
    </div>
  );
}
