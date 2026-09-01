# Guardias médicas

Aplicación web móvil y sencilla para marcar guardias en un calendario y estimar el salario mensual de un médico residente en València. Calcula nómina base, pago de guardias, bruto, IRPF y estimación posterior al IRPF (no un neto exacto).

## Stack

React, TypeScript, Vite, Firebase Authentication, Cloud Firestore, date-fns, CSS y Vitest. Incluye un manifiesto PWA básico instalable; no usa GitHub Pages.

## Instalación y ejecución

```bash
npm install
cp .env.example .env
npm run dev
```

Compilación y pruebas:

```bash
npm run build
npm test
```

## Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Añade una aplicación web y copia su configuración en `.env`:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

3. En **Authentication → Sign-in method**, habilita **Correo electrónico/contraseña**.
4. En **Firestore Database**, crea una base de datos (elige una región cercana a tus usuarios).
5. Publica las reglas de `firestore.rules`, desde la consola o con Firebase CLI: `firebase deploy --only firestore:rules`.
6. Añade los dominios de producción a **Authentication → Settings → Authorized domains**.

Sin las seis variables, la aplicación compila y muestra una explicación de configuración en vez del login. No incluyas `.env` en Git.

## Datos y seguridad

El perfil vive en `users/{uid}/profile` y cada mes en `users/{uid}/months/{YYYY-MM}`. Las reglas permiten leer y escribir esa rama únicamente al usuario cuyo UID coincide. Firebase Auth administra las contraseñas; nunca se almacenan en Firestore.

## Arquitectura

- `src/config/salaryRates.ts`: única fuente de tarifas por año de residencia.
- `src/config/holidays/`: festivos oficiales por año; el índice selecciona el calendario correspondiente.
- `src/domain/calculateSalary.ts`: clasificación y cálculo puros, sin React ni Firebase.
- `src/services/firebase.ts`: inicialización condicionada por variables de entorno.
- `src/App.tsx`: autenticación, persistencia, calendario, ajustes y desglose.
- `firestore.rules`: aislamiento de datos por UID.

Para añadir otro año, crea `src/config/holidays/2027.ts` con un mapa fecha/nombre e impórtalo en `src/config/holidays/index.ts`. Para cambiar tarifas, edita exclusivamente `src/config/salaryRates.ts`. Los festivos especiales empiezan vacíos y cada usuario puede administrarlos en **Ajustes**.

## Alcance del cálculo

La paga extra no se suma. La cifra final descuenta únicamente el porcentaje de IRPF configurado; no incluye Seguridad Social ni otras deducciones. Las tarifas y festivos deben revisarse cuando cambie la normativa o el centro de trabajo.
