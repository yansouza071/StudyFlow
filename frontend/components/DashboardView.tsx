import React from 'react';
import {
  Target,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StudyObjective, FilterOptions, ObjectiveStatus } from '../types';
import { PRESET_CATEGORIES } from '../constants';
import { ObjectiveCard } from './ObjectiveCard';

interface DashboardViewProps {
  objectives: StudyObjective[];
  filter: FilterOptions;
  onFilterChange: (newFilter: Partial<FilterOptions>) => void;
  onOpenNewModal: () => void;
  onEdit: (objective: StudyObjective) => void;
  onDeleteRequest: (objective: StudyObjective) => void;
  onStatusChange: (id: string, status: ObjectiveStatus) => void;
  onToggleSubtask: (objectiveId: string, subtaskId: string) => void;
  onStartFocus: (objective: StudyObjective) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  objectives,
  filter,
  onFilterChange,
  onOpenNewModal,
  onEdit,
  onDeleteRequest,
  onStatusChange,
  onToggleSubtask,
  onStartFocus,
}) => {
  // Contagens exatas para atender o requisito: "exibir a quantidade de objetivos cadastrados"
  const totalCount = objectives.length;
  const todoCount = objectives.filter((o) => o.status === 'todo').length;
  const inProgressCount = objectives.filter((o) => o.status === 'in_progress').length;
  const completedCount = objectives.filter((o) => o.status === 'completed').length;

  // Filtragem e busca
  const filteredObjectives = objectives
    .filter((obj) => {
      // Busca por texto
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const matchTitle = obj.title.toLowerCase().includes(q);
        const matchDesc = obj.description?.toLowerCase().includes(q);
        const matchCat = obj.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      // Filtro por status
      if (filter.status && obj.status !== filter.status) return false;
      // Filtro por categoria
      if (filter.category && obj.category !== filter.category) return false;
      return true;
    })
    .sort((a, b) => {
      const order = filter.sortOrder === 'asc' ? 1 : -1;
      if (filter.sortBy === 'targetDate') {
        return (new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()) * order;
      }
      if (filter.sortBy === 'title') {
        return a.title.localeCompare(b.title) * order;
      }
      // Mais recentes primeiro
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order;
    });

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas & Contadores em Destaque */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm mb-2 text-indigo-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>StudyFlow • Organize seus estudos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Seus Objetivos de Aprendizado
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
              Defina o que você quer aprender, acompanhe seus prazos e avance passo a passo no seu ritmo.
            </p>
          </div>

          {/* Destaque da Quantidade de Objetivos Cadastrados */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="text-center px-2">
              <span className="block text-3xl font-black text-white">{totalCount}</span>
              <span className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">
                {totalCount === 1 ? 'Cadastrado' : 'Cadastrados'}
              </span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-3xl font-black text-emerald-300">{completedCount}</span>
              <span className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">
                Concluídos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartões Rápidos de Status (Contadores Clicáveis) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <button
          onClick={() => onFilterChange({ status: '' })}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter.status === ''
              ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total</span>
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Todos os objetivos</p>
        </button>

        {/* Não Iniciados */}
        <button
          onClick={() => onFilterChange({ status: 'todo' })}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter.status === 'todo'
              ? 'bg-amber-50/50 border-amber-400 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Não iniciados</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{todoCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Planejados</p>
        </button>

        {/* Em Andamento */}
        <button
          onClick={() => onFilterChange({ status: 'in_progress' })}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter.status === 'in_progress'
              ? 'bg-blue-50/50 border-blue-400 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">Em andamento</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Estudando agora</p>
        </button>

        {/* Concluídos */}
        <button
          onClick={() => onFilterChange({ status: 'completed' })}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter.status === 'completed'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Concluídos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Finalizados</p>
        </button>
      </div>

      {/* Barra de Pesquisa, Filtros e Ação Principal */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Pesquisar por título, descrição ou matéria..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
            />
            {filter.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Categoria */}
            <select
              value={filter.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">Todas as Matérias</option>
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterOptions['sortBy'],
                })
              }
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="targetDate">Ordenar: Prazo mais próximo</option>
              <option value="createdAt">Ordenar: Mais recentes</option>
              <option value="title">Ordenar: Ordem alfabética</option>
            </select>

            {/* Botão Novo Objetivo */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Novo Objetivo</span>
            </button>
          </div>
        </div>

        {/* Indicador de Filtro Ativo */}
        {(filter.category || filter.status || filter.search) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Exibindo <strong className="text-slate-900">{filteredObjectives.length}</strong> de{' '}
              {totalCount} objetivos cadastrados
            </span>
            <button
              onClick={() =>
                onFilterChange({
                  search: '',
                  category: '',
                  status: '',
                })
              }
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Grade de Cartões dos Objetivos */}
      {filteredObjectives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredObjectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onStatusChange={onStatusChange}
              onToggleSubtask={onToggleSubtask}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      ) : (
        /* Mensagem Acolhedora quando não houver objetivos */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {totalCount === 0
                ? 'Nenhum objetivo cadastrado ainda!'
                : 'Nenhum objetivo encontrado com esses filtros'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
              {totalCount === 0
                ? 'Que tal dar o primeiro passo? Cadastre o tema ou matéria que você deseja aprender para organizar sua rotina de estudos!'
                : 'Tente alterar os termos de busca ou limpar os filtros para ver seus outros objetivos cadastrados.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2.5">
            {totalCount > 0 ? (
              <button
                onClick={() =>
                  onFilterChange({
                    search: '',
                    category: '',
                    status: '',
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Limpar Filtros
              </button>
            ) : null}

            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Cadastrar Primeiro Objetivo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
