import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { StudyObjective } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  objective: StudyObjective | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  objective,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !objective) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
        {/* Ícone e Título */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Confirmar Exclusão de Objetivo
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Você tem certeza de que deseja excluir este objetivo de estudo?
            </p>
          </div>
        </div>

        {/* Cartão de prévia do objetivo que será excluído */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-bold text-slate-900 line-clamp-1">{objective.title}</p>
          {objective.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
              {objective.description}
            </p>
          )}
          <p className="text-[10px] text-rose-600 font-semibold mt-2">
            ⚠️ Esta ação não poderá ser desfeita.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Cancelar e Manter
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Sim, Excluir Objetivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
