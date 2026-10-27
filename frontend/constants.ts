import { ObjectiveStatus, PriorityLevel, StudyObjective } from './types';

export const LOCAL_STORAGE_OBJECTIVES_KEY = 'studyflow_objectives_v2';
export const LOCAL_STORAGE_SESSIONS_KEY = 'studyflow_sessions_v2';

export const STATUS_CONFIG: Record<
  ObjectiveStatus,
  { label: string; badgeClass: string; dotClass: string; description: string; headerColor: string }
> = {
  todo: {
    label: 'Não iniciado',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-400',
    description: 'Planejado para começar em breve',
    headerColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  in_progress: {
    label: 'Em andamento',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dotClass: 'bg-blue-500 animate-pulse',
    description: 'Você está estudando este tema no momento',
    headerColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  completed: {
    label: 'Concluído',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
    description: 'Objetivo finalizado com sucesso!',
    headerColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

export const PRESET_CATEGORIES = [
  'Geral & Fundamentos',
  'Programação & Tecnologia',
  'Matemática & Exatas',
  'Idiomas & Vocabulário',
  'Concursos & Vestibulares',
  'Ciências & Saúde',
  'Humanas & Literatura',
];

export const INITIAL_SAMPLE_OBJECTIVES: StudyObjective[] = [
  {
    id: 'sample-1',
    title: 'Aprender Fundamentos de Algoritmos em Python',
    description: 'Compreender estruturas de repetição, condicionais, listas e funções para resolver os primeiros exercícios de lógica.',
    targetDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'in_progress',
    category: 'Programação & Tecnologia',
    priority: 'high',
    progress: 50,
    estimatedHours: 15,
    loggedHours: 7.5,
    subtasks: [
      { id: 'sub-1', title: 'Assistir às aulas de variáveis e operadores', completed: true },
      { id: 'sub-2', title: 'Praticar 10 exercícios de if/else e laços for/while', completed: true },
      { id: 'sub-3', title: 'Criar um mini-projeto de calculadora no terminal', completed: false },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Revisar Fórmulas de Geometria Espacial',
    description: 'Fazer fichas de resumo com cálculo de áreas e volumes de prismas, cilindros e cones para a prova bimestral.',
    targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'todo',
    category: 'Matemática & Exatas',
    priority: 'medium',
    progress: 0,
    estimatedHours: 8,
    loggedHours: 0,
    subtasks: [
      { id: 'sub-21', title: 'Anotar fórmulas essenciais em cartões de memória', completed: false },
      { id: 'sub-22', title: 'Resolver lista de 15 exercícios propostos', completed: false },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Vocabulário Básico de Inglês para Viagens',
    description: 'Praticar 50 expressões comuns usadas em aeroportos, hotéis, restaurantes e pedidos de ajuda.',
    targetDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    status: 'completed',
    category: 'Idiomas & Vocabulário',
    priority: 'low',
    progress: 100,
    estimatedHours: 10,
    loggedHours: 10.5,
    subtasks: [
      { id: 'sub-31', title: 'Diálogos no aeroporto e alfândega', completed: true },
      { id: 'sub-32', title: 'Vocabulário de hotel e hospedagem', completed: true },
      { id: 'sub-33', title: 'Frases para pedir comida em restaurantes', completed: true },
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
