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
import {
  getSchedules as fetchSchedules,
  getWorkplaces as fetchWorkplaces,
  createSchedule as createScheduleApi,
  updateSchedule as updateScheduleApi,
  deleteSchedule as deleteScheduleApi,
} from "../api/schedule";

const SCHEDULES_KEY = "schedules";
const WORKPLACES_KEY = "workplaces";

function hasAccessToken(): boolean {
  return !!sessionStorage.getItem("accessToken");
}

/** UUID 형식이면 true (삭제 API는 UUID만 허용) */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface SchedulesContextValue {
  schedules: ScheduleItem[];
  workplaces: Workplace[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  setWorkplaces: React.Dispatch<React.SetStateAction<Workplace[]>>;
  addSchedule: (schedule: ScheduleItem) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;
  addWorkplace: (workplace: Workplace) => void;
  isSchedulesLoading: boolean;
}

const SchedulesContext = createContext<SchedulesContextValue | null>(null);

function loadSchedulesFromStorage(): ScheduleItem[] {
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

function loadWorkplacesFromStorage(): Workplace[] {
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
  const [schedules, setSchedules] = useState<ScheduleItem[]>(loadSchedulesFromStorage);
  const [workplaces, setWorkplaces] = useState<Workplace[]>(loadWorkplacesFromStorage);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);

  // 토큰 있으면 API에서 스케줄/작업장 로드, 없으면 로컬 유지
  useEffect(() => {
    if (!hasAccessToken()) {
      setIsSchedulesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [apiSchedules, apiWorkplaces] = await Promise.all([
          fetchSchedules(),
          fetchWorkplaces(),
        ]);
        if (!cancelled) {
          if (apiSchedules.length > 0) setSchedules(apiSchedules);
          if (apiWorkplaces.length > 0) setWorkplaces(apiWorkplaces);
        }
      } catch {
        // 실패 시 로컬 데이터 유지
      } finally {
        if (!cancelled) setIsSchedulesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 로컬 캐시 동기화 (API 데이터도 로컬에 저장해 두어 오프라인 시 참고 가능)
  useEffect(() => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(WORKPLACES_KEY, JSON.stringify(workplaces));
  }, [workplaces]);

  // 다른 탭에서 localStorage 변경 시 동기화 (토큰 없을 때만 의미 있음)
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
    const clientId = schedule.id;
    setSchedules((prev) => [...prev, schedule]);
    if (hasAccessToken()) {
      createScheduleApi({ ...schedule, id: undefined }).then((created) => {
        if (created) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === clientId ? created : s))
          );
        }
      });
    }
  }, []);

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    if (hasAccessToken()) {
      updateScheduleApi(id, updates).then((updated) => {
        if (updated) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
          return;
        }
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
      });
      return;
    }
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    const removeFromState = () => setSchedules((prev) => prev.filter((s) => s.id !== id));
    if (hasAccessToken() && isUuid(id)) {
      deleteScheduleApi(id).then((ok) => {
        if (ok) removeFromState();
      });
      return;
    }
    removeFromState();
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
    isSchedulesLoading,
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
