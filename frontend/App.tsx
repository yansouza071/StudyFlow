import React, { useState, useEffect } from 'react';
import {
  StudyObjective,
  ViewMode,
  FilterOptions,
  ObjectiveStatus,
  GeneratedStudyPlan,
} from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { ObjectiveModal } from './components/ObjectiveModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const App: React.FC = () => {
  // Estado principal de objetivos armazenados localmente
  const [objectives, setObjectives] = useState<StudyObjective[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
  const [filter, setFilter] = useState<FilterOptions>({
    search: '',
    status: '',
    category: '',
    sortBy: 'targetDate',
    sortOrder: 'asc',
  });

  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<StudyObjective | null>(null);

  // Modal de Confirmação para Exclusão
  const [objectiveToDelete, setObjectiveToDelete] = useState<StudyObjective | null>(null);

  // Modal do Mentor com IA
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Objetivo selecionado para o temporizador Pomodoro
  const [selectedPomodoroId, setSelectedPomodoroId] = useState<string>('');

  // Mensagem toast temporária de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega os dados do localStorage na inicialização da aplicação
  useEffect(() => {
    const loaded = storageService.getObjectives();
    setObjectives(loaded);
    if (loaded.length > 0) {
      setSelectedPomodoroId(loaded[0].id);
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // 1. Cadastrar / Editar Objetivo
  const handleSaveObjective = (
    data: Omit<StudyObjective, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      const updated = storageService.updateObjective(editId, data);
      if (updated) {
        setObjectives((prev) => prev.map((o) => (o.id === editId ? updated : o)));
        showToast('Objetivo atualizado e salvo localmente com sucesso!');
      }
    } else {
      const created = storageService.addObjective(data);
      setObjectives((prev) => [created, ...prev]);
      showToast('Novo objetivo de estudo cadastrado e salvo com sucesso!');
    }
    setEditingObjective(null);
  };

  // 2. Solicitar Exclusão (Abre o modal de confirmação)
  const handleDeleteRequest = (objective: StudyObjective) => {
    setObjectiveToDelete(objective);
  };

  // 3. Confirmar Exclusão
  const handleConfirmDelete = () => {
    if (!objectiveToDelete) return;
    const success = storageService.deleteObjective(objectiveToDelete.id);
    if (success) {
      setObjectives((prev) => prev.filter((o) => o.id !== objectiveToDelete.id));
      showToast(`Objetivo "${objectiveToDelete.title}" excluído.`);
    }
    setObjectiveToDelete(null);
  };

  // 4. Alterar Status do Objetivo (Não iniciado, Em andamento, Concluído)
  const handleStatusChange = (id: string, newStatus: ObjectiveStatus) => {
    const updated = storageService.updateObjective(id, {
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : undefined,
    });
    if (updated) {
      setObjectives((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(
        newStatus === 'completed'
          ? '🎉 Parabéns! Objetivo concluído com sucesso!'
          : 'Status do objetivo atualizado.'
      );
    }
  };

  // 5. Alternar subtarefa dentro do objetivo
  const handleToggleSubtask = (objectiveId: string, subtaskId: string) => {
    const updated = storageService.toggleSubtask(objectiveId, subtaskId);
    if (updated) {
      setObjectives((prev) => prev.map((o) => (o.id === objectiveId ? updated : o)));
    }
  };

  // Iniciar foco direto do cartão
  const handleStartFocus = (objective: StudyObjective) => {
    setSelectedPomodoroId(objective.id);
    setCurrentView('pomodoro');
    showToast(`Modo foco iniciado para: ${objective.title}`);
  };

  // Importar plano sugerido pela IA como novo objetivo
  const handleImportPlanAsObjective = (plan: GeneratedStudyPlan) => {
    const defaultDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const created = storageService.addObjective({
      title: plan.topic,
      description: plan.summary,
      targetDate: defaultDate,
      status: 'todo',
      category: 'Geral & Fundamentos',
      subtasks: plan.subtasks.map((st) => ({
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        title: st.title,
        completed: false,
      })),
      notes: plan.studyTips ? plan.studyTips.join('\n') : '',
    });
    setObjectives((prev) => [created, ...prev]);
    showToast('Plano gerado pela IA cadastrado nos seus objetivos!');
  };

  // Restaurar dados de exemplo
  const handleResetData = () => {
    storageService.resetToSample();
    const samples = storageService.getObjectives();
    setObjectives(samples);
    showToast('Dados de exemplo restaurados no seu navegador.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Barra de Navegação */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewModal={() => {
          setEditingObjective(null);
          setIsModalOpen(true);
        }}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        totalObjectivesCount={objectives.length}
        onReset={handleResetData}
      />

      {/* Faixa explicativa sobre persistência local (localStorage) */}
      <div className="bg-indigo-50/70 border-b border-indigo-100 py-1.5 px-4 text-center">
        <p className="text-[11px] text-indigo-900 font-medium inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>
            Seus objetivos são preservados localmente no <strong>localStorage</strong> deste navegador e não são perdidos ao atualizar a página.
          </span>
        </p>
      </div>

      {/* Mensagem Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white border border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/70 hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'cards' && (
          <DashboardView
            objectives={objectives}
            filter={filter}
            onFilterChange={(newFilters) => setFilter((prev) => ({ ...prev, ...newFilters }))}
            onOpenNewModal={() => {
              setEditingObjective(null);
              setIsModalOpen(true);
            }}
            onEdit={(obj) => {
              setEditingObjective(obj);
              setIsModalOpen(true);
            }}
            onDeleteRequest={handleDeleteRequest}
            onStatusChange={handleStatusChange}
            onToggleSubtask={handleToggleSubtask}
            onStartFocus={handleStartFocus}
          />
        )}

        {currentView === 'kanban' && (
          <KanbanView
            objectives={objectives}
            onStatusChange={handleStatusChange}
            onEdit={(obj) => {
              setEditingObjective(obj);
              setIsModalOpen(true);
            }}
            onDelete={(id) => {
              const obj = objectives.find((o) => o.id === id);
              if (obj) handleDeleteRequest(obj);
            }}
            onStartPomodoro={handleStartFocus}
            onOpenNewModal={() => {
              setEditingObjective(null);
              setIsModalOpen(true);
            }}
          />
        )}

        {currentView === 'pomodoro' && (
          <PomodoroTimer
            objectives={objectives}
            selectedObjectiveId={selectedPomodoroId}
            onSelectObjective={setSelectedPomodoroId}
            onSessionComplete={() => {
              showToast('Sessão de foco concluída!');
            }}
            recentSessions={[]}
          />
        )}

        {currentView === 'analytics' && <AnalyticsView objectives={objectives} />}
      </main>

      {/* Modal de Cadastro / Edição de Objetivo */}
      <ObjectiveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingObjective(null);
        }}
        onSave={handleSaveObjective}
        editingObjective={editingObjective}
      />

      {/* Modal de Confirmação para Exclusão (Requisito obrigatório) */}
      <ConfirmModal
        isOpen={Boolean(objectiveToDelete)}
        objective={objectiveToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setObjectiveToDelete(null)}
      />

      {/* Modal Opcional do Mentor IA */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        objectives={objectives}
        onImportPlanAsObjective={handleImportPlanAsObjective}
      />
    </div>
  );
};

export default App;
