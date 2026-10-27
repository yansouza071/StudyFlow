import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Target,
  Coffee,
  Check,
} from 'lucide-react';
import { StudyObjective, StudySession } from '../types';
import { soundService } from '../services/audioService';

interface PomodoroTimerProps {
  objectives: StudyObjective[];
  selectedObjectiveId?: string;
  onSelectObjective?: (id: string) => void;
  onSessionComplete: (objectiveId: string | undefined, durationMinutes: number) => void;
  recentSessions: StudySession[];
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODE_CONFIG = {
  focus: { label: 'Foco Total', defaultSeconds: 25 * 60, icon: Target, color: 'text-indigo-600', ringColor: 'stroke-indigo-600' },
  short_break: { label: 'Pausa Curta', defaultSeconds: 5 * 60, icon: Coffee, color: 'text-emerald-600', ringColor: 'stroke-emerald-500' },
  long_break: { label: 'Pausa Longa', defaultSeconds: 15 * 60, icon: Coffee, color: 'text-sky-600', ringColor: 'stroke-sky-500' },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  objectives,
  selectedObjectiveId,
  onSelectObjective,
  onSessionComplete,
  recentSessions,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.focus.defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeObjectiveId, setActiveObjectiveId] = useState<string>(
    selectedObjectiveId || (objectives.length > 0 ? objectives[0].id : '')
  );
  const [sessionSuccessToast, setSessionSuccessToast] = useState<string | null>(null);

  // Sync selected objective if passed from props
  useEffect(() => {
    if (selectedObjectiveId) {
      setActiveObjectiveId(selectedObjectiveId);
    }
  }, [selectedObjectiveId]);

  // Timer interval hook
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Completed!
      setIsRunning(false);
      const sessionDuration = Math.round(MODE_CONFIG[mode].defaultSeconds / 60);

      if (mode === 'focus') {
        if (soundEnabled) soundService.playFocusComplete();
        onSessionComplete(activeObjectiveId || undefined, sessionDuration);
        setSessionSuccessToast(
          `🎉 Parabéns! Sessão de ${sessionDuration} min de foco concluída e registrada!`
        );
        // Switch to break
        setMode('short_break');
        setTimeLeft(MODE_CONFIG.short_break.defaultSeconds);
      } else {
        if (soundEnabled) soundService.playBreakEnd();
        setSessionSuccessToast('☕ Pausa finalizada! Pronto para o próximo ciclo de foco?');
        setMode('focus');
        setTimeLeft(MODE_CONFIG.focus.defaultSeconds);
      }

      setTimeout(() => {
        setSessionSuccessToast(null);
      }, 6000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, activeObjectiveId, onSessionComplete, soundEnabled]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].defaultSeconds);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].defaultSeconds);
  };

  const handleAddFiveMinutes = () => {
    setTimeLeft((prev) => prev + 300);
  };

  // Format time MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = MODE_CONFIG[mode].defaultSeconds;
  const progressPercent = ((currentTotal - timeLeft) / currentTotal) * 100;

  const activeObjective = objectives.find((o) => o.id === activeObjectiveId);

  // Calculate today's stats
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySessions = recentSessions.filter(
    (s) => s.timestamp.startsWith(todayDateStr) && s.type === 'focus'
  );
  const todayTotalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast alert */}
      {sessionSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{sessionSuccessToast}</span>
          </div>
          <button
            onClick={() => setSessionSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Timer Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className={`absolute top-0 inset-x-0 h-2 ${
            mode === 'focus' ? 'bg-indigo-600' : 'bg-emerald-500'
          }`}
        />

        {/* Sound toggle in top right */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Técnica Pomodoro Integrada</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 bg-slate-50"
            title={soundEnabled ? 'Silenciar sinos' : 'Ativar sinos'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Som Ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                <span>Mudo</span>
              </>
            )}
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6">
          {(['focus', 'short_break', 'long_break'] as TimerMode[]).map((m) => {
            const config = MODE_CONFIG[m];
            const isActive = mode === m;
            const Icon = config.icon;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? config.color : 'text-slate-400'}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Linked Objective Picker */}
        <div className="w-full max-w-md mb-8">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Vinculado ao Objetivo:
          </label>
          <select
            value={activeObjectiveId}
            onChange={(e) => {
              setActiveObjectiveId(e.target.value);
              if (onSelectObjective) onSelectObjective(e.target.value);
            }}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:border-indigo-500 outline-none"
          >
            {objectives.length === 0 ? (
              <option value="">Nenhum objetivo cadastrado</option>
            ) : (
              objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title} ({obj.category || 'Geral'})
                </option>
              ))
            )}
          </select>

          {activeObjective && (
            <p className="mt-1.5 text-xs text-indigo-600 font-medium">
              As horas desta sessão serão adicionadas automaticamente a &quot;{activeObjective.title}&quot;
            </p>
          )}
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className={`${
                mode === 'focus' ? 'stroke-indigo-600' : 'stroke-emerald-500'
              } transition-all duration-300`}
              strokeWidth="10"
              strokeDasharray="276"
              strokeDashoffset={`${276 - (276 * progressPercent) / 100}`}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono">
              {formattedTime}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              {mode === 'focus' ? 'Foco Produtivo' : 'Momento de Descanso'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={handleReset}
            title="Reiniciar cronômetro"
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-extrabold text-white shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : mode === 'focus'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>Iniciar Foco</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddFiveMinutes}
            title="Adicionar 5 minutos"
            className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            +5 min
          </button>
        </div>
      </div>

      {/* Today's Productivity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tempo Estudado Hoje</p>
            <p className="text-xl font-black text-slate-900">
              {todayTotalMinutes} minutos{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({(todayTotalMinutes / 60).toFixed(1)}h)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Ciclos Pomodoro Hoje</p>
            <p className="text-xl font-black text-emerald-600">
              {todaySessions.length} sessões
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Dica de Foco</p>
            <p className="text-xs text-slate-600 font-medium">
              Elimine notificações do celular durante os 25 minutos para atingir o estado de Flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
