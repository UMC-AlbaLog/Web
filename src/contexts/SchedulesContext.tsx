import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { ScheduleItem, Workplace } from "../types/schedule";
import { SEED_SCHEDULES, SEED_WORKPLACES } from "../data/scheduleSeed";

const SCHEDULES_KEY = "schedules";
const WORKPLACES_KEY = "workplaces";

interface SchedulesContextValue {
  schedules: ScheduleItem[];
  workplaces: Workplace[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  setWorkplaces: React.Dispatch<React.SetStateAction<Workplace[]>>;
  addSchedule: (schedule: ScheduleItem) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;
  addWorkplace: (workplace: Workplace) => void;
}

const SchedulesContext = createContext<SchedulesContextValue | null>(null);

function loadSchedules(): ScheduleItem[] {
  try {
    const saved = localStorage.getItem(SCHEDULES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...SEED_SCHEDULES];
}

function loadWorkplaces(): Workplace[] {
  try {
    const saved = localStorage.getItem(WORKPLACES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...SEED_WORKPLACES];
}

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(loadSchedules);
  const [workplaces, setWorkplaces] = useState<Workplace[]>(loadWorkplaces);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(WORKPLACES_KEY, JSON.stringify(workplaces));
  }, [workplaces]);

  // 다른 탭에서 localStorage 변경 시 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SCHEDULES_KEY && e.newValue) {
        try {
          setSchedules(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === WORKPLACES_KEY && e.newValue) {
        try {
          setWorkplaces(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    setSchedules((prev) => [...prev, schedule]);
  }, []);

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addWorkplace = useCallback((workplace: Workplace) => {
    setWorkplaces((prev) => {
      if (prev.some((w) => w.id === workplace.id)) return prev;
      return [...prev, workplace];
    });
  }, []);

  const value: SchedulesContextValue = {
    schedules,
    workplaces,
    setSchedules,
    setWorkplaces,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addWorkplace,
  };

  return (
    <SchedulesContext.Provider value={value}>
      {children}
    </SchedulesContext.Provider>
  );
}

export function useSchedules(): SchedulesContextValue {
  const ctx = useContext(SchedulesContext);
  if (!ctx) {
    throw new Error("useSchedules must be used within SchedulesProvider");
  }
  return ctx;
}
