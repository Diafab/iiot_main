import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MachineProvider } from "./context/MachineContext";
import { Navbar } from "./components/Navbar";
import { AlertBanner } from "./components/AlertBanner";
import { DashboardView } from "./components/DashboardView";
import { ActiveAlertsView } from "./components/ActiveAlertsView";
import { EventHistoryView } from "./components/EventHistoryView";
import { InterventionFormView } from "./components/InterventionFormView";
import { UserManagementView } from "./components/UserManagementView";
import { LoginView } from "./components/LoginView";
import { FirebaseConfigModal } from "./components/FirebaseConfigModal";

const MainAppContent: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [configGuideOpen, setConfigGuideOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Cargando Plataforma de Monitoreo...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and not in demo mode
  if (!userProfile) {
    return (
      <>
        <LoginView openConfigGuide={() => setConfigGuideOpen(true)} />
        <FirebaseConfigModal
          isOpen={configGuideOpen}
          onClose={() => setConfigGuideOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* Top sticky alert siren banner */}
      <AlertBanner />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openConfigGuide={() => setConfigGuideOpen(true)}
      />

      {/* Page View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === "dashboard" && <DashboardView />}
        {currentTab === "alerts" && <ActiveAlertsView />}
        {currentTab === "events" && <EventHistoryView />}
        {currentTab === "interventions" && <InterventionFormView />}
        {currentTab === "users" && <UserManagementView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            INDUSMONITOR © 2026 • Monitoreo Industrial de Telemetría (Maquinaria 01)
          </span>
          <button
            onClick={() => setConfigGuideOpen(true)}
            className="text-purple-700 hover:underline font-semibold cursor-pointer"
          >
            Estado Configuración Firebase
          </button>
        </div>
      </footer>

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={configGuideOpen}
        onClose={() => setConfigGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MachineProvider>
        <MainAppContent />
      </MachineProvider>
    </AuthProvider>
  );
}
