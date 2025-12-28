
import { GoogleGenAI } from "@google/genai";

// Use Vite's import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Only initialize if API key is available
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function getStyleAdvice(query: string): Promise<string> {
  // If no API key is configured, return a helpful message
  if (!ai) {
    console.warn("Gemini API key not configured. ChatBot will use fallback responses.");
    return getFallbackResponse(query);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Você é o assistente virtual da Sou Negão Barber Shop. 
      Sua missão é ajudar os clientes a escolherem o melhor corte de cabelo ou barba.
      Seja amigável, entenda o estilo do cliente e sugira um dos nossos serviços: Corte Social, Barba Completa, Combo Completo ou Corte Infantil.
      
      Pergunta do cliente: "${query}"`,
      config: {
        systemInstruction: "Mantenha as respostas curtas, profissionais e com um toque de barbearia tradicional brasileira.",
        temperature: 0.7,
      }
    });
    return response.text || getFallbackResponse(query);
  } catch (error) {
    console.error("Gemini Error:", error);
    return getFallbackResponse(query);
  }
}

// Fallback responses when Gemini is not available
function getFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("corte") || lowerQuery.includes("cabelo")) {
    return "Temos ótimas opções de corte! O Corte Degradê é o mais pedido, com visual moderno. Também temos o Corte a Tesoura para um acabamento clássico. Que tal agendar?";
  }

  if (lowerQuery.includes("barba")) {
    return "Nossa Barba completa inclui toalha quente e navalha para um barbear perfeito! É uma experiência única. Quer agendar?";
  }

  if (lowerQuery.includes("preço") || lowerQuery.includes("valor") || lowerQuery.includes("quanto")) {
    return "Nossos preços variam de R$15 (sobrancelha) a R$90 (Combo VIP completo). O corte tradicional sai por R$45-50. Confira nossa tabela de serviços!";
  }

  if (lowerQuery.includes("horário") || lowerQuery.includes("funciona") || lowerQuery.includes("aberto")) {
    return "Funcionamos de Segunda a Sexta das 09h às 19h30, Domingo das 09h às 13h. Sábado estamos fechados. Agende seu horário!";
  }

  return "Olá! Sou o assistente da Sou Negão Barber Shop. Posso ajudar com informações sobre cortes, barba, preços e horários. O que você gostaria de saber?";
}
