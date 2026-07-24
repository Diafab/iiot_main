import React, { useState } from "react";
import {
  Activity,
  Bell,
  History,
  Wrench,
  Users,
  LogOut,
  Volume2,
  VolumeX,
  Shield,
  Wifi,
  WifiOff,
  Menu,
  X,
  HelpCircle,
  Database,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMachine } from "../context/MachineContext";
import { UserRole } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openConfigGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openConfigGuide,
}) => {
  const { userProfile, signOutUser, isDemoMode, setDemoRole } = useAuth();
  const { latestEvent, isStale, soundMuted, toggleSoundMute, rtdbConnected } = useMachine();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = userProfile?.role || "technician";

  // Role labels for industrial display
  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    admin: { label: "Administrador", color: "bg-purple-100 text-purple-800 border-purple-300" },
    maintenance_manager: { label: "Jefe Mantenimiento", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    technician: { label: "Técnico Especialista", color: "bg-blue-100 text-blue-800 border-blue-300" },
    production_manager: { label: "Jefe Producción", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity, badge: null },
    {
      id: "alerts",
      label: "Alertas Activas",
      icon: Bell,
      badge: latestEvent?.active ? "!" : null,
      badgeColor: "bg-red-600 text-white animate-pulse",
    },
    { id: "events", label: "Historial Eventos", icon: History, badge: null },
    { id: "interventions", label: "Intervenciones", icon: Wrench, badge: null },
  ];

  // Only admin and maintenance_manager can access user administration
  const canAdmin = role === "admin" || role === "maintenance_manager";
  if (canAdmin) {
    navItems.push({ id: "users", label: "Usuarios y Roles", icon: Users, badge: null, badgeColor: "" });
  }

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  INDUS<span className="text-purple-600">MONITOR</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700 bg-purple-50 border border-purple-200 rounded-full uppercase">
                  Maq. 01
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  {rtdbConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-700 font-medium">RTDB En Vivo</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-500" />
                      <span className="text-amber-700 font-medium">
                        {isDemoMode ? "Modo Demo" : "Reconectando..."}
                      </span>
                    </>
                  )}
                </span>
                {isStale && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 font-semibold rounded-md border border-amber-300">
                    Sin actualizar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-700" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        item.badgeColor || "bg-purple-200 text-purple-900"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Audio Mute toggle */}
            <button
              id="toggle-audio-mute-btn"
              onClick={toggleSoundMute}
              title={soundMuted ? "Activar sonido de alertas" : "Silenciar sonido de alertas"}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundMuted
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              }`}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Firebase config guide modal trigger */}
            <button
              id="open-firebase-guide-btn"
              onClick={openConfigGuide}
              title="Guía de Variables de Entorno Firebase"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-purple-600" />
              <span>Config Firebase</span>
            </button>

            {/* Role selector dropdown for quick preview when testing */}
            {isDemoMode && (
              <div className="flex items-center gap-1 text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-slate-500 hidden xl:inline">Rol Demo:</span>
                <select
                  id="demo-role-selector"
                  value={role}
                  onChange={(e) => setDemoRole(e.target.value as UserRole)}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="maintenance_manager">Jefe Mantenimiento</option>
                  <option value="technician">Técnico</option>
                  <option value="production_manager">Jefe Producción</option>
                </select>
              </div>
            )}

            {/* User Profile & Sign Out */}
            {userProfile ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 leading-none">
                    {userProfile.displayName}
                  </div>
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.2 mt-0.5 rounded-full border ${
                      roleLabels[role]?.color || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {roleLabels[role]?.label || role}
                  </span>
                </div>
                <button
                  id="signout-btn"
                  onClick={signOutUser}
                  title="Cerrar Sesión"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-purple-100 px-4 pt-2 pb-4 space-y-2">
          {/* User badge mobile */}
          {userProfile && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-slate-900">{userProfile.displayName}</div>
                <div className="text-xs text-purple-700">{userProfile.email}</div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  roleLabels[role]?.color
                }`}
              >
                {roleLabels[role]?.label}
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white font-semibold shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-white text-purple-900 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={openConfigGuide}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Config Firebase</span>
            </button>

            <button
              onClick={toggleSoundMute}
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                soundMuted
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-purple-50 text-purple-800 border-purple-200"
              }`}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{soundMuted ? "Silenciado" : "Sonido Activo"}</span>
            </button>

            <button
              onClick={signOutUser}
              className="p-2.5 text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
