// ==========================================
// FIREBASE
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyAIiNPuhnSqhrFAoCCsWVsC8hHeeF1OVLg",
    authDomain: "el-pueblo-duerme-a80f1.firebaseapp.com",
    databaseURL: "https://el-pueblo-duerme-a80f1-default-rtdb.firebaseio.com",
    projectId: "el-pueblo-duerme-a80f1",
    storageBucket: "el-pueblo-duerme-a80f1.firebasestorage.app",
    messagingSenderId: "690740771265",
    appId: "1:690740771265:web:9acf0c65e851c9f2d8d740",
    measurementId: "G-HQX7198HT8"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Realtime Database
const database = getDatabase(app);


// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================

let currentGameCode = null;
let currentPlayerName = null;
let isHost = false;


// ==========================================
// NAVEGACIÓN
// ==========================================

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    document.getElementById(screenId).classList.remove("hidden");
}


// ==========================================
// BOTONES DEL MENÚ
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


// ==========================================
// CREAR PARTIDA
// ==========================================

document
    .getElementById("create-confirm-btn")
    .addEventListener("click", async () => {

        const name = document
            .getElementById("host-name")
            .value
            .trim();

        if (!name) {
            alert("Introduce tu nombre.");
            return;
        }

        const gameCode = generateGameCode();

        currentGameCode = gameCode;
        currentPlayerName = name;
        isHost = true;


        const gameData = {

            host: name,

            players: {
                [name]: {
                    name: name,
                    host: true
                }
            },

            status: "waiting"

        };


        try {

            await set(
                ref(database, `games/${gameCode}`),
                gameData
            );

            console.log("Partida creada:", gameCode);

            document
                .getElementById("game-code-display")
                .textContent = gameCode;

            listenToGame(gameCode);

            showScreen("lobby-screen");

        } catch (error) {

            console.error(error);

            alert(
                "No se ha podido crear la partida.\n\n" +
                error.message
            );

        }

    });


// ==========================================
// UNIRSE A PARTIDA
// ==========================================

document
    .getElementById("join-confirm-btn")
    .addEventListener("click", async () => {

        const code = document
            .getElementById("game-code")
            .value
            .trim()
            .toUpperCase();

        const name = document
            .getElementById("player-name")
            .value
            .trim();


        if (!code || !name) {

            alert("Introduce el código y tu nombre.");

            return;
        }


        try {

            const gameRef = ref(
                database,
                `games/${code}`
            );


            // Primero escuchamos la partida
            onValue(
                gameRef,
                async (snapshot) => {

                    const game = snapshot.val();


                    if (!game) {

                        alert(
                            "No existe ninguna partida con ese código."
                        );

                        return;
                    }


                    // Guardamos nuestro estado
                    currentGameCode = code;
                    currentPlayerName = name;
                    isHost = false;


                    // Añadimos el jugador
                    await set(
                        ref(
                            database,
                            `games/${code}/players/${name}`
                        ),
                        {
                            name: name,
                            host: false
                        }
                    );


                    document
                        .getElementById("game-code-display")
                        .textContent = code;


                    listenToGame(code);

                    showScreen("lobby-screen");

                },
                {
                    onlyOnce: true
                }
            );

        } catch (error) {

            console.error(error);

            alert(
                "No se ha podido unir a la partida.\n\n" +
                error.message
            );

        }

    });


// ==========================================
// ESCUCHAR CAMBIOS DE LA PARTIDA
// ==========================================

function listenToGame(gameCode) {

    const gameRef = ref(
        database,
        `games/${gameCode}`
    );


    onValue(gameRef, (snapshot) => {

        const game = snapshot.val();


        if (!game) {
            return;
        }


        console.log("Partida actualizada:", game);


        renderPlayers(game.players || {});


        // Más adelante utilizaremos esto
        // para detectar el inicio de la partida.

    });

}


// ==========================================
// MOSTRAR JUGADORES
// ==========================================

function renderPlayers(players) {

    const playersList =
        document.getElementById("players-list");


    playersList.innerHTML = "";


    Object.values(players).forEach(player => {

        const playerElement =
            document.createElement("div");


        playerElement.classList.add("player");


        playerElement.textContent =
            player.name +
            (player.host ? " 👑" : "");


        playersList.appendChild(playerElement);

    });

}


// ==========================================
// GENERAR CÓDIGO
// ==========================================

function generateGameCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (let i = 0; i < 5; i++) {

        const index = Math.floor(
            Math.random() * characters.length
        );

        code += characters[index];

    }


    return code;
}
