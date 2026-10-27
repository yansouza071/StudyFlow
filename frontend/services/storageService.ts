import { StudyObjective } from '../types';
import {
  LOCAL_STORAGE_OBJECTIVES_KEY,
  INITIAL_SAMPLE_OBJECTIVES,
} from '../constants';

export const storageService = {
  // Retorna todos os objetivos salvos no localStorage
  getObjectives(): StudyObjective[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_OBJECTIVES_KEY);
      if (!data) {
        // Inicializa com dados de exemplo na primeira visita para acolher o estudante
        this.saveObjectives(INITIAL_SAMPLE_OBJECTIVES);
        return INITIAL_SAMPLE_OBJECTIVES;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Erro ao ler objetivos do localStorage:', err);
      return INITIAL_SAMPLE_OBJECTIVES;
    }
  },

  // Persiste a lista completa de objetivos no localStorage
  saveObjectives(objectives: StudyObjective[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_OBJECTIVES_KEY, JSON.stringify(objectives));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  },

  // Cadastra um novo objetivo de estudo
  addObjective(
    data: Omit<StudyObjective, 'id' | 'createdAt' | 'updatedAt'>
  ): StudyObjective {
    const list = this.getObjectives();
    const newObjective: StudyObjective = {
      ...data,
      id: 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newObjective);
    this.saveObjectives(list);
    return newObjective;
  },

  // Atualiza um objetivo existente
  updateObjective(
    id: string,
    updates: Partial<StudyObjective>
  ): StudyObjective | null {
    const list = this.getObjectives();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated: StudyObjective = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Se o status for alterado para concluído, ajusta o progresso para 100%
    if (updates.status === 'completed' && updated.progress !== 100) {
      updated.progress = 100;
      if (updated.subtasks) {
        updated.subtasks = updated.subtasks.map((st) => ({ ...st, completed: true }));
      }
    }

    list[index] = updated;
    this.saveObjectives(list);
    return updated;
  },

  // Exclui um objetivo após a confirmação
  deleteObjective(id: string): boolean {
    const list = this.getObjectives();
    const filtered = list.filter((o) => o.id !== id);
    if (filtered.length !== list.length) {
      this.saveObjectives(filtered);
      return true;
    }
    return false;
  },

  // Alterna o estado de uma subtarefa e atualiza o progresso automaticamente
  toggleSubtask(objectiveId: string, subtaskId: string): StudyObjective | null {
    const list = this.getObjectives();
    const index = list.findIndex((o) => o.id === objectiveId);
    if (index === -1) return null;

    const obj = list[index];
    const subtasks = (obj.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const completedCount = subtasks.filter((s) => s.completed).length;
    const progress =
      subtasks.length > 0
        ? Math.round((completedCount / subtasks.length) * 100)
        : obj.progress || 0;

    const updated: StudyObjective = {
      ...obj,
      subtasks,
      progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : obj.status,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveObjectives(list);
    return updated;
  },

  // Exportar backup em arquivo JSON
  exportData(): string {
    return JSON.stringify(this.getObjectives(), null, 2);
  },

  // Importar backup de arquivo JSON
  importData(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('O arquivo não contém uma lista válida de objetivos.');
      }
      this.saveObjectives(parsed);
      return { success: true, count: parsed.length };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message };
    }
  },

  // Limpar e restaurar exemplos
  resetToSample(): void {
    this.saveObjectives(INITIAL_SAMPLE_OBJECTIVES);
  },
};
