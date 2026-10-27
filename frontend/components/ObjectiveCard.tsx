import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  AlertCircle,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudyObjective, ObjectiveStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { soundService } from '../services/audioService';

interface ObjectiveCardProps {
  objective: StudyObjective;
  onEdit: (objective: StudyObjective) => void;
  onDeleteRequest: (objective: StudyObjective) => void;
  onStatusChange: (id: string, newStatus: ObjectiveStatus) => void;
  onToggleSubtask?: (objectiveId: string, subtaskId: string) => void;
  onStartFocus?: (objective: StudyObjective) => void;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onEdit,
  onDeleteRequest,
  onStatusChange,
  onToggleSubtask,
  onStartFocus,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const statusMeta = STATUS_CONFIG[objective.status] || STATUS_CONFIG.todo;

  // Formatação amigável do prazo (data limite)
  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return { label: 'Sem prazo definido', urgent: false, overdue: false };

    const targetDate = new Date(dateStr + 'T23:59:59');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Formato legível em português (Ex: 15 de Nov de 2026)
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (diffDays < 0) {
      return {
        label: `Atrasado há ${Math.abs(diffDays)} dia(s) (${formattedDate})`,
        urgent: true,
        overdue: true,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (diffDays === 0) {
      return {
        label: `Vence Hoje! (${formattedDate})`,
        urgent: true,
        overdue: false,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      };
    }
    if (diffDays === 1) {
      return {
        label: `Vence Amanhã (${formattedDate})`,
        urgent: true,
        overdue: false,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: `Prazo: ${formattedDate} (${diffDays} dias)`,
      urgent: false,
      overdue: false,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  };

  const deadline = formatDeadline(objective.targetDate);
  const subtasks = objective.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Faixa superior sutil indicando o status */}
      <div
        className={`h-1.5 w-full ${
          objective.status === 'completed'
            ? 'bg-emerald-500'
            : objective.status === 'in_progress'
            ? 'bg-blue-500'
            : 'bg-amber-400'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Linha superior: Categoria e Seletor de Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {objective.category ? (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[180px]">
                {objective.category}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Objetivo Geral</span>
            )}

            {/* Status Badge Interativo */}
            <div className="relative">
              <select
                value={objective.status}
                onChange={(e) => onStatusChange(objective.id, e.target.value as ObjectiveStatus)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer transition-all ${statusMeta.badgeClass}`}
                title="Clique para alterar o status deste objetivo"
              >
                <option value="todo">🟡 Não iniciado</option>
                <option value="in_progress">🔵 Em andamento</option>
                <option value="completed">🟢 Concluído</option>
              </select>
            </div>
          </div>

          {/* Título do Objetivo */}
          <h3
            onClick={() => onEdit(objective)}
            className={`font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug ${
              objective.status === 'completed' ? 'line-through text-slate-400' : ''
            }`}
            title="Clique para editar este objetivo"
          >
            {objective.title}
          </h3>

          {/* Descrição do Objetivo */}
          {objective.description ? (
            <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
              {objective.description}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-400 italic">Sem descrição detalhada informada.</p>
          )}

          {/* Subtarefas / Etapas se houver */}
          {subtasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                  Etapas ({completedSubtasks}/{subtasks.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-0.5"
                >
                  {showSubtasks ? 'Ocultar' : 'Ver todas'}
                  {showSubtasks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              {/* Lista compacta de subtarefas */}
              <div className="space-y-1.5">
                {(showSubtasks ? subtasks : subtasks.slice(0, 2)).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      if (onToggleSubtask) {
                        soundService.playTaskComplete();
                        onToggleSubtask(objective.id, st.id);
                      }
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                      st.completed
                        ? 'bg-emerald-50/50 border-emerald-100 text-slate-400 line-through'
                        : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-100 text-slate-700'
                    }`}
                  >
                    {st.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="truncate select-none">{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Cartão: Prazo e Botões de Ação */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          {/* Prazo */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                deadline.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {deadline.urgent ? (
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{deadline.label}</span>
            </span>
          </div>

          {/* Botões de Ação: Editar e Excluir */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {onStartFocus && (
              <button
                type="button"
                onClick={() => onStartFocus(objective)}
                title="Iniciar cronômetro de foco para este objetivo"
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                aria-label="Focar"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(objective)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="Editar informações do objetivo"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteRequest(objective)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              title="Excluir este objetivo"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
