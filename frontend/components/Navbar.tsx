import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  RotateCcw,
  LayoutDashboard,
  Kanban,
  Timer,
  BarChart3,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenNewModal: () => void;
  onOpenAIAssistant?: () => void;
  totalObjectivesCount: number;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenNewModal,
  onOpenAIAssistant,
  totalObjectivesCount,
  onReset,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'cards' as ViewMode, label: 'Meus Objetivos', icon: LayoutDashboard },
    { id: 'kanban' as ViewMode, label: 'Quadro Visual', icon: Kanban },
    { id: 'pomodoro' as ViewMode, label: 'Foco Pomodoro', icon: Timer },
    { id: 'analytics' as ViewMode, label: 'Estatísticas', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logotipo e Nome */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  StudyFlow
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {totalObjectivesCount} {totalObjectivesCount === 1 ? 'meta' : 'metas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Organize o que deseja aprender de forma simples
              </p>
            </div>
          </div>

          {/* Abas de Navegação (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Assistente IA */}
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={onOpenAIAssistant}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                title="Pedir ideias de cronograma para a IA"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Mentor IA</span>
              </button>
            )}

            {/* Botão Novo Objetivo */}
            <button
              type="button"
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Cadastrar Objetivo</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Botão para recarregar exemplos */}
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Restaurar dados de exemplo"
              aria-label="Restaurar exemplos"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Menu Hambúrguer (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
