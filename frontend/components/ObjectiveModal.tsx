import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Calendar,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { StudyObjective, ObjectiveStatus, Subtask } from '../types';
import { PRESET_CATEGORIES } from '../constants';

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudyObjective, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingObjective?: StudyObjective | null;
}

export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingObjective,
}) => {
  const isEditing = Boolean(editingObjective);

  // Campos do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<ObjectiveStatus>('todo');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingObjective) {
      setTitle(editingObjective.title || '');
      setDescription(editingObjective.description || '');
      setTargetDate(editingObjective.targetDate || '');
      setStatus(editingObjective.status || 'todo');
      setCategory(editingObjective.category || PRESET_CATEGORIES[0]);
      setSubtasks(editingObjective.subtasks ? [...editingObjective.subtasks] : []);
    } else {
      // Valores padrão para novo objetivo
      setTitle('');
      setDescription('');
      // Sugere data limite para daqui a 7 dias
      const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      setTargetDate(defaultDate);
      setStatus('todo');
      setCategory(PRESET_CATEGORIES[0]);
      setSubtasks([]);
    }
    setErrorMessage(null);
  }, [editingObjective, isOpen]);

  if (!isOpen) return null;

  // Adicionar subtarefa
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newTask: Subtask = {
      id: 'sub_' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newTask]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Atalhos de prazo para facilitar a vida do estudante
  const handleQuickDeadline = (days: number) => {
    const d = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    setTargetDate(d);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor, informe o título do seu objetivo.');
      return;
    }
    if (!targetDate) {
      setErrorMessage('Por favor, defina um prazo para a conclusão do seu estudo.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        targetDate,
        status,
        category,
        subtasks,
        progress: status === 'completed' ? 100 : 0,
      },
      editingObjective?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditing ? 'Editar Objetivo de Estudo' : 'Novo Objetivo de Estudo'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Atualize os dados e acompanhe sua evolução'
                  : 'Defina o que você quer aprender e quando pretende concluir'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensagem de Erro de Validação se houver */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* 1. Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Objetivo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aprender o básico de Python, Redação Nota 1000..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dê um nome direto ao que você quer aprender ou alcançar.
            </p>
          </div>

          {/* 2. Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Ler os capítulos 1 ao 4, assistir videoaulas e resolver 15 exercícios práticos..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Detalhes, materiais de apoio ou instruções para você não se perder.
            </p>
          </div>

          {/* 3. Prazo (Data limite) com atalhos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Prazo (Data limite) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Quando pretende finalizar?</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 outline-none bg-white"
              />
            </div>
            {/* Atalhos rápidos de data */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Atalhos:</span>
              {[
                { label: 'Hoje', days: 0 },
                { label: 'Em 3 dias', days: 3 },
                { label: 'Em 7 dias', days: 7 },
                { label: 'Em 15 dias', days: 15 },
                { label: 'Em 30 dias', days: 30 },
              ].map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => handleQuickDeadline(shortcut.days)}
                  className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-100 transition-colors"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Status e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Atual <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ObjectiveStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="todo">🟡 Não iniciado</option>
                <option value="in_progress">🔵 Em andamento</option>
                <option value="completed">🟢 Concluído</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Matéria / Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Subtarefas opcionais */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-indigo-600" />
                Etapas ou Passos do Estudo (Opcional)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {subtasks.length} adicionada(s)
              </span>
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Ex: Fazer resumo do módulo 1..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <span className="truncate text-slate-800">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 ml-2"
                      title="Remover etapa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Objetivo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
