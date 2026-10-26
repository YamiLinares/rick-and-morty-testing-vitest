# Rick and Morty Explorer 🧪 — Pruebas automatizadas con Vitest

Aplicación web para explorar los personajes de Rick and Morty, construida con Next.js 16, React 19 y Tailwind CSS v4. Este repositorio es un **fork** del proyecto base [Kodigo-academic/rick-and-morty-testing-activity](https://github.com/Kodigo-academic/rick-and-morty-testing-activity). Sobre ese proyecto se agregó una suite de pruebas unitarias con **Vitest** y **React Testing Library**, con cobertura de código.

## Objetivo de la actividad

Garantizar la calidad y estabilidad del software con pruebas automatizadas. La meta es una cobertura mínima del **80 % en statements, branches, functions y lines**, medida con `vitest run --coverage` y con un reporte HTML navegable.

## Características de la aplicación

- **Exploración de personajes:** cuadrícula responsive con imagen, nombre, estado, especie y última ubicación.
- **Detalle de personaje:** género, tipo, origen, ubicación, fecha de creación y lista de episodios.
- **Paginación** entre las páginas de la API.
- **Estados de carga, error, vacío y 404.**
- **Diseño oscuro y responsive.**
- **Server-Side Rendering** con el App Router de Next.js: las páginas son Server Components.

## Tecnologías

| Herramienta | Versión | Uso |
| --- | --- | --- |
| Next.js | 16.1.6 | App Router, Server Components, `next/image` |
| React | 19.2.3 | Interfaz |
| TypeScript | 5.9 (modo `strict`) | Tipado |
| Tailwind CSS | 4 | Estilos |
| Vitest | 5.0.5 | Ejecución de pruebas |
| @vitest/coverage-v8 | 5.0.5 | Cobertura con el motor V8 |
| @testing-library/react | 16.3.3 | Renderizado y consultas accesibles |
| @testing-library/user-event | 14.6.8 | Interacciones de usuario (clics) |
| @testing-library/jest-dom | 7.0.1 | Matchers como `toBeInTheDocument` |
| jsdom | 30.1.3 | DOM simulado para los componentes |
| @vitejs/plugin-react | 6.1.2 | Transformación de JSX/TSX en las pruebas |
| pnpm | 11.5 (lockfile v9) | Administrador de paquetes del proyecto |

Probado con Node.js 24.16 en Windows 11.

## Instalación

```bash
git clone https://github.com/YamiLinares/rick-and-morty-testing-vitest.git
cd rick-and-morty-testing-vitest
pnpm install
```

El proyecto usa **pnpm** (`pnpm-lock.yaml`). `pnpm-workspace.yaml` declara qué paquetes no ejecutan scripts de compilación:

- `ignoredBuiltDependencies` para pnpm 10;
- `allowBuilds` para pnpm 11.

Sin esta segunda opción, pnpm 11 detiene `pnpm install` y todos los scripts.

## Ejecución en modo desarrollo

```bash
pnpm dev        # http://localhost:3000
pnpm build      # compilación de producción
pnpm start
```

La app consume la API pública `https://rickandmortyapi.com/api`, así que necesita conexión a Internet. Las pruebas no la necesitan.

## Comandos de pruebas

| Comando | Qué hace |
| --- | --- |
| `pnpm test` | Vitest en modo observación: vuelve a ejecutar al guardar |
| `pnpm test:run` | Ejecuta todas las pruebas una vez |
| `pnpm test:coverage` | Ejecuta las pruebas y genera la cobertura (`vitest run --coverage`) |
| `npx vitest run --coverage` | Lo mismo, sin pasar por los scripts |
| `pnpm lint` / `pnpm typecheck` | ESLint y TypeScript (`tsc --noEmit`) |

## Configuración de Vitest

**`vitest.config.ts`:**

- `@vitejs/plugin-react` transforma JSX/TSX y el alias `@/` apunta a `src/`, igual que en `tsconfig.json`.
- **Entorno:** `jsdom`, `globals: true` (para que Testing Library limpie el DOM) y `setupFiles: ./vitest.setup.ts`.
- **Mocks limpios:** `restoreMocks`, `clearMocks` y `unstubGlobals`, para que cada prueba empiece sin restos de la anterior.
- **Cobertura:**
  - proveedor `v8`;
  - mide **todo `src/`**, aunque una prueba no lo importe;
  - solo excluye `src/types/`, que tiene únicamente interfaces de TypeScript y no genera código ejecutable;
  - **umbrales del 80 %** en statements, branches, functions y lines;
  - reportes `text` (tabla en consola con todos los archivos), `html` (reporte navegable) y `lcovonly` (`lcov.info` para CI).

**`vitest.setup.ts`:** carga los matchers de jest-dom y desmonta los componentes después de cada prueba.

**Otros ajustes:**

- `package.json` declara `"type": "module"`, para que Vite cargue `vitest.config.ts` como módulo ES sin advertencias.
- `eslint.config.mjs` ignora `coverage/`, que es código generado.

## Estructura de las pruebas

```
tests/
├── fixtures/rickandmorty.ts         datos de prueba (personaje, episodio, respuesta) y jsonResponse()
├── lib/
│   ├── api.test.ts                  12 pruebas: llamadas a la API con fetch simulado
│   └── utils.test.ts                35 pruebas: lógica de negocio (página, ids, estado, fechas)
├── components/
│   ├── CharacterCard.test.tsx        6 pruebas
│   └── Pagination.test.tsx           5 pruebas
└── app/
    ├── home-page.test.tsx           10 pruebas: página principal (Server Component)
    ├── character-page.test.tsx      13 pruebas: detalle del personaje (Server Component)
    ├── states.test.tsx               4 pruebas: error.tsx, loading.tsx y not-found.tsx
    └── layout.test.tsx               4 pruebas: layout, cabecera, metadatos
```

La carpeta `tests/` replica la estructura de `src/`: cada archivo prueba un módulo.

## Tipos de pruebas implementadas

- **Funciones utilitarias y lógica de negocio** (`src/lib/utils.ts`):
  - conversión segura del parámetro `?page=`;
  - validación del id del personaje;
  - extracción de ids de episodios desde sus URLs;
  - color según el estado;
  - formato de fecha.

  Usan entradas y resultados explícitos y cubren casos límite: texto, cero, negativos, decimales, vacío, números enormes, parámetros repetidos y fechas inválidas.
- **Llamadas a la API** (`src/lib/api.ts`), con `fetch` reemplazado por `vi.stubGlobal`, de modo que nunca salen a Internet. Cubren:
  - respuesta correcta y URL pedida;
  - página por defecto y lista vacía;
  - error HTTP (404 y 500) con su código;
  - fallo de red;
  - un solo episodio (la API devuelve un objeto y no una lista);
  - ningún episodio (no se hace la petición).
- **Componentes React** con React Testing Library, usando consultas accesibles (`getByRole`, `getByText`). Verifican:
  - textos e imagen con su texto alternativo;
  - enlaces y sus destinos;
  - el color del estado;
  - los botones desactivados de la paginación.
- **Páginas (Server Components asíncronos):** se espera el componente (`await Home(...)`) y se renderiza el JSX que devuelve. `getCharacters`, `getCharacter` y `getEpisodes` se simulan con `vi.mock`, pero `ApiError` sigue siendo la clase real. Cubren:
  - página válida e inválida;
  - estado vacío;
  - página inexistente (404);
  - errores que deben llegar a `error.tsx`;
  - fallo de red;
  - id inválido y personaje inexistente, que deben dar `notFound()`.
- **Estados de la interfaz:**
  - error, con un clic real en «Try again» mediante `user-event`;
  - carga;
  - 404;
  - layout, con `next/font` simulado, porque solo funciona cuando compila Next.js.

No hay snapshots: cada prueba comprueba un comportamiento concreto.

## Defectos encontrados y corregidos

Las pruebas y la revisión del código detectaron defectos reales en el proyecto base. Se corrigieron sin cambiar el diseño:

| Defecto | Corrección |
| --- | --- |
| `?page=abc` daba `NaN`; `?page=0` o `?page=-3` llegaban a la API y a la paginación («Page NaN of 42») | `parsePageParam`: cualquier valor que no sea un entero positivo vuelve a la página 1 |
| Una página inexistente (`?page=999`) mostraba el error genérico | La API responde 404 → estado vacío con enlace a la página 1 |
| `/character/abc` o un personaje inexistente mostraban «We couldn't load the characters» | Id inválido → 404 sin llamar a la API; 404 de la API → `notFound()`. Se agregó `not-found.tsx` con el mismo estilo |
| Una lista vacía dejaba la cuadrícula en blanco | Mensaje «No characters found» |
| Una fecha inválida mostraba «Invalid Date» y la fecha dependía de la zona horaria del servidor | `formatCreatedDate`: «Unknown» si es inválida, y formato en UTC |
| El color del estado estaba duplicado (un objeto en la tarjeta y un ternario en el detalle) | Una sola función, `getStatusColor` |
| La extracción de ids de episodios estaba dentro de la página y no toleraba URLs con barra final | Función `getEpisodeIds` |
| `pnpm lint` fallaba en `error.tsx` (apóstrofo sin escapar) | `&apos;` |
| `images.domains` está obsoleto en Next.js 16 (advertencia en el build) | `images.remotePatterns`, limitado a `https://rickandmortyapi.com/api/character/avatar/**` |
| La paginación no era una región de navegación | `<nav aria-label="Pagination">` y `aria-disabled` en los botones inactivos |

**Comprobación de que las pruebas detectan defectos:** se volvió a poner temporalmente el `parseInt` original. Fallaron **9 pruebas**. Al restaurar la corrección pasaron todas.

## Cobertura: qué mide cada métrica

| Métrica | Qué cuenta |
| --- | --- |
| **Statements** (sentencias) | Porcentaje de instrucciones ejecutadas al menos una vez |
| **Branches** (ramas) | Porcentaje de caminos de cada decisión que se recorrieron (`if`/`else`, ternarios, `&&`, `??`, `catch`) |
| **Functions** (funciones) | Porcentaje de funciones y componentes que se llamaron al menos una vez |
| **Lines** (líneas) | Porcentaje de líneas de código ejecutadas |

**Umbrales:** 80 % en las cuatro métricas, configurados en `vitest.config.ts`. Si una métrica baja del 80 %, el comando termina con código de salida 1.

Esto se comprobó forzando un umbral imposible:

```bash
npx vitest run --coverage --coverage.thresholds.branches=101
# ERROR: Coverage for branches (100%) does not meet global threshold (101%)  → exit 1
```

## Resultados de la ejecución final

Resultado de `pnpm test:coverage` con Vitest 5.0.5 (26/10/2026):

- **8 archivos de prueba, 89 pruebas, 89 aprobadas**, 0 fallidas.

| Métrica | Resultado | Umbral |
| --- | ---: | ---: |
| Statements | **100 %** (68/68) | 80 % |
| Branches | **100 %** (47/47) | 80 % |
| Functions | **100 %** (26/26) | 80 % |
| Lines | **100 %** (62/62) | 80 % |

**Archivos medidos:**

- `app/error.tsx`, `app/layout.tsx`, `app/loading.tsx`, `app/not-found.tsx` y `app/page.tsx`;
- `app/character/[id]/page.tsx`;
- `components/CharacterCard.tsx` y `components/Pagination.tsx`;
- `lib/api.ts` y `lib/utils.ts`.

Todos están al 100 %.

**Otros resultados:**

- `pnpm lint`: sin errores ni advertencias. En el proyecto base fallaba con 1 error.
- `pnpm typecheck`: sin errores.
- `pnpm build`: correcto, ya sin la advertencia de `images.domains`.

**Verificación manual con la API real (compilación de producción):**

- `/` muestra «Page 1 of 42».
- `?page=abc` y `?page=0` muestran la página 1.
- `?page=999` muestra el estado vacío.
- `/character/1` muestra el detalle con 51 episodios.
- `/character/abc` y `/character/99999` muestran la página 404.

## Reporte HTML de cobertura

- **Ubicación:** `coverage/index.html`. Se genera con cada `pnpm test:coverage` y está incluido en el repositorio con el resultado final.
- **Cómo abrirlo:**
  - Windows: doble clic en el archivo, o `start coverage/index.html`;
  - macOS: `open coverage/index.html`.
- **Qué permite:** recorrer las carpetas y ver cada archivo con sus líneas pintadas en verde (ejecutada) o rojo (sin ejecutar), y cuántas veces se ejecutó cada una.

## Evidencias

| Archivo | Contenido |
| --- | --- |
| `evidencias/cobertura-vitest.png` | Captura de pantalla real de la consola de Windows ejecutando `npx vitest run --coverage` (26/10/2026, 15:03). Muestra las 89 pruebas aprobadas, la tabla por archivo, el resumen de las 4 métricas y el código de salida 0. La primera línea, en amarillo, la imprime el script que abrió la ventana para indicar el comando ejecutado |
| `evidencias/resultado-vitest.txt` | Transcripción de esa misma ejecución, guardada con `Tee-Object` |
| `evidencias/reporte-html-cobertura.png` | Captura del reporte `coverage/index.html` abierto en el navegador |
| `evidencias/reporte-html-utils.png` | Detalle de `lib/utils.ts` en el reporte HTML, con el número de veces que se ejecutó cada línea |

## Estructura del proyecto

- `src/app`: rutas de la aplicación (App Router).
  - `page.tsx`: página principal (lista de personajes);
  - `character/[id]/page.tsx`: detalle de personaje;
  - `loading.tsx`, `error.tsx` y `not-found.tsx`: estados de carga, error y 404;
  - `layout.tsx`: layout principal con cabecera y pie de página.
- `src/components`: `CharacterCard` y `Pagination`.
- `src/lib`:
  - `api.ts`: cliente de la API y `ApiError`;
  - `utils.ts`: lógica de negocio.
- `src/types`: tipos de la API.
- `tests/`: pruebas (ver arriba).
- `coverage/`: reporte de cobertura.
- `evidencias/`: capturas y transcripción.

## Limitaciones conocidas

- **Pruebas unitarias, no de extremo a extremo.** No hay pruebas e2e en un navegador real (por ejemplo, con Playwright). La navegación entre páginas y la descarga de imágenes se revisaron a mano contra la API real.
- **Server Components:** se prueban llamando a la función asíncrona y renderizando el JSX que devuelve. Así se verifica su lógica y su salida, pero no el streaming ni el código de estado HTTP que genera Next.js. Por ejemplo, en `/character/abc` Next.js muestra la página 404, pero responde con estado 200 y `noindex`, porque `loading.tsx` ya empezó a transmitir la respuesta.
- **Fechas:** las pruebas de fechas usan el formato `en-US` en UTC, el mismo que usa la app.
- **Textos en inglés:** la interfaz sigue en inglés, como en el proyecto base.
- **Errores al cargar episodios:** si falla la carga de episodios, se muestra el error genérico de la página, igual que en el proyecto base.
