# Aplicación Web Responsive de Monitoreo Industrial 

Sistema de supervisión industrial en tiempo real desarrollado con React, TypeScript, Tailwind CSS, Firebase Realtime Database, Cloud Firestore y Firebase Authentication con Google.

---

## 🚀 Configuración de Variables de Entorno de Firebase

Para conectar la aplicación a un proyecto real de Firebase, debe definir las siguientes variables dentro del archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY="Tu_API_Key"
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://tu-proyecto-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="tu-proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
```

El archivo `src/firebase.ts` se encarga de leer estas variables e inicializar modularmente los servicios de Firebase:
- **Firebase Authentication (Google)**: Inicio de sesión de usuarios y gestión de sesiones.
- **Firebase Realtime Database (RTDB)**: Lectura en vivo mediante `onValue()` de telemetría de máquinas y eventos.
- **Cloud Firestore**: Almacenamiento de roles de usuario, perfiles e intervenciones históricas.

---

## 📡 Estructura de Nodos en Firebase Realtime Database

La aplicación escucha en tiempo real las siguientes rutas:

### 1. `machines/machine01/live`
```json
{
  "state": "TRABAJANDO",
  "gsm": true,
  "wifi": true,
  "power": true,
  "updatedAt": 1721750000000,
  "source": "PLC_MODBUS_GW01"
}
```
*Estados permitidos:* `"TRABAJANDO" | "DETENIDA" | "MANTENIMIENTO" | "FALLA" | "CORTE ENERGIA"`

### 2. `machines/machine01/latestEvent`
```json
{
  "type": "TECHNICIAN_CALL",
  "state": "FALLA_LUBRICACION",
  "active": true,
  "smsSent": true,
  "timestamp": 1721750000000,
  "source": "SENSOR_PRESS_02"
}
```
*Tipos de evento:* `"TECHNICIAN_CALL" | "INTERVENTION_STARTED" | "POWER_OUTAGE"`

### 3. `machines/machine01/events`
Colección de nodos con histórico de eventos ordenados por marca de tiempo (`timestamp`) descendente.

---

## 🔐 Control de Acceso basado en Roles (RBAC) en Cloud Firestore

Colección Firestore: `users/{uid}`
Roles soportados:
- `admin`: Administración total de usuarios, máquinas e intervenciones.
- `maintenance_manager`: Gestión de usuarios, máquinas y registro de intervenciones.
- `technician`: Reconocimiento de alertas activas y registro de fichas de intervención.
- `production_manager`: Monitoreo en tiempo real e historial de eventos (Sólo Lectura).

> **Aviso de Seguridad:** La aplicación es exclusivamente de monitoreo y supervisión informativa. No incluye botones ni comandos que accionen o arranquen físicamente los actuadores de la máquina.
