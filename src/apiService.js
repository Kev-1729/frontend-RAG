const API_URL = 'http://localhost:8000';

/**
 * Envía feedback sobre una respuesta del RAG
 * @param {Object} feedbackData - Datos del feedback
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function submitFeedback(feedbackData) {
  try {
    const response = await fetch(`${API_URL}/api/feedback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando feedback:', error);
    throw error;
  }
}

/**
 * Obtiene métricas de exactitud del sistema
 * @param {number} days - Días a considerar (default 30)
 * @returns {Promise<Object>} Métricas de exactitud
 */
export async function getExactitudMetrics(days = 30) {
  try {
    const response = await fetch(`${API_URL}/api/feedback/metrics?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    throw error;
  }
}

/**
 * Envía una consulta al sistema RAG con soporte de memoria conversacional
 * @param {string} query - La pregunta del usuario
 * @param {string} sessionId - ID de sesión para mantener contexto (opcional)
 * @returns {Promise<Object>} Respuesta del asistente
 */
export async function getGuidance(query, sessionId = null) {
  try {
    const requestBody = { query };

    // Agregar session_id si está disponible
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(`${API_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    return {
      downloadUrl: data.download_url || '',
      documentName: data.document_name || '',
      guidanceHtml: data.answer || '<p>No se pudo obtener una respuesta.</p>',
      sources: data.sources || [],
    };
  } catch (error) {
    console.error('Error consultando API:', error);
    return {
      downloadUrl: '',
      documentName: '',
      guidanceHtml:
        '<p class="text-red-600">Lo siento, no se pudo conectar con el servidor. Por favor, verifica que el backend esté ejecutándose.</p>',
      sources: [],
    };
  }
}
