// ==========================================
// FIREBASE
// ==========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    remove,
    onValue,
    onDisconnect,
    push,
    update
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyAIiNPuhnSqhrFAoCCsWVsC8hHeeF1OVLg",

    authDomain:
        "el-pueblo-duerme-a80f1.firebaseapp.com",

    databaseURL:
        "https://el-pueblo-duerme-a80f1-default-rtdb.firebaseio.com",

    projectId:
        "el-pueblo-duerme-a80f1",

    storageBucket:
        "el-pueblo-duerme-a80f1.firebasestorage.app",

    messagingSenderId:
        "690740771265",

    appId:
        "1:690740771265:web:9acf0c65e851c9f2d8d740",

    measurementId:
        "G-HQX7198HT8"
};


const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================

let currentGameCode = null;

let currentPlayerId = null;

let currentPlayerName = null;

let isHost = false;

let currentGameListener = null;

// ==========================================
// CONFIGURACIÓN DE PARTIDAS
// ==========================================

const GAME_DURATION = 3 * 60 * 60 * 1000; // 3 horas

// ==========================================
// NAVEGACIÓN
// ==========================================

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    document
        .getElementById(screenId)
        .classList.remove("hidden");
}


// ==========================================
// BOTONES DE NAVEGACIÓN
// ==========================================

document
    .getElementById("create-game-btn")
    .addEventListener("click", () => {

        showScreen("create-screen");

    });


document
    .getElementById("join-game-btn")
    .addEventListener("click", () => {

        showScreen("join-screen");

    });


document
    .getElementById("create-back-btn")
    .addEventListener("click", () => {

        showScreen("home-screen");

    });


document
    .getElementById("join-back-btn")
    .addEventListener("click", () => {

        showScreen("home-screen");

    });


// ==========================================
// CREAR PARTIDA
// ==========================================

document
    .getElementById("create-confirm-btn")
    .addEventListener("click", createGame);


async function createGame() {

    const name =
        document
            .getElementById("host-name")
            .value
            .trim();


    if (!name) {

        alert("Introduce tu nombre.");

        return;
    }


    if (name.length < 2) {

        alert("El nombre debe tener al menos 2 caracteres.");

        return;
    }


    try {

        // Generamos un código que no esté ocupado
        let gameCode;
        let gameExists = true;

        while (gameExists) {

            gameCode = generateGameCode();

            const snapshot = await get(
                ref(database, `games/${gameCode}`)
            );

            gameExists = snapshot.exists();
        }


        // Creamos un ID único para el jugador
        const playersRef =
            ref(database, `games/${gameCode}/players`);

        const playerRef =
            push(playersRef);

        const playerId =
            playerRef.key;


        currentGameCode = gameCode;

        currentPlayerId = playerId;

        currentPlayerName = name;

        isHost = true;


        const gameData = {

            hostId: playerId,

            status: "waiting",

            createdAt: Date.now(),

            players: {

                [playerId]: {

                    name: name,

                    host: true

                }
            }

        };


        // Crear partida
        await set(
            ref(database, `games/${gameCode}`),
            gameData
        );


        // Si el narrador cierra la pestaña,
        // de momento NO eliminamos la partida.
        // Lo gestionaremos mejor más adelante.


        document
            .getElementById("game-code-display")
            .textContent = gameCode;


        setupLobby();

        listenToGame(gameCode);

        showScreen("lobby-screen");


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido crear la partida.\n\n" +
            error.message
        );

    }

}


// ==========================================
// UNIRSE A PARTIDA
// ==========================================

document
    .getElementById("join-confirm-btn")
    .addEventListener("click", joinGame);


async function joinGame() {

    const code =
        document
            .getElementById("game-code")
            .value
            .trim()
            .toUpperCase();


    const name =
        document
            .getElementById("player-name")
            .value
            .trim();


    if (!code || !name) {

        alert(
            "Introduce el código y tu nombre."
        );

        return;
    }


    if (code.length !== 5) {

        alert(
            "El código debe tener 5 caracteres."
        );

        return;
    }


    if (name.length < 2) {

        alert(
            "El nombre debe tener al menos 2 caracteres."
        );

        return;
    }


    try {

        const gameRef =
            ref(database, `games/${code}`);


        const snapshot =
            await get(gameRef);


        if (!snapshot.exists()) {

            alert(
                "No existe ninguna partida con ese código."
            );

            return;
        }


        const game =
            snapshot.val();


        // No permitimos entrar si la partida ya ha comenzado
        if (game.status !== "waiting") {

            alert(
                "Esta partida ya ha comenzado."
            );

            return;
        }


        // Comprobamos nombres duplicados
        const players =
            game.players || {};


        const nameAlreadyExists =
            Object.values(players).some(
                player =>
                    player.name.toLowerCase() ===
                    name.toLowerCase()
            );


        if (nameAlreadyExists) {

            alert(
                "Ya hay un jugador con ese nombre."
            );

            return;
        }


        // Crear jugador
        const playersRef =
            ref(database, `games/${code}/players`);

        const playerRef =
            push(playersRef);

        const playerId =
            playerRef.key;


        currentGameCode = code;

        currentPlayerId = playerId;

        currentPlayerName = name;

        isHost = false;


        const playerData = {

            name: name,

            host: false

        };


        await set(
            playerRef,
            playerData
        );


        // Si este jugador cierra la pestaña,
        // Firebase eliminará automáticamente
        // su entrada de la partida.
        await onDisconnect(playerRef).remove();


        document
            .getElementById("game-code-display")
            .textContent = code;


        setupLobby();

        listenToGame(code);

        showScreen("lobby-screen");


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido unir a la partida.\n\n" +
            error.message
        );

    }

}


// ==========================================
// ESCUCHAR CAMBIOS DE LA PARTIDA
// ==========================================

function listenToGame(gameCode) {

    const gameRef =
        ref(database, `games/${gameCode}`);


    currentGameListener =
        onValue(
            gameRef,
            snapshot => {

                const game =
                    snapshot.val();


                if (!game) {

                    alert(
                        "La partida ya no existe."
                    );

                    showScreen("home-screen");

                    return;
                }


                // Si la partida ha empezado
                if (
                    game.status === "started" &&
                    !document
                        .getElementById("game-screen")
                        .classList
                        .contains("hidden")
                ) {

                    return;
                }


                // Si empieza la partida
                if (game.status === "started") {

                    showScreen("game-screen");

                    return;
                }


                renderLobby(game);

            }
        );

}


// ==========================================
// CONFIGURAR SALA
// ==========================================

function setupLobby() {

    document
        .getElementById("game-code-display")
        .textContent =
            currentGameCode;

}


// ==========================================
// MOSTRAR SALA
// ==========================================

function renderLobby(game) {

    const players =
        game.players || {};


    const playerArray =
        Object.entries(players);


    // --------------------------------------
    // Número de jugadores
    // --------------------------------------

    const playerCount =
        playerArray.length;


    document
        .getElementById("player-count")
        .textContent =
            playerCount === 1
                ? "1 jugador"
                : `${playerCount} jugadores`;


    // --------------------------------------
    // Lista de jugadores
    // --------------------------------------

    const playersList =
        document
            .getElementById("players-list");


    playersList.innerHTML = "";


    playerArray.forEach(
        ([playerId, player]) => {

            const playerElement =
                document.createElement("div");

            playerElement.classList.add(
                "player"
            );


            const info =
                document.createElement("div");

            info.classList.add(
                "player-info"
            );


            // Avatar
            const avatar =
                document.createElement("div");

            avatar.classList.add(
                "player-avatar"
            );


            avatar.textContent =
                player.name
                    .charAt(0)
                    .toUpperCase();


            // Nombre
            const name =
                document.createElement("span");

            name.classList.add(
                "player-name"
            );


            name.textContent =
                player.name;


            if (player.host) {

                const badge =
                    document.createElement("span");

                badge.classList.add(
                    "host-badge"
                );

                badge.textContent =
                    " 👑 Narrador";

                name.appendChild(badge);
            }


            info.appendChild(avatar);

            info.appendChild(name);


            playerElement.appendChild(info);


            // --------------------------------
            // Botón expulsar
            // --------------------------------

            if (
                isHost &&
                playerId !== currentPlayerId
            ) {

                const kickButton =
                    document.createElement("button");

                kickButton.classList.add(
                    "kick-btn"
                );

                kickButton.textContent =
                    "Expulsar";


                kickButton.addEventListener(
                    "click",
                    () => kickPlayer(playerId)
                );


                playerElement.appendChild(
                    kickButton
                );
            }


            playersList.appendChild(
                playerElement
            );

        }
    );


    // --------------------------------------
    // Mensaje según jugador
    // --------------------------------------

    const hostMessage =
        document
            .getElementById("host-message");


    const waitingMessage =
        document
            .getElementById("waiting-message");


    const startButton =
        document
            .getElementById("start-game-btn");


    if (isHost) {

        hostMessage.classList.remove(
            "hidden"
        );

        waitingMessage.classList.add(
            "hidden"
        );

        startButton.classList.remove(
            "hidden"
        );

    } else {

        hostMessage.classList.add(
            "hidden"
        );

        waitingMessage.classList.remove(
            "hidden"
        );

        startButton.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// EXPULSAR JUGADOR
// ==========================================

async function kickPlayer(playerId) {

    if (!isHost) {
        return;
    }


    if (playerId === currentPlayerId) {
        return;
    }


    const confirmed =
        confirm(
            "¿Seguro que quieres expulsar a este jugador?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await remove(
            ref(
                database,
                `games/${currentGameCode}/players/${playerId}`
            )
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido expulsar al jugador."
        );

    }

}


// ==========================================
// EMPEZAR PARTIDA
// ==========================================

document
    .getElementById("start-game-btn")
    .addEventListener(
        "click",
        startGame
    );


async function startGame() {

    if (!isHost) {
        return;
    }


    try {

        await update(
            ref(
                database,
                `games/${currentGameCode}`
            ),
            {
                status: "started"
            }
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido comenzar la partida."
        );

    }

}


// ==========================================
// COPIAR CÓDIGO
// ==========================================

document
    .getElementById("copy-code-btn")
    .addEventListener(
        "click",
        async () => {

            if (!currentGameCode) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    currentGameCode
                );


                const button =
                    document
                        .getElementById(
                            "copy-code-btn"
                        );


                const oldText =
                    button.textContent;


                button.textContent = "✓";


                setTimeout(
                    () => {
                        button.textContent =
                            oldText;
                    },
                    1500
                );


            } catch (error) {

                console.error(error);

                alert(
                    `Código de partida: ${currentGameCode}`
                );

            }

        }
    );


// ==========================================
// SALIR DE LA PARTIDA
// ==========================================

document
    .getElementById("leave-game-btn")
    .addEventListener(
        "click",
        leaveGame
    );


async function leaveGame() {

    if (!currentGameCode) {
        return;
    }


    const confirmed =
        confirm(
            isHost
                ? "Si sales, la partida terminará para todos. ¿Continuar?"
                : "¿Quieres salir de la partida?"
        );


    if (!confirmed) {
        return;
    }


    try {

        if (isHost) {

            // El narrador elimina toda la partida
            await remove(
                ref(
                    database,
                    `games/${currentGameCode}`
                )
            );

        } else {

            // Un jugador normal elimina solamente
            // su propia entrada
            await remove(
                ref(
                    database,
                    `games/${currentGameCode}/players/${currentPlayerId}`
                )
            );

        }


        resetGameState();

        showScreen("home-screen");


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido salir de la partida."
        );

    }

}


// ==========================================
// REINICIAR ESTADO
// ==========================================

function resetGameState() {

    currentGameCode = null;

    currentPlayerId = null;

    currentPlayerName = null;

    isHost = false;

}


// ==========================================
// GENERAR CÓDIGO
// ==========================================

function generateGameCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (let i = 0; i < 5; i++) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        code += characters[index];

    }


    return code;
}
