UNIVERSIDAD NACIONAL DE COSTA RICA

Escuela de Informática

Programación IV

**Taller: Mahjong Colaborativo**

WebSockets en Tiempo Real con React, Socket.io y TypeScript

*Taller de programación web, donde construirás un juego multijugador
colaborativo, descubriendo paso a paso cómo la comunicación en tiempo
real transforma la web.*

2026 -- I Cuatrimestre

# 1. Comunicación en Tiempo Real: Contexto y Visión

En la web tradicional, el navegador envía una solicitud al servidor,
recibe una respuesta y la conexión se cierra. Si quieres saber si hay
algo nuevo, tienes que volver a preguntar. Los **WebSockets** cambian
esta dinámica: establecen un canal permanente y bidireccional donde
cualquiera de los dos lados puede enviar datos en cualquier momento.

**Socket.io** es una librería que abstrae WebSockets y agrega reconexión
automática, fallback a otros protocolos, soporte para salas (rooms) y un
sistema de eventos intuitivo. Es la herramienta que usaremos para
construir nuestro juego.

+-----------------------------------------------------------------------+
| ![](media/image1.png){width="6.2763156167979in"                       |
| height="4.1842104111986in"}                                           |
|                                                                       |
| **Diagrama HTTP vs WebSocket**                                        |
+=======================================================================+
+-----------------------------------------------------------------------+

## ¿Qué vamos a construir?

Un juego de **Mahjong Colaborativo Multijugador** donde hasta 5
jugadores colaboran para encontrar parejas de fichas en el menor tiempo
posible. Cada jugador verá en tiempo real cuándo otro selecciona una
ficha (que se bloqueará para los demás), los puntajes actualizados al
instante, y un gráfico en vivo con la evolución de la partida. Sin base
de datos, sin cuentas: solo un nombre y a jugar.

  -----------------------------------------------------------------------
  ![](media/image2.png){width="6.453486439195101in"
  height="4.302325021872266in"}**Infografía de arquitectura del
  proyecto**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 2. Preparación del Entorno

Necesitas tener instalado **Node.js v18+** (verifica con node
\--version), **Git** y un editor como VS Code. Vamos a crear un monorepo
ligero con backend y frontend separados.

## Inicialización del proyecto

+-----------------------------------------------------------------------+
| mkdir mahjong-coop && cd mahjong-coop                                 |
|                                                                       |
| mkdir server                                                          |
|                                                                       |
| npm create vite@latest client \-- \--template react-ts                |
|                                                                       |
| cd server && npm init -y                                              |
+=======================================================================+
+-----------------------------------------------------------------------+

La carpeta server contendrá el backend (Express + Socket.io) y client el
frontend React con TypeScript, creado con Vite para desarrollo rápido
con Hot Module Replacement.

## Dependencias

En la carpeta server:

+-----------------------------------------------------------------------+
| npm install express socket.io cors                                    |
|                                                                       |
| npm install -D typescript ts-node nodemon \@types/express             |
| \@types/cors                                                          |
|                                                                       |
| npx tsc \--init                                                       |
+=======================================================================+
+-----------------------------------------------------------------------+

En la carpeta client:

  -----------------------------------------------------------------------
  npm install socket.io-client recharts
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

Socket.io necesita instalarse en ambos lados (servidor y cliente).
**Recharts** nos servirá para el gráfico de puntajes en tiempo real.

## Estructura de archivos

+-----------------------------------------------------------------------+
| mahjong-coop/                                                         |
|                                                                       |
| ├── server/src/                                                       |
|                                                                       |
| │ ├── index.ts // Punto de entrada del servidor                       |
|                                                                       |
| │ ├── socket.ts // Eventos de Socket.io                               |
|                                                                       |
| │ ├── game.ts // Lógica del juego                                     |
|                                                                       |
| │ └── types.ts // Interfaces TypeScript                               |
|                                                                       |
| └── client/src/                                                       |
|                                                                       |
| ├── hooks/useSocket.ts                                                |
|                                                                       |
| ├── components/                                                       |
|                                                                       |
| │ ├── Lobby.tsx ├── Board.tsx                                         |
|                                                                       |
| │ ├── Tile.tsx ├── Scoreboard.tsx                                     |
|                                                                       |
| │ └── LiveChart.tsx                                                   |
|                                                                       |
| └── types.ts                                                          |
+=======================================================================+
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DESAFÍO: Configura el tsconfig.json del servidor**                  |
|                                                                       |
| Investiga en la documentación de TypeScript y configura target:       |
| ES2020, module: commonjs, outDir: dist, rootDir: src, strict: true y  |
| esModuleInterop: true. Agrega scripts en package.json: build (tsc),   |
| start (node dist/index.js) y dev (nodemon src/index.ts).              |
+=======================================================================+
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  **Resultado esperado:** Al terminar, \'npm run dev\' en server debe
  mostrar un mensaje en consola. \'npm run dev\' en client debe abrir la
  app de Vite en el navegador.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 3. El Servidor Backend

El servidor es la fuente de verdad: sabe qué jugadores están conectados,
qué fichas se han destapado y quién lleva más puntos. Los clientes son
ventanas que muestran lo que el servidor les dice.

## Paso 1: Tipos TypeScript (types.ts)

Definí las interfaces que serán el contrato entre servidor y cliente:

+-----------------------------------------------------------------------+
| export interface Tile {                                               |
|                                                                       |
| id: string; symbol: string; isFlipped: boolean;                       |
|                                                                       |
| isMatched: boolean; lockedBy: string \| null;                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| export interface Player {                                             |
|                                                                       |
| id: string; name: string; score: number; isConnected: boolean;        |
|                                                                       |
| }                                                                     |
|                                                                       |
| export interface ScoreSnapshot {                                      |
|                                                                       |
| timestamp: number; scores: Record\<string, number\>;                  |
|                                                                       |
| }                                                                     |
|                                                                       |
| export interface GameState {                                          |
|                                                                       |
| tiles: Tile\[\]; players: Player\[\];                                 |
|                                                                       |
| scoreHistory: ScoreSnapshot\[\]; isGameOver: boolean;                 |
|                                                                       |
| startTime: number \| null;                                            |
|                                                                       |
| }                                                                     |
+=======================================================================+
+-----------------------------------------------------------------------+

La propiedad lockedBy en Tile almacena el socket.id del jugador que la
seleccionó, bloqueando la ficha para los demás. ScoreSnapshot captura el
puntaje de todos en un instante dado, permitiendo al gráfico dibujar la
evolución completa de la partida.

## Paso 2: Lógica del juego (game.ts)

Implementa estas funciones. Te damos las firmas; el cuerpo es tu tarea:

+-----------------------------------------------------------------------+
| import { Tile, Player, GameState, ScoreSnapshot } from \'./types\';   |
|                                                                       |
| export function createGame(pairCount: number): GameState { /\* \...   |
| \*/ }                                                                 |
|                                                                       |
| export function addPlayer(state: GameState, id: string, name:         |
| string): GameState { /\* \... \*/ }                                   |
|                                                                       |
| export function removePlayer(state: GameState, id: string): GameState |
| { /\* \... \*/ }                                                      |
|                                                                       |
| export function selectTile(state: GameState, tileId: string,          |
| playerId: string):                                                    |
|                                                                       |
| { newState: GameState; event: string \| null } { /\* \... \*/ }       |
|                                                                       |
| export function checkMatch(state: GameState, t1: string, t2: string,  |
| playerId: string):                                                    |
|                                                                       |
| { newState: GameState; isMatch: boolean } { /\* \... \*/ }            |
+=======================================================================+
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  **Tip:** Para barajar fichas, usa el algoritmo Fisher-Yates. Evita
  sort(() =\> Math.random() - 0.5) que produce resultados sesgados.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **DESAFÍO: Implementa selectTile y checkMatch**                       |
|                                                                       |
| selectTile debe verificar que la ficha no esté emparejada ni          |
| bloqueada por otro jugador. Si el jugador ya tiene una ficha          |
| seleccionada, se evalúa el par. checkMatch compara símbolos: si       |
| coinciden, marca ambas como matched e incrementa el score. Si no,     |
| desbloquea ambas. Piensa: ¿dónde se implementa el delay para mostrar  |
| fichas antes de voltearlas, en el servidor o el cliente?              |
+=======================================================================+
+-----------------------------------------------------------------------+

## Paso 3: Eventos Socket.io (socket.ts)

Socket.io funciona con eventos. Cuando el cliente dice player:join, el
servidor responde con el estado del juego. Cuando dice tile:select, el
servidor actualiza el estado y avisa a todos:

+-----------------------------------------------------------------------+
| import { Server as SocketIOServer, Socket } from \'socket.io\';       |
|                                                                       |
| import { createGame, addPlayer, removePlayer, selectTile } from       |
| \'./game\';                                                           |
|                                                                       |
| let gameState = createGame(15); // 15 pares = 30 fichas               |
|                                                                       |
| export function setupSocket(io: SocketIOServer): void {               |
|                                                                       |
| io.on(\'connection\', (socket: Socket) =\> {                          |
|                                                                       |
| // \'player:join\' -\> addPlayer, emit \'game:state\' a todos         |
|                                                                       |
| // \'tile:select\' -\> selectTile, emit \'game:state\' a todos        |
|                                                                       |
| // \'disconnect\' -\> marcar jugador desconectado (NO eliminar)       |
|                                                                       |
| });                                                                   |
|                                                                       |
| }                                                                     |
+=======================================================================+
+-----------------------------------------------------------------------+

Al desconectarse, no eliminamos al jugador: lo marcamos como
desconectado. Socket.io tiene reconexión automática, así que, si vuelve,
restauramos su sesión sin perder progreso.

+-----------------------------------------------------------------------+
| ![](media/image3.png){width="6.1361898512685915in"                    |
| height="4.0907928696412945in"}                                        |
|                                                                       |
| **Diagrama de secuencia de eventos**                                  |
+=======================================================================+
+-----------------------------------------------------------------------+

## Paso 4: Servidor Express (index.ts)

El punto de entrada crea Express, monta Socket.io sobre el servidor HTTP
y configura CORS para permitir conexiones desde http://localhost:5173
(puerto de Vite). Implementa este archivo usando las firmas de
setupSocket y haciendo que el servidor escuche en el puerto 3000.

  -----------------------------------------------------------------------
  **Resultado esperado:** \'npm run dev\' en server debe mostrar \'Server
  is running on http://localhost:3000\'. Si hay errores de TypeScript,
  revisa tus imports y que las interfaces coincidan.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 4. Generando la Interfaz con Inteligencia Artificial

Antes de escribir el frontend manualmente, vamos a aprovechar una de las
habilidades más valiosas del desarrollador moderno: saber *dirigir*
herramientas de IA para generar código rápidamente. La idea es simple:
usas Google AI Studio para generar la interfaz visual completa del
juego, la subís a un repositorio en GitHub, y luego la bajás a VS Code
para integrarla con la lógica de Socket.io que ya construiste en el
backend.

## Paso 1: Generar la UI con Google AI Studio

Ingresa a **aistudio.google.com** (es gratuito con tu cuenta de Google).
Esta herramienta te permite interactuar con modelos de IA avanzados que
pueden generar componentes React completos a partir de una descripción
detallada. La clave está en ser específico con el prompt: mientras más
contexto le des sobre las interfaces, los estados visuales y el
comportamiento esperado, mejor será el resultado.

Acá tienes un prompt de ejemplo que puedes usar como punto de partida.
Adapta los detalles según tu visión del juego:

  -----------------------------------------------------------------------
  ![](media/image4.png){width="6.5in" height="4.30625in"} **Generación
  completa de la UI del juego**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

La IA te va a devolver varios archivos de código. **No los copies a
ciegas.** Antes de usarlos, revisa que los tipos coincidan exactamente
con las interfaces que definiste en tu types.ts, que la lógica de
renderizado condicional tenga sentido (especialmente los estados de las
fichas), y que no haya dependencias que no instalaste. Si algo no te
convence, pedí correcciones con un prompt de seguimiento: cuanto más
específico seas, mejores resultados vas a obtener.

  -----------------------------------------------------------------------
  **Tip:** Puedes iterar rápidamente con la IA. Si la animación de volteo
  no te gusta, cambia a: \'The flip animation is not smooth. Use CSS
  transform: rotateY(180deg) with a 0.4s transition and
  backface-visibility: hidden.\' No tienes que conformarte con la primera
  respuesta.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## Paso 2: Subir el código a GitHub

Una vez que tienes los componentes generados y revisados, es momento de
llevarlos a tu repositorio. Si aún no tienes uno, crea un repositorio en
GitHub para tu proyecto. Luego, desde la terminal en la carpeta client,
inicializa Git, agrega los archivos y haz tu primer commit:

+-----------------------------------------------------------------------+
| cd mahjong-coop                                                       |
|                                                                       |
| git init                                                              |
|                                                                       |
| git add .                                                             |
|                                                                       |
| git commit -m \"feat: initial project structure with AI-generated     |
| UI\"                                                                  |
|                                                                       |
| git remote add origin https://github.com/tu-usuario/mahjong-coop.git  |
|                                                                       |
| git push -u origin main                                               |
+=======================================================================+
+-----------------------------------------------------------------------+

Desde este momento, todo el equipo (los 5 integrantes) puede clonar el
repositorio y trabajar sobre la misma base. Cada miembro puede tomar
ownership de un componente o una capa del proyecto.

## Paso 3: Bajar a VS Code e integrar

Cada integrante del equipo clona el repositorio y lo abre en VS Code (o
el editor de su preferencia). El código generado por la IA es un
borrador funcional de la interfaz, pero todavía no está conectado con el
servidor Socket.io. Esa es la tarea de la siguiente sección: crear el
hook useSocket que conecte los componentes con los eventos del backend,
y ajustar cada componente para que reciba datos reales del GameState en
lugar de datos de prueba.

Este flujo ---generar con IA, subir a GitHub, bajar a VS Code para
integrar--- es un patrón de trabajo real que muchos equipos
profesionales usan hoy en día. La IA te da velocidad; vos siempre pones
el criterio y la integración.

+-----------------------------------------------------------------------+
| ![](media/image5.png){width="6.433962160979878in"                     |
| height="4.289307742782152in"}                                         |
|                                                                       |
| **Infografía del flujo IA → GitHub → VS Code**                        |
+=======================================================================+
+-----------------------------------------------------------------------+

# 5. Integración del Frontend con Socket.io

Ya tienes los componentes visuales generados con IA y el servidor
funcionando. Ahora viene el paso crítico: conectar ambos mundos.
Necesitas crear la lógica que permita a React comunicarse con Socket.io
y que los componentes respondan a datos reales del servidor.

## El hook useSocket

Creá hooks/useSocket.ts: un custom hook que encapsule toda la
comunicación con Socket.io. Debe retornar:

+-----------------------------------------------------------------------+
| interface UseSocketReturn {                                           |
|                                                                       |
| socket: Socket \| null;                                               |
|                                                                       |
| gameState: GameState \| null;                                         |
|                                                                       |
| isConnected: boolean;                                                 |
|                                                                       |
| joinGame: (name: string) =\> void;                                    |
|                                                                       |
| selectTile: (tileId: string) =\> void;                                |
|                                                                       |
| }                                                                     |
+=======================================================================+
+-----------------------------------------------------------------------+

Usa useRef para la instancia del socket (no queremos re-renders al
cambiar la referencia) y useState para gameState e isConnected. En el
useEffect, inicializa la conexión, escucha los eventos connect,
disconnect y game:state, y asegurate de desconectar al desmontar el
componente.

## Componentes principales

**Lobby.tsx**: pantalla de entrada con campo de nombre y botón para
unirse. Recibe joinGame como prop. Valida que el nombre no esté vacío.

**Tile.tsx**: ficha individual con estados visuales distintos según su
condición: boca abajo, volteada, bloqueada por otro jugador (borde
pulsante), o emparejada (verde). Solo es clickeable si no está
emparejada ni bloqueada por otro. Usa React.memo para evitar re-renders
innecesarios.

**Board.tsx**: grilla de fichas usando CSS Grid (grid-template-columns:
repeat(6, 1fr)). Recibe tiles, currentPlayerId y selectTile.

**Scoreboard.tsx**: tabla de jugadores ordenados por puntaje con
indicador de conexión (verde/gris).

**LiveChart.tsx**: gráfico de líneas con Recharts que muestra la
evolución de puntajes. Recibe scoreHistory y players. Transformá los
ScoreSnapshot al formato de Recharts: cada entrada necesita un timestamp
(eje X) y un campo por jugador (eje Y).

## Composición en App.tsx

Modifica el App.tsx que la IA te generó para que use el hook useSocket
en la raíz y distribuya los datos reales vía props a cada componente. Si
el jugador no se ha unido, muestra el Lobby. Una vez que está en el
gameState, muestra Board + Scoreboard + LiveChart.

  -----------------------------------------------------------------------
  **Resultado esperado:** Con dos ventanas del navegador en
  localhost:5173, deberías poder ingresar nombres distintos y ver ambos
  jugadores en el Scoreboard. Al hacer clic en una ficha, debe aparecer
  bloqueada en la otra ventana en tiempo real.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 6. Despliegue en Producción

En desarrollo, servidor y frontend corren en puertos separados. En
producción, necesitas unificarlos o separarlos estratégicamente.

## Opción recomendada: Frontend en Vercel + Backend en Railway

Compila el frontend con npm run build en client. Conecta tu repositorio
a **Vercel** seleccionando la carpeta client como root. Para el backend,
crea un proyecto en **Railway** apuntando a la carpeta server. Railway
te dará una URL pública que configuras como variable de entorno
VITE_SERVER_URL en Vercel.

  -----------------------------------------------------------------------
  **Tip:** En tu hook useSocket, usa: const SERVER_URL =
  import.meta.env.VITE_SERVER_URL \|\| \'http://localhost:3000\' para que
  funcione tanto en desarrollo como en producción.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  ![](media/image6.png){width="6.405659448818898in"
  height="4.270439632545932in"} **Diagrama de arquitectura de
  despliegue**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Resultado esperado:** Deberías tener una URL pública donde cualquier
  persona puede abrir el juego, ingresar un nombre y jugar en tiempo
  real.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 7. Rúbrica de Evaluación

La nota total es sobre 100 puntos. Se evalúa no solo que funcione, sino
la comprensión de conceptos y buenas prácticas.

  ---------------------------------------------------------------------------------
  **Criterio**        **Descripción**                   **Puntos**   **Obtenido**
  ------------------- --------------------------------- ------------ --------------
  Servidor +          Acepta conexiones WebSocket,      **20**       
  Socket.io           maneja eventos correctamente.                  

  Lógica del juego    Tablero, selección, bloqueo,      **20**       
                      emparejamiento y fin de juego                  
                      funcionan.                                     

  Frontend React      Componentes renderizan y          **20**       
                      responden a cambios de estado.                 

  Tiempo real         Múltiples clientes sincronizados: **15**       
                      fichas, puntajes y gráfico.                    

  TypeScript          Interfaces correctas, tipos       **10**       
                      estrictos, sin any.                            

  Despliegue          App desplegada y accesible en URL **10**       
                      pública.                                       

  Calidad de código   Nombres en inglés, estructura     **5**        
                      modular, README funcional.                     

  TOTAL                                                 **100**      
  ---------------------------------------------------------------------------------

## Puntos extra (Máximo +5)

Puedes obtener hasta 1 punto extra por cada mejora (1 punto adicional,
si haces todos): sistema de reconexión que restaure el estado del
jugador, efectos de sonido, historial de partidas en localStorage, o
pantalla de victoria con animaciones.

## Entregables

Enlace al repositorio de GitHub con código fuente completo, URL pública
del despliegue funcionando, y README.md con instrucciones para ejecutar
localmente, descripción de la arquitectura y nombres de los integrantes.

*Construir software es resolver problemas de comunicación creativamente,
mucho mejor si es en tiempo real.*
