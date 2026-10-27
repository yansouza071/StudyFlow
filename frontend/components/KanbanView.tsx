import React from 'react';
import {
  Plus,
  Play,
  Edit2,
  Trash2,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { StudyObjective, ObjectiveStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface KanbanViewProps {
  objectives: StudyObjective[];
  onStatusChange: (id: string, status: ObjectiveStatus) => void;
  onEdit: (objective: StudyObjective) => void;
  onDelete: (id: string) => void;
  onStartPomodoro: (objective: StudyObjective) => void;
  onOpenNewModal: (presetStatus?: ObjectiveStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  objectives,
  onStatusChange,
  onEdit,
  onDelete,
  onStartPomodoro,
  onOpenNewModal,
}) => {
  const columns: ObjectiveStatus[] = ['todo', 'in_progress', 'completed'];

  const getNextStatus = (current: ObjectiveStatus): ObjectiveStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    return null;
  };

  const getPrevStatus = (current: ObjectiveStatus): ObjectiveStatus | null => {
    if (current === 'completed') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Subtítulo explicativo */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <span>Acompanhe visualmente a transição das suas metas de estudo:</span>
        <span className="font-semibold text-indigo-700">
          {objectives.length} objetivos distribuídos
        </span>
      </div>

      {/* 3 Colunas: Não iniciado, Em andamento, Concluído */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map((colStatus) => {
          const meta = STATUS_CONFIG[colStatus];
          const colObjectives = objectives.filter((o) => o.status === colStatus);

          return (
            <div
              key={colStatus}
              className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 flex flex-col min-h-[460px]"
            >
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
                  <span className="font-bold text-sm text-slate-800">{meta.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
                    {colObjectives.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewModal(colStatus)}
                  title={`Adicionar objetivo em ${meta.label}`}
                  className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lista de Cartões na Coluna */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colObjectives.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-xl">
                    <p className="text-xs text-slate-400">Nenhum objetivo aqui</p>
                    <button
                      onClick={() => onOpenNewModal(colStatus)}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      + Cadastrar objetivo
                    </button>
                  </div>
                ) : (
                  colObjectives.map((obj) => {
                    const next = getNextStatus(obj.status);
                    const prev = getPrevStatus(obj.status);

                    return (
                      <div
                        key={obj.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:shadow transition-all group"
                      >
                        {/* Categoria */}
                        {obj.category && (
                          <div className="mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {obj.category}
                            </span>
                          </div>
                        )}

                        {/* Título */}
                        <h4
                          onClick={() => onEdit(obj)}
                          className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 cursor-pointer"
                        >
                          {obj.title}
                        </h4>

                        {/* Descrição curta */}
                        {obj.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {obj.description}
                          </p>
                        )}

                        {/* Prazo */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {obj.targetDate
                              ? new Date(obj.targetDate + 'T00:00:00').toLocaleDateString(
                                  'pt-BR',
                                  { day: '2-digit', month: 'short' }
                                )
                              : 'Sem prazo'}
                          </span>
                        </div>

                        {/* Ações e Mudança Rápida de Coluna */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {/* Voltar coluna */}
                          {prev ? (
                            <button
                              onClick={() => onStatusChange(obj.id, prev)}
                              title={`Mover para ${STATUS_CONFIG[prev].label}`}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {/* Ações Centrais */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onStartPomodoro(obj)}
                              title="Iniciar Foco"
                              className="p-1 rounded text-indigo-600 hover:bg-indigo-50"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => onEdit(obj)}
                              title="Editar"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(obj.id)}
                              title="Excluir"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Avançar coluna */}
                          {next ? (
                            <button
                              onClick={() => onStatusChange(obj.id, next)}
                              title={`Mover para ${STATUS_CONFIG[next].label}`}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
