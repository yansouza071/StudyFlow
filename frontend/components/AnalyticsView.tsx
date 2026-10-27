import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { StudyObjective } from '../types';

interface AnalyticsViewProps {
  objectives: StudyObjective[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ objectives }) => {
  // Gráfico 1: Quantidade por Status
  const statusCountMap: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    completed: 0,
  };

  objectives.forEach((obj) => {
    if (statusCountMap[obj.status] !== undefined) {
      statusCountMap[obj.status]++;
    }
  });

  const statusData = [
    { name: 'Não iniciado', value: statusCountMap.todo, color: '#f59e0b' },
    { name: 'Em andamento', value: statusCountMap.in_progress, color: '#3b82f6' },
    { name: 'Concluído', value: statusCountMap.completed, color: '#10b981' },
  ];

  // Gráfico 2: Distribuição por Categoria
  const categoryCountMap: Record<string, number> = {};
  objectives.forEach((obj) => {
    const cat = obj.category || 'Geral';
    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCountMap).map(([name, value]) => ({
    name,
    value,
  }));

  const CATEGORY_COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const totalCount = objectives.length;
  const completedCount = statusCountMap.completed;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner de Estatísticas */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Visão Geral do Seu Progresso
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Estatísticas dos Seus Estudos
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Você possui <strong className="text-white underline">{totalCount} objetivos cadastrados</strong>, com{' '}
            <strong className="text-white">{completedCount} finalizados</strong>. Celebrar cada pequena vitória mantém a motivação alta!
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="block text-3xl font-black">{completionRate}%</span>
            <span className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">
              Taxa de Conclusão
            </span>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center">
            <span className="block text-3xl font-black">{totalCount}</span>
            <span className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">
              Total de Metas
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Objetivos por Status */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Distribuição por Status
              </h3>
              <p className="text-xs text-slate-500">Acompanhamento dos objetivos cadastrados</p>
            </div>
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Matérias */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Distribuição por Matéria
              </h3>
              <p className="text-xs text-slate-500">Áreas de conhecimento que você está explorando</p>
            </div>
            <Target className="h-5 w-5 text-purple-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado para exibir.</p>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 block" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Não iniciados</p>
            <p className="text-xl font-bold text-slate-900">{statusCountMap.todo}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Em andamento</p>
            <p className="text-xl font-bold text-slate-900">{statusCountMap.in_progress}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Concluídos</p>
            <p className="text-xl font-bold text-emerald-600">{statusCountMap.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
