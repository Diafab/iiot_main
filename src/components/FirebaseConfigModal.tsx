import React from "react";
import { X, Database, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { firebaseStatus } from "../firebase";

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const envSnippet = `# Archivo .env en la raíz del proyecto
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://tu-proyecto-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="tu-proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-purple-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Configuración de Firebase (.env)</h2>
              <p className="text-xs text-purple-200">Variables de entorno requeridas para conexión real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              firebaseStatus.isConfigured
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {firebaseStatus.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold">
                {firebaseStatus.isConfigured
                  ? "Variables de Entorno Detectadas Correctamente"
                  : "Variables de Entorno Incompletas o no Encontradas"}
              </h4>
              <p className="mt-0.5">
                {firebaseStatus.isConfigured
                  ? "La aplicación está usando la configuración de Firebase desde el archivo de entorno."
                  : `Faltan las siguientes variables: ${firebaseStatus.missingVars.join(", ")}`}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Dónde colocar las variables:</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>Cree o edite el archivo <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-purple-700">.env</code> en la raíz del proyecto.</li>
              <li>Obtenga sus credenciales desde la Consola de Firebase en <span className="font-semibold text-slate-800">Configuración del Proyecto &gt; Sus Aplicaciones (Web)</span>.</li>
              <li>Asegúrese de habilitar <span className="font-semibold text-slate-800">Realtime Database</span>, <span className="font-semibold text-slate-800">Cloud Firestore</span> y <span className="font-semibold text-slate-800">Firebase Authentication (Google)</span> en su proyecto de Firebase.</li>
            </ol>
          </div>

          {/* Code snippet */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl font-mono text-[11px]">
              <span>Estructura de .env</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-purple-300 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-purple-300 font-mono rounded-b-xl overflow-x-auto text-[11px]">
              {envSnippet}
            </pre>
          </div>

          {/* Realtime database rules guidance */}
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-purple-900 space-y-1">
            <h4 className="font-bold text-purple-950">Estructura Realtime Database requerida:</h4>
            <p className="font-mono text-[11px] text-purple-800">
              machines/machine01/live<br />
              machines/machine01/latestEvent<br />
              machines/machine01/events
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
