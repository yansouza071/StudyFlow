import { GoogleGenAI, Type } from '@google/genai';
import { GeneratedStudyPlan, FlashcardQuestion, PriorityLevel } from '../types';

export const geminiService = {
  getAiClient() {
    return new GoogleGenAI({
      apiKey: process.env.API_KEY,
      vertexai: true,
    });
  },

  async generateStudyPlan(
    topic: string,
    category?: string,
    targetDays?: number
  ): Promise<GeneratedStudyPlan> {
    try {
      const ai = this.getAiClient();
      const prompt = `Você é um mentor especialista em neurociência da aprendizagem e técnicas de estudo acelerado (como repetição espaçada, Feynman e técnica Pomodoro).
Crie um plano de estudos estruturado para o seguinte objetivo:
Tema: "${topic}"
Área/Categoria: "${category || 'Geral'}"
Prazo aproximado em dias: ${targetDays || 15} dias.

Retorne em formato JSON estrito conforme o esquema fornecido:
- topic: nome refinado do objetivo
- summary: resumo conciso e motivador da estratégia de estudo (2 a 3 frases)
- estimatedHours: total de horas estimadas recomendadas para dominar este tema (número inteiro)
- suggestedPriority: uma das opções: "low", "medium", "high", "urgent"
- subtasks: lista de 4 a 6 etapas acionáveis em ordem pedagógica (do básico ao avançado/prático) com título claro e estimativa em minutos
- studyTips: 3 dicas práticas essenciais de estudo (técnica de revisão, como fixar, armadilhas comuns)
- recommendedResources: 2 a 3 recomendações de recursos didáticos (artigo, vídeo, livro ou documentação)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              summary: { type: Type.STRING },
              estimatedHours: { type: Type.INTEGER },
              suggestedPriority: {
                type: Type.STRING,
                description: 'Must be low, medium, high, or urgent',
              },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    estimatedMinutes: { type: Type.INTEGER },
                  },
                  propertyOrdering: ['title', 'estimatedMinutes'],
                },
              },
              studyTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedResources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    type: { type: Type.STRING },
                  },
                  propertyOrdering: ['title', 'url', 'type'],
                },
              },
            },
            propertyOrdering: [
              'topic',
              'summary',
              'estimatedHours',
              'suggestedPriority',
              'subtasks',
              'studyTips',
              'recommendedResources',
            ],
          },
        },
      });

      const parsed: GeneratedStudyPlan = JSON.parse(response.text.trim());
      // Ensure priority matches valid values
      const validPriorities: PriorityLevel[] = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(parsed.suggestedPriority as PriorityLevel)) {
        parsed.suggestedPriority = 'medium';
      }
      return parsed;
    } catch (error) {
      console.warn('Fallback to offline plan generator due to:', error);
      // Fallback offline mock plan
      return {
        topic: topic,
        summary: `Plano estratégico estruturado para dominar ${topic} com foco em teoria essencial, prática deliberada e resolução de exercícios.`,
        estimatedHours: 20,
        suggestedPriority: 'medium',
        subtasks: [
          { title: `Mapeamento dos conceitos fundamentais de ${topic}`, estimatedMinutes: 120 },
          { title: 'Elaboração de mapa mental e fichas de resumo (Método Feynman)', estimatedMinutes: 90 },
          { title: 'Prática guiada com 15 exercícios ou projetos aplicados', estimatedMinutes: 180 },
          { title: 'Revisão ativa e simulação de teste sem consulta', estimatedMinutes: 120 },
          { title: 'Consolidação de pontos fracos e repetição espaçada', estimatedMinutes: 90 },
        ],
        studyTips: [
          'Ensine o conteúdo para si mesmo em voz alta sem olhar o material para identificar lacunas.',
          'Intercale sessões curtas de 25 a 50 minutos de estudo intenso com descansos reais.',
          'Revise o conteúdo após 24 horas, 7 dias e 30 dias para fixar na memória de longo prazo.',
        ],
        recommendedResources: [
          { title: 'Google Acadêmico / Documentação Oficial', url: 'https://scholar.google.com', type: 'link' },
          { title: 'Canais de videoaulas e tutoriais guiados', url: 'https://youtube.com', type: 'video' },
        ],
      };
    }
  },

  async generateFlashcards(objectiveTitle: string, notes?: string): Promise<FlashcardQuestion[]> {
    try {
      const ai = this.getAiClient();
      const prompt = `Crie 4 perguntas e respostas de revisão ativa (Flashcards) no padrão Active Recall para o tema de estudo: "${objectiveTitle}".
Notas do estudante: "${notes || 'Nenhuma nota informada'}"

Retorne um JSON com array de perguntas com:
- question: Pergunta desafiadora para testar o conhecimento
- answer: Resposta clara, explicativa e precisa
- difficulty: "easy" | "medium" | "hard"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
              propertyOrdering: ['question', 'answer', 'difficulty'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text.trim());
      return parsed;
    } catch (err) {
      console.warn('Fallback flashcards:', err);
      return [
        {
          question: `Qual é o conceito central e a utilidade prática de "${objectiveTitle}"?`,
          answer: `O conceito principal envolve entender a estrutura teórica e aplicar de forma prática na resolução de problemas e testes reais.`,
          difficulty: 'medium',
        },
        {
          question: `Quais são os erros mais comuns cometidos por iniciantes ao estudar este tema?`,
          answer: `Focar apenas na leitura passiva sem fazer exercícios práticos e não aplicar revisões espaçadas.`,
          difficulty: 'easy',
        },
        {
          question: `Como você explicaria este tópico em termos simples para alguém sem conhecimento prévio?`,
          answer: `Utilize uma metáfora do cotidiano que traduza a essência do conceito sem jargões complexos.`,
          difficulty: 'hard',
        },
      ];
    }
  },

  async getStudyCoachAdvice(userQuery: string, currentContext: string): Promise<string> {
    try {
      const ai = this.getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é o "StudyBot", mentor pedagógico do StudyFlow. 
Contexto dos objetivos atuais do estudante:
${currentContext}

Pergunta ou desafio do estudante:
"${userQuery}"

Dê uma resposta amigável, acolhedora, prática, com passos diretos para agir agora e sem enrolação. Use bullet points e tom encorajador em português brasileiro.`,
      });
      return response.text || 'Mantenha o foco em um objetivo de cada vez. Pequenos passos diários trazem grandes aprovações!';
    } catch {
      return 'Dica rápida do StudyFlow: quando sentir sobrecarga, escolha apenas UMA subtarefa de 15 minutos para fazer agora. O início é a maior barreira para vencer a procrastinação!';
    }
  },
};
