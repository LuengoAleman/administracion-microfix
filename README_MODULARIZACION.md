# Microfix — modularización de App

Esta carpeta contiene una refactorización del `App` monolítico separando:

- **Interfaz:** `components/` y `pages/`
- **Lógica de negocio:** `logic/`
- **Acceso a Supabase:** `services/`
- **Estado compartido:** `hooks/`
- **Configuración:** `config/`
- **Estilos compartidos:** `styles/`
- **Utilidades:** `utils/`

## Integración

1. Hacé una copia de seguridad de tu `src/App.jsx` actual.
2. Conservá tu `src/supabase.js` actual.
3. Copiá el contenido de esta carpeta `src/` sobre el `src/` de tu proyecto.
4. No copies `src/supabase.README.txt` si no lo necesitás.
5. Ejecutá tu flujo normal: `npm install` y `npm run dev`.

## Verificación incluida

Desde esta carpeta podés correr:

```bash
npm run test:modularizacion
```

Las pruebas validan lógica crítica y que no haya imports relativos rotos.

> La refactorización mantiene la API y los nombres de tablas existentes (`reparaciones`, `clientes`, `operarios`, `stock`, `gastos`).

## Nota sobre estilos

Los tokens y estilos reutilizables están en `src/styles/theme.js` y los estilos globales en `src/styles/global.css`. Los estilos de layout que son exclusivos de una vista se mantuvieron junto al JSX para minimizar cambios visuales durante esta refactorización; no contienen lógica de negocio ni acceso a datos.

## Resultado de validación realizada

- 29 archivos JS/JSX parseados sin errores sintácticos.
- 11/11 pruebas automáticas pasadas.
- Imports relativos verificados.
- Imports nombrados/default verificados contra sus exports.
- Sin acceso directo a Supabase desde `pages/` o `components/`.
