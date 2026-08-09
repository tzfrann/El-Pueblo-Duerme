// ===============================
// NAVEGACIÓN ENTRE PANTALLAS
// ===============================

function showScreen(screenId) {
    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    document.getElementById(screenId).classList.remove("hidden");
}


// ===============================
// BOTONES DEL MENÚ
// ===============================

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


// ===============================
// CREAR PARTIDA
// ===============================

document
    .getElementById("create-confirm-btn")
    .addEventListener("click", () => {

        const name = document
            .getElementById("host-name")
            .value
            .trim();

        if (!name) {
            alert("Introduce tu nombre.");
            return;
        }

        const gameCode = generateGameCode();

        document.getElementById("game-code-display").textContent = gameCode;

        players = [
            {
                name: name,
                host: true
            }
        ];

        renderPlayers();

        showScreen("lobby-screen");
    });


// ===============================
// UNIRSE A PARTIDA
// ===============================

document
    .getElementById("join-confirm-btn")
    .addEventListener("click", () => {

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

        document.getElementById("game-code-display").textContent = code;

        players = [
            {
                name: name,
                host: false
            }
        ];

        renderPlayers();

        showScreen("lobby-screen");
    });


// ===============================
// JUGADORES
// ===============================

let players = [];


function renderPlayers() {

    const playersList = document.getElementById("players-list");

    playersList.innerHTML = "";

    players.forEach(player => {

        const playerElement = document.createElement("div");

        playerElement.classList.add("player");

        playerElement.textContent =
            player.name + (player.host ? " 👑" : "");

        playersList.appendChild(playerElement);
    });
}


// ===============================
// GENERAR CÓDIGO
// ===============================

function generateGameCode() {

    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 5; i++) {
        const index = Math.floor(
            Math.random() * characters.length
        );

        code += characters[index];
    }

    return code;
}
