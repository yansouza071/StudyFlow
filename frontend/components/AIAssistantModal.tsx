import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  BrainCircuit,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Plus,
  Send,
} from 'lucide-react';
import { StudyObjective, GeneratedStudyPlan, FlashcardQuestion } from '../types';
import { geminiService } from '../services/geminiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectives: StudyObjective[];
  onImportPlanAsObjective: (plan: GeneratedStudyPlan) => void;
}

type TabType = 'planner' | 'flashcards' | 'mentor';

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  objectives,
  onImportPlanAsObjective,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('planner');

  // Tab 1: Planner states
  const [topicInput, setTopicInput] = useState('');
  const [daysInput, setDaysInput] = useState(21);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedStudyPlan | null>(null);
  const [planSuccessNotice, setPlanSuccessNotice] = useState<string | null>(null);

  // Tab 2: Flashcards states
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(
    objectives.length > 0 ? objectives[0].id : ''
  );
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardQuestion[]>([]);
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<Record<number, boolean>>({});

  // Tab 3: Mentor Chat states
  const [chatQuestion, setChatQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string }>
  >([
    {
      sender: 'bot',
      text: 'Olá! Sou o Mentor Pedagógico do StudyFlow. Como posso te orientar hoje? Dúvidas sobre técnicas de estudo, revisão espaçada ou foco?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  // Handle Plan Generation
  const handleGeneratePlan = async () => {
    if (!topicInput.trim()) return;
    setIsGeneratingPlan(true);
    setPlanSuccessNotice(null);
    try {
      const plan = await geminiService.generateStudyPlan(topicInput.trim(), 'Geral', daysInput);
      setGeneratedPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleImportPlan = () => {
    if (!generatedPlan) return;
    onImportPlanAsObjective(generatedPlan);
    setPlanSuccessNotice('Objetivo criado com sucesso a partir do plano de IA!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Handle Flashcards
  const handleGenerateFlashcards = async () => {
    const obj = objectives.find((o) => o.id === selectedObjectiveId);
    if (!obj) return;
    setIsGeneratingCards(true);
    setRevealedCardIndexes({});
    try {
      const cards = await geminiService.generateFlashcards(obj.title, obj.notes);
      setFlashcards(cards);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const toggleReveal = (index: number) => {
    setRevealedCardIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle Mentor Question
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatQuestion.trim() || isChatLoading) return;

    const userText = chatQuestion.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setChatQuestion('');
    setIsChatLoading(true);

    try {
      const contextSummary = objectives
        .map((o) => `• ${o.title} (${o.progress}% feito, prazo: ${o.targetDate})`)
        .join('\n');
      const botResponse = await geminiService.getStudyCoachAdvice(userText, contextSummary);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Pense sempre em fracionar tarefas grandes em blocos de 20 minutos. Isso elimina a sobrecarga cognitiva!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Mentor de Estudos com IA
              </h2>
              <p className="text-xs text-purple-700 font-medium">
                Potencializado por Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-b-2 transition-all ${
              activeTab === 'planner'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Planejador Inteligente</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-b-2 transition-all ${
              activeTab === 'flashcards'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Flashcards & Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('mentor')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-b-2 transition-all ${
              activeTab === 'mentor'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Consultoria de Foco</span>
          </button>
        </div>

        {/* Tab 1: Planner Body */}
        {activeTab === 'planner' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
              Digite qualquer assunto que você precisa aprender (ex: <em>&quot;Aprender React Native do zero&quot;</em>,{' '}
              <em>&quot;Gramática para Concurso Público&quot;</em>). A IA dividirá o objetivo em etapas pedagógicas com estimativa de horas e dicas!
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
                placeholder="Ex: Estatística Descritiva e Probabilidade..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan || !topicInput.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Criar Roteiro</span>
                  </>
                )}
              </button>
            </div>

            {planSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{planSuccessNotice}</span>
              </div>
            )}

            {/* Generated Plan Result Box */}
            {generatedPlan && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{generatedPlan.topic}</h3>
                    <p className="text-xs text-slate-600 mt-1">{generatedPlan.summary}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 whitespace-nowrap">
                    ~{generatedPlan.estimatedHours} horas
                  </span>
                </div>

                {/* Subtasks preview */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Cronograma de Etapas:
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.subtasks.map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-200/80"
                      >
                        <span className="font-medium text-slate-800">
                          {i + 1}. {st.title}
                        </span>
                        {st.estimatedMinutes && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {st.estimatedMinutes} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Tips */}
                {generatedPlan.studyTips && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dicas Pedagógicas da IA:
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                      {generatedPlan.studyTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action button to save directly */}
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleImportPlan}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar aos Meus Objetivos de Estudo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Flashcards Body */}
        {activeTab === 'flashcards' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione um Objetivo para Revisar:
                </label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => setSelectedObjectiveId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {objectives.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingCards || !selectedObjectiveId}
                className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isGeneratingCards ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Gerar Quiz</span>
                  </>
                )}
              </button>
            </div>

            {flashcards.length > 0 ? (
              <div className="space-y-3 mt-4">
                <p className="text-xs text-slate-500 font-semibold">
                  Clique no cartão para revelar a resposta e testar sua lembrança ativa (Active Recall):
                </p>
                {flashcards.map((card, idx) => {
                  const isRevealed = revealedCardIndexes[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleReveal(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isRevealed
                          ? 'bg-indigo-50/70 border-indigo-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-purple-700 uppercase">
                          Questão {idx + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isRevealed ? 'Resposta revelada' : 'Toque para ver resposta'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900">{card.question}</p>

                      {isRevealed && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 text-xs text-indigo-950 bg-white/70 p-2.5 rounded-xl">
                          <strong className="block text-[11px] text-indigo-700 mb-1">
                            Gabarito & Explicação:
                          </strong>
                          {card.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Selecione uma matéria acima e clique em &quot;Gerar Quiz&quot; para praticar perguntas de fixação.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Mentor Chat Body */}
        {activeTab === 'mentor' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span>StudyBot está pensando...</span>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendChat}
              className="p-4 border-t border-slate-200 bg-white flex gap-2"
            >
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Pergunte sobre técnicas de estudo, rotina, procrastinação..."
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatQuestion.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
