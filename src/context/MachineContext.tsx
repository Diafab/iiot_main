import React, { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue, set, push, update } from "firebase/database";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { rtdb, db, firebaseStatus } from "../firebase";
import {
  LiveMachineData,
  LatestEventData,
  HistoricalEvent,
  InterventionRecord,
  MachineState,
  EventType,
} from "../types";
import { alarmSoundManager } from "../utils/audio";
import { useAuth } from "./AuthContext";

interface MachineContextType {
  liveData: LiveMachineData | null;
  latestEvent: LatestEventData | null;
  eventsList: HistoricalEvent[];
  interventions: InterventionRecord[];
  isStale: boolean;
  secondsSinceUpdate: number;
  loading: boolean;
  rtdbConnected: boolean;
  rtdbError: string | null;
  soundMuted: boolean;
  toggleSoundMute: () => void;
  acknowledgeEvent: (eventKey?: string) => Promise<void>;
  registerIntervention: (data: Omit<InterventionRecord, "id" | "createdAt" | "machineId">) => Promise<void>;
  simulateStateChange: (newState: MachineState) => Promise<void>;
  simulateTriggerEvent: (eventType: EventType) => Promise<void>;
  seedInitialRTDBData: () => Promise<void>;
}

const defaultLive: LiveMachineData = {
  state: "TRABAJANDO",
  gsm: true,
  wifi: true,
  power: true,
  updatedAt: Date.now(),
  source: "PLC_MODBUS_GW01",
};

const defaultLatestEvent: LatestEventData = {
  type: "TECHNICIAN_CALL",
  state: "FALLA_LUBRICACION",
  active: false,
  smsSent: true,
  timestamp: Date.now() - 300000,
  source: "SENSOR_PRESS_02",
};

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isDemoMode } = useAuth();
  const [liveData, setLiveData] = useState<LiveMachineData | null>(defaultLive);
  const [latestEvent, setLatestEvent] = useState<LatestEventData | null>(defaultLatestEvent);
  const [eventsList, setEventsList] = useState<HistoricalEvent[]>([]);
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [rtdbConnected, setRtdbConnected] = useState<boolean>(false);
  const [rtdbError, setRtdbError] = useState<string | null>(null);

  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Calculate staleness every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (liveData?.updatedAt) {
        const diffSec = Math.floor((Date.now() - liveData.updatedAt) / 1000);
        setSecondsSinceUpdate(Math.max(0, diffSec));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [liveData?.updatedAt]);

  const isStale = secondsSinceUpdate > 60; // Older than 60s is considered stale

  // Trigger Sound Alarm when active alert exists
  useEffect(() => {
    if (latestEvent && latestEvent.active) {
      if (latestEvent.type === "TECHNICIAN_CALL" || latestEvent.type === "POWER_OUTAGE") {
        alarmSoundManager.playAlarm(latestEvent.type);
      } else {
        alarmSoundManager.stop();
      }
    } else {
      alarmSoundManager.stop();
    }
  }, [latestEvent, soundMuted]);

  const toggleSoundMute = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    alarmSoundManager.setMuted(nextMuted);
  };

  // Realtime Database listeners (`onValue`)
  useEffect(() => {
    if (!rtdb || !firebaseStatus.isConfigured || isDemoMode) {
      setRtdbConnected(false);
      setLoading(false);
      // Fallback initial events list for demo mode
      setEventsList([
        {
          id: "ev-01",
          type: "TECHNICIAN_CALL",
          state: "ALTA_TEMPERATURA_MOTOR",
          active: true,
          smsSent: true,
          timestamp: Date.now() - 120000,
          source: "MODBUS_TEMP_04",
        },
        {
          id: "ev-02",
          type: "INTERVENTION_STARTED",
          state: "MANTENIMIENTO",
          active: false,
          smsSent: false,
          timestamp: Date.now() - 3600000,
          source: "TERMINAL_TECNICO_01",
        },
        {
          id: "ev-03",
          type: "POWER_OUTAGE",
          state: "CORTE ENERGIA",
          active: false,
          smsSent: true,
          timestamp: Date.now() - 86400000,
          source: "UPS_PRINCIPAL_01",
        },
      ]);
      setInterventions([
        {
          id: "int-101",
          technician: "Luis Torres",
          technicianUid: "demo-user-789",
          cause: "Desgaste de rodamiento en eje secundario",
          interventionType: "CORRECTIVA",
          replacedPart: "Rodamiento SKF 6205-2RS",
          observations: "Se realizó cambio y lubricación con grasa sintética High-Temp.",
          startTime: new Date(Date.now() - 7200000).toISOString().slice(0, 16),
          endTime: new Date(Date.now() - 3600000).toISOString().slice(0, 16),
          createdAt: Date.now() - 3600000,
          machineId: "machine01",
        },
      ]);
      return;
    }

    setLoading(true);

    // 1. Listen live data: machines/machine01/live
    const liveRef = ref(rtdb, "machines/machine01/live");
    const unsubLive = onValue(
      liveRef,
      (snapshot) => {
        setRtdbConnected(true);
        setRtdbError(null);
        if (snapshot.exists()) {
          setLiveData(snapshot.val() as LiveMachineData);
        } else {
          // If path doesn't exist yet, push default setup
          set(liveRef, defaultLive);
          setLiveData(defaultLive);
        }
        setLoading(false);
      },
      (error) => {
        console.error("RTDB Live sub error:", error);
        setRtdbError("Error al leer datos en vivo de Realtime Database: " + error.message);
        setRtdbConnected(false);
        setLoading(false);
      }
    );

    // 2. Listen latest event: machines/machine01/latestEvent
    const latestEventRef = ref(rtdb, "machines/machine01/latestEvent");
    const unsubLatest = onValue(
      latestEventRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLatestEvent(snapshot.val() as LatestEventData);
        } else {
          set(latestEventRef, defaultLatestEvent);
          setLatestEvent(defaultLatestEvent);
        }
      },
      (error) => {
        console.error("RTDB LatestEvent sub error:", error);
      }
    );

    // 3. Listen events collection: machines/machine01/events
    const eventsRef = ref(rtdb, "machines/machine01/events");
    const unsubEvents = onValue(
      eventsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawObj = snapshot.val();
          const list: HistoricalEvent[] = [];
          Object.keys(rawObj).forEach((key) => {
            list.push({
              id: key,
              ...rawObj[key],
            });
          });
          // Order by timestamp descending
          list.sort((a, b) => b.timestamp - a.timestamp);
          setEventsList(list);
        } else {
          setEventsList([]);
        }
      },
      (error) => {
        console.error("RTDB Events sub error:", error);
      }
    );

    return () => {
      unsubLive();
      unsubLatest();
      unsubEvents();
    };
  }, [isDemoMode]);

  // Firestore Interventions Listener
  useEffect(() => {
    if (!db || !firebaseStatus.isConfigured || isDemoMode) return;

    try {
      const q = query(collection(db, "interventions"), orderBy("createdAt", "desc"));
      const unsubInt = onSnapshot(
        q,
        (snapshot) => {
          const list: InterventionRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push({
              id: docSnap.id,
              ...(docSnap.data() as Omit<InterventionRecord, "id">),
            });
          });
          setInterventions(list);
        },
        (err) => {
          console.error("Firestore interventions error:", err);
        }
      );
      return () => unsubInt();
    } catch (err) {
      console.error("Interventions sub setup error:", err);
    }
  }, [isDemoMode]);

  // Acknowledge active alert
  const acknowledgeEvent = async () => {
    alarmSoundManager.stop();

    if (isDemoMode || !rtdb) {
      if (latestEvent) {
        setLatestEvent({
          ...latestEvent,
          active: false,
          acknowledgedBy: userProfile?.displayName || "Técnico",
          acknowledgedAt: Date.now(),
        });
      }
      setEventsList((prev) =>
        prev.map((ev, idx) =>
          idx === 0
            ? {
                ...ev,
                active: false,
                acknowledgedBy: userProfile?.displayName || "Técnico",
                acknowledgedAt: Date.now(),
              }
            : ev
        )
      );
      return;
    }

    try {
      const latestRef = ref(rtdb, "machines/machine01/latestEvent");
      await update(latestRef, {
        active: false,
        acknowledgedBy: userProfile?.displayName || userProfile?.email || "Técnico",
        acknowledgedAt: Date.now(),
      });
    } catch (err) {
      console.error("Acknowledge event error:", err);
    }
  };

  // Register technical intervention into Cloud Firestore
  const registerIntervention = async (
    data: Omit<InterventionRecord, "id" | "createdAt" | "machineId">
  ) => {
    const newRecord: Omit<InterventionRecord, "id"> = {
      ...data,
      machineId: "machine01",
      createdAt: Date.now(),
      technicianUid: userProfile?.uid || "tech-anon",
    };

    if (isDemoMode || !db) {
      setInterventions((prev) => [
        { id: `int-${Date.now()}`, ...newRecord },
        ...prev,
      ]);
      // Update machine live state to TRABAJANDO after intervention
      setLiveData((prev) =>
        prev
          ? { ...prev, state: "TRABAJANDO", updatedAt: Date.now() }
          : {
              state: "TRABAJANDO",
              gsm: true,
              wifi: true,
              power: true,
              updatedAt: Date.now(),
              source: "TECNICO_INTERVENCION",
            }
      );
      return;
    }

    try {
      await addDoc(collection(db, "interventions"), newRecord);

      // Also update Realtime Database machine status to TRABAJANDO
      if (rtdb) {
        const liveRef = ref(rtdb, "machines/machine01/live");
        await update(liveRef, {
          state: "TRABAJANDO",
          updatedAt: Date.now(),
          source: `INTERVENCION_${userProfile?.displayName || "TECNICO"}`,
        });

        // Record INTERVENTION_STARTED event in RTDB
        const eventData: LatestEventData = {
          type: "INTERVENTION_STARTED",
          state: "TRABAJANDO",
          active: false,
          smsSent: false,
          timestamp: Date.now(),
          source: `INTERVENCION_${userProfile?.displayName || "TECNICO"}`,
        };
        const eventsRef = ref(rtdb, "machines/machine01/events");
        await push(eventsRef, eventData);
        await set(ref(rtdb, "machines/machine01/latestEvent"), eventData);
      }
    } catch (err) {
      console.error("Error adding intervention to Firestore:", err);
      throw err;
    }
  };

  // Simulation helpers for testing states and live alerts
  const simulateStateChange = async (newState: MachineState) => {
    const updated: LiveMachineData = {
      ...(liveData || defaultLive),
      state: newState,
      power: newState !== "CORTE ENERGIA",
      updatedAt: Date.now(),
      source: "SIMULADOR_MANUAL",
    };

    if (isDemoMode || !rtdb) {
      setLiveData(updated);
      return;
    }

    try {
      const liveRef = ref(rtdb, "machines/machine01/live");
      await set(liveRef, updated);
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  const simulateTriggerEvent = async (eventType: EventType) => {
    let newStateStr = "FALLA_LUBRICACION";
    let targetState: MachineState = "FALLA";

    if (eventType === "POWER_OUTAGE") {
      newStateStr = "CORTE_ENERGIA_GENERAL";
      targetState = "CORTE ENERGIA";
    } else if (eventType === "INTERVENTION_STARTED") {
      newStateStr = "INICIO_MANTENIMIENTO";
      targetState = "MANTENIMIENTO";
    }

    const eventObj: LatestEventData = {
      type: eventType,
      state: newStateStr,
      active: true,
      smsSent: true,
      timestamp: Date.now(),
      source: "PLC_ALARM_GEN",
    };

    if (isDemoMode || !rtdb) {
      setLatestEvent(eventObj);
      setEventsList((prev) => [{ id: `ev-${Date.now()}`, ...eventObj }, ...prev]);
      setLiveData((prev) =>
        prev
          ? {
              ...prev,
              state: targetState,
              power: targetState !== "CORTE ENERGIA",
              updatedAt: Date.now(),
            }
          : defaultLive
      );
      return;
    }

    try {
      const latestRef = ref(rtdb, "machines/machine01/latestEvent");
      await set(latestRef, eventObj);

      const eventsRef = ref(rtdb, "machines/machine01/events");
      await push(eventsRef, eventObj);

      const liveRef = ref(rtdb, "machines/machine01/live");
      await update(liveRef, {
        state: targetState,
        power: targetState !== "CORTE ENERGIA",
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Simulate event error:", err);
    }
  };

  const seedInitialRTDBData = async () => {
    if (!rtdb) return;

    try {
      const liveRef = ref(rtdb, "machines/machine01/live");
      await set(liveRef, {
        state: "TRABAJANDO",
        gsm: true,
        wifi: true,
        power: true,
        updatedAt: Date.now(),
        source: "PLC_MODBUS_GW01",
      });

      const latestRef = ref(rtdb, "machines/machine01/latestEvent");
      await set(latestRef, {
        type: "TECHNICIAN_CALL",
        state: "FALLA_LUBRICACION",
        active: false,
        smsSent: true,
        timestamp: Date.now(),
        source: "SENSOR_PRESS_02",
      });

      const eventsRef = ref(rtdb, "machines/machine01/events");
      await push(eventsRef, {
        type: "TECHNICIAN_CALL",
        state: "FALLA_LUBRICACION",
        active: false,
        smsSent: true,
        timestamp: Date.now(),
        source: "SENSOR_PRESS_02",
      });
    } catch (err) {
      console.error("Seed RTDB error:", err);
    }
  };

  return (
    <MachineContext.Provider
      value={{
        liveData,
        latestEvent,
        eventsList,
        interventions,
        isStale,
        secondsSinceUpdate,
        loading,
        rtdbConnected,
        rtdbError,
        soundMuted,
        toggleSoundMute,
        acknowledgeEvent,
        registerIntervention,
        simulateStateChange,
        simulateTriggerEvent,
        seedInitialRTDBData,
      }}
    >
      {children}
    </MachineContext.Provider>
  );
};

export const useMachine = () => {
  const context = useContext(MachineContext);
  if (!context) {
    throw new Error("useMachine debe ser usado dentro de MachineProvider");
  }
  return context;
};
