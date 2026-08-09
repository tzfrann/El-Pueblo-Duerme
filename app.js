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


const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================

let currentGameCode = null;

let currentPlayerId = null;

let currentPlayerName = null;

let isHost = false;

let currentGameListener = null;

let currentGame = null;


// ==========================================
// CONFIGURACIÓN
// ==========================================

const GAME_DURATION =
    3 * 60 * 60 * 1000;


const DEFAULT_GAME_CONFIG = {

    wolves: 3,

    villagers: 0,

    wolfRoles: {

        shapeshifter: true,

        lookout: true,

        magic: true

    },

    villageRoles: {

        girl: true,

        seer: true,

        cupid: true,

        witch: true,

        hunter: true,

        apprentice: true,

        mage: true,

        joker: true,

        medium: true,

        protector: true,

        detective: true

    },

    revealRoles: false

};


let gameConfig =
    createDefaultConfig();


function createDefaultConfig() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_GAME_CONFIG
        )
    );

}


// ==========================================
// NOMBRES DE CARGOS
// ==========================================

const ROLE_NAMES = {

    wolf:
        "Lobo",

    shapeshifter:
        "Lobo cambiaformas",

    lookout:
        "Mirona",

    magic:
        "Lobo mágico",

    villager:
        "Pueblerino",

    girl:
        "Niña",

    seer:
        "Vidente",

    cupid:
        "Cupido",

    witch:
        "Bruja",

    hunter:
        "Cazador",

    apprentice:
        "Aprendiz",

    mage:
        "Mago",

    joker:
        "Joker",

    medium:
        "Médium",

    protector:
        "Protector",

    detective:
        "Detective"

};


const ROLE_DESCRIPTIONS = {

    wolf:
        "Eres uno de los lobos. Cada noche participarás en las decisiones del bando de los lobos.",

    shapeshifter:
        "Eres el Lobo cambiaformas. Tienes las habilidades especiales propias de este cargo.",

    lookout:
        "Eres la Mirona. Tu habilidad te permite obtener información durante la noche.",

    magic:
        "Eres el Lobo mágico. Tu habilidad especial se resolverá durante la noche.",

    villager:
        "No tienes una habilidad especial. Tu objetivo es descubrir y eliminar a los lobos.",

    girl:
        "Eres la Niña. Tu habilidad especial se utiliza durante la noche.",

    seer:
        "Eres la Vidente. Cada noche podrás investigar el cargo de otro jugador con la aprobación del narrador.",

    cupid:
        "Eres Cupido. Tu habilidad especial afecta a dos jugadores al comienzo de la partida.",

    witch:
        "Eres la Bruja. Dispones de habilidades especiales que se resolverán durante la noche.",

    hunter:
        "Eres el Cazador. Tu habilidad especial se activa bajo las condiciones correspondientes.",

    apprentice:
        "Eres el Aprendiz. Si se cumplen las condiciones correspondientes, podrás heredar un cargo de pueblo.",

    mage:
        "Eres el Mago. Tu habilidad especial se resolverá durante la noche.",

    joker:
        "Eres el Joker. Tu objetivo y habilidad especial se resolverán durante la partida.",

    medium:
        "Eres la Médium. Puedes obtener información sobre los jugadores muertos.",

    protector:
        "Eres el Protector. Cada noche podrás proteger a un jugador según las reglas de la partida.",

    detective:
        "Eres el Detective. Tu habilidad especial te permite obtener información durante la noche."

};


// ==========================================
// NAVEGACIÓN
// ==========================================

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");


    screens.forEach(
        screen =>
            screen.classList.add("hidden")
    );


    const screen =
        document.getElementById(screenId);


    if (screen) {

        screen.classList.remove("hidden");

    }

}


// ==========================================
// BOTONES DE NAVEGACIÓN
// ==========================================

document
    .getElementById("create-game-btn")
    .addEventListener(
        "click",
        () => showScreen("create-screen")
    );


document
    .getElementById("join-game-btn")
    .addEventListener(
        "click",
        () => showScreen("join-screen")
    );


document
    .getElementById("create-back-btn")
    .addEventListener(
        "click",
        () => showScreen("home-screen")
    );


document
    .getElementById("join-back-btn")
    .addEventListener(
        "click",
        () => showScreen("home-screen")
    );


document
    .getElementById("config-back-btn")
    .addEventListener(
        "click",
        () => {

            if (!isHost) {
                return;
            }

            showScreen("lobby-screen");

        }
    );


// ==========================================
// CREAR PARTIDA
// ==========================================

document
    .getElementById("create-confirm-btn")
    .addEventListener(
        "click",
        createGame
    );


async function createGame() {

    const name =
        document
            .getElementById("host-name")
            .value
            .trim();


    if (!name) {

        alert(
            "Introduce tu nombre."
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

        let gameCode;

        let gameExists = true;


        while (gameExists) {

            gameCode =
                generateGameCode();


            const snapshot =
                await get(
                    ref(
                        database,
                        `games/${gameCode}`
                    )
                );


            gameExists =
                snapshot.exists();

        }


        const playersRef =
            ref(
                database,
                `games/${gameCode}/players`
            );


        const playerRef =
            push(playersRef);


        const playerId =
            playerRef.key;


        currentGameCode =
            gameCode;

        currentPlayerId =
            playerId;

        currentPlayerName =
            name;

        isHost =
            true;


        const gameData = {

            hostId:
                playerId,

            status:
                "waiting",

            createdAt:
                Date.now(),

            players: {

                [playerId]: {

                    name:
                        name,

                    host:
                        true

                }

            }

        };


        await set(
            ref(
                database,
                `games/${gameCode}`
            ),
            gameData
        );


        await onDisconnect(
            ref(
                database,
                `games/${gameCode}`
            )
        ).remove();


        document
            .getElementById(
                "game-code-display"
            )
            .textContent =
                gameCode;


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
// UNIRSE
// ==========================================

document
    .getElementById("join-confirm-btn")
    .addEventListener(
        "click",
        joinGame
    );


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
            ref(
                database,
                `games/${code}`
            );


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


        if (game.status !== "waiting") {

            alert(
                "Esta partida ya ha comenzado."
            );

            return;

        }


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


        const playersRef =
            ref(
                database,
                `games/${code}/players`
            );


        const playerRef =
            push(playersRef);


        const playerId =
            playerRef.key;


        currentGameCode =
            code;

        currentPlayerId =
            playerId;

        currentPlayerName =
            name;

        isHost =
            false;


        await set(
            playerRef,
            {

                name:
                    name,

                host:
                    false

            }
        );


        await onDisconnect(
            playerRef
        ).remove();


        document
            .getElementById(
                "game-code-display"
            )
            .textContent =
                code;


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
// ESCUCHAR PARTIDA
// ==========================================

function listenToGame(gameCode) {

    const gameRef =
        ref(
            database,
            `games/${gameCode}`
        );


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


                    resetGameState();

                    showScreen(
                        "home-screen"
                    );

                    return;

                }


                currentGame =
                    game;


                if (
                    game.createdAt &&
                    Date.now() -
                    game.createdAt >=
                    GAME_DURATION
                ) {

                    if (isHost) {

                        remove(gameRef);

                    } else {

                        alert(
                            "Esta partida ha caducado."
                        );

                        resetGameState();

                        showScreen(
                            "home-screen"
                        );

                    }

                    return;

                }


                const players =
                    game.players || {};


                if (
                    currentPlayerId &&
                    !players[currentPlayerId]
                ) {

                    alert(
                        "Has sido expulsado de la partida."
                    );


                    resetGameState();

                    showScreen(
                        "home-screen"
                    );

                    return;

                }


                // ==================================
                // CONFIGURANDO
                // ==================================

                if (
                    game.status ===
                    "configuring"
                ) {

                    if (isHost) {

                        loadConfigFromFirebase(
                            game
                        );


                        showScreen(
                            "config-screen"
                        );


                        updateConfigurationUI();

                    } else {

                        showScreen(
                            "waiting-config-screen"
                        );

                    }

                    return;

                }


                // ==================================
                // PARTIDA COMENZADA
                // ==================================

                if (
                    game.status ===
                    "started"
                ) {

                    showGameScreen(
                        game
                    );

                    return;

                }


                // ==================================
                // LOBBY
                // ==================================

                renderLobby(game);

            }
        );

}


// ==========================================
// CONFIGURAR SALA
// ==========================================

function setupLobby() {

    document
        .getElementById(
            "game-code-display"
        )
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


    const playerCount =
        playerArray.length;


    document
        .getElementById(
            "player-count"
        )
        .textContent =
            playerCount === 1
                ? "1 jugador"
                : `${playerCount} jugadores`;


    const playersList =
        document.getElementById(
            "players-list"
        );


    playersList.innerHTML =
        "";


    playerArray.forEach(
        ([playerId, player]) => {

            const playerElement =
                document.createElement(
                    "div"
                );


            playerElement.classList.add(
                "player"
            );


            const info =
                document.createElement(
                    "div"
                );


            info.classList.add(
                "player-info"
            );


            const avatar =
                document.createElement(
                    "div"
                );


            avatar.classList.add(
                "player-avatar"
            );


            avatar.textContent =
                player.name
                    .charAt(0)
                    .toUpperCase();


            const name =
                document.createElement(
                    "span"
                );


            name.classList.add(
                "player-name"
            );


            name.textContent =
                player.name;


            if (player.host) {

                const badge =
                    document.createElement(
                        "span"
                    );


                badge.classList.add(
                    "host-badge"
                );


                badge.textContent =
                    " 👑 Narrador";


                name.appendChild(
                    badge
                );

            }


            info.appendChild(
                avatar
            );


            info.appendChild(
                name
            );


            playerElement.appendChild(
                info
            );


            if (
                isHost &&
                playerId !==
                currentPlayerId
            ) {

                const kickButton =
                    document.createElement(
                        "button"
                    );


                kickButton.classList.add(
                    "kick-btn"
                );


                kickButton.textContent =
                    "Expulsar";


                kickButton.addEventListener(
                    "click",
                    () =>
                        kickPlayer(playerId)
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


    const hostMessage =
        document.getElementById(
            "host-message"
        );


    const waitingMessage =
        document.getElementById(
            "waiting-message"
        );


    const startButton =
        document.getElementById(
            "start-game-btn"
        );


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
// EXPULSAR
// ==========================================

async function kickPlayer(playerId) {

    if (!isHost) {
        return;
    }


    if (
        playerId ===
        currentPlayerId
    ) {

        return;
    }


    if (
        !confirm(
            "¿Seguro que quieres expulsar a este jugador?"
        )
    ) {

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
// ABRIR CONFIGURACIÓN
// ==========================================

document
    .getElementById(
        "start-game-btn"
    )
    .addEventListener(
        "click",
        openConfiguration
    );


async function openConfiguration() {

    if (!isHost) {
        return;
    }


    try {

        gameConfig =
            createDefaultConfig();


        await update(
            ref(
                database,
                `games/${currentGameCode}`
            ),
            {

                status:
                    "configuring",

                config:
                    gameConfig

            }
        );


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido abrir la configuración."
        );

    }

}


// ==========================================
// CARGAR CONFIGURACIÓN
// ==========================================

function loadConfigFromFirebase(game) {

    if (!game.config) {
        return;
    }


    gameConfig = {

        ...createDefaultConfig(),

        ...game.config,

        wolfRoles: {

            ...createDefaultConfig().wolfRoles,

            ...(game.config.wolfRoles || {})

        },

        villageRoles: {

            ...createDefaultConfig().villageRoles,

            ...(game.config.villageRoles || {})

        }

    };

}


// ==========================================
// CONTADORES
// ==========================================

document
    .getElementById("wolves-minus")
    .addEventListener(
        "click",
        () => {

            if (
                gameConfig.wolves > 1
            ) {

                gameConfig.wolves--;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("wolves-plus")
    .addEventListener(
        "click",
        () => {

            const playerCount =
                getCurrentPlayerCount();


            if (
                gameConfig.wolves <
                playerCount - 1
            ) {

                gameConfig.wolves++;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("villagers-minus")
    .addEventListener(
        "click",
        () => {

            if (
                gameConfig.villagers > 0
            ) {

                gameConfig.villagers--;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("villagers-plus")
    .addEventListener(
        "click",
        () => {

            gameConfig.villagers++;

            updateConfigurationUI();

        }
    );


// ==========================================
// CHECKBOXES
// ==========================================

const checkboxMap = {

    "role-shapeshifter":
        ["wolfRoles", "shapeshifter"],

    "role-lookout-wolf":
        ["wolfRoles", "lookout"],

    "role-magic-wolf":
        ["wolfRoles", "magic"],

    "role-girl":
        ["villageRoles", "girl"],

    "role-seer":
        ["villageRoles", "seer"],

    "role-cupid":
        ["villageRoles", "cupid"],

    "role-witch":
        ["villageRoles", "witch"],

    "role-hunter":
        ["villageRoles", "hunter"],

    "role-apprentice":
        ["villageRoles", "apprentice"],

    "role-mage":
        ["villageRoles", "mage"],

    "role-joker":
        ["villageRoles", "joker"],

    "role-medium":
        ["villageRoles", "medium"],

    "role-protector":
        ["villageRoles", "protector"],

    "role-detective":
        ["villageRoles", "detective"]

};


Object.entries(
    checkboxMap
).forEach(
    ([elementId, path]) => {

        document
            .getElementById(elementId)
            .addEventListener(
                "change",
                event => {

                    gameConfig[path[0]][path[1]] =
                        event.target.checked;


                    updateConfigurationUI();

                }
            );

    }
);


document
    .getElementById(
        "reveal-roles"
    )
    .addEventListener(
        "change",
        event => {

            gameConfig.revealRoles =
                event.target.checked;


            updateConfigurationUI();

        }
    );


// ==========================================
// ACTUALIZAR UI
// ==========================================

function updateConfigurationUI() {

    const playerCount =
        getCurrentPlayerCount();


    document
        .getElementById(
            "config-player-count"
        )
        .textContent =
            playerCount;


    document
        .getElementById(
            "wolves-value"
        )
        .textContent =
            gameConfig.wolves;


    document
        .getElementById(
            "villagers-value"
        )
        .textContent =
            gameConfig.villagers;


    document
        .getElementById(
            "config-wolf-count-display"
        )
        .textContent =
            gameConfig.wolves;


    document
        .getElementById(
            "config-villager-count-display"
        )
        .textContent =
            gameConfig.villagers;


    Object.entries(
        checkboxMap
    ).forEach(
        ([elementId, path]) => {

            document
                .getElementById(
                    elementId
                )
                .checked =
                    gameConfig[path[0]][path[1]];

        }
    );


    document
        .getElementById(
            "reveal-roles"
        )
        .checked =
            gameConfig.revealRoles;


    const validation =
        validateConfiguration();


    document
        .getElementById(
            "wolf-pool-count"
        )
        .textContent =
            `${validation.wolfPoolSize} cargos`;


    document
        .getElementById(
            "village-pool-count"
        )
        .textContent =
            `${validation.villagePoolSize} cargos`;


    renderConfigurationWarnings(
        validation
    );


    document
        .getElementById(
            "confirm-config-btn"
        )
        .disabled =
            validation.errors.length > 0;

}


// ==========================================
// VALIDAR CONFIGURACIÓN
// ==========================================

function validateConfiguration() {

    const playerCount =
        getCurrentPlayerCount();


    let wolfPoolSize =
        gameConfig.wolves;


    if (
        gameConfig.wolfRoles.shapeshifter
    ) {

        wolfPoolSize++;

    }


    if (
        gameConfig.wolfRoles.lookout
    ) {

        wolfPoolSize++;

    }


    if (
        gameConfig.wolfRoles.magic
    ) {

        wolfPoolSize++;

    }


    let villageSpecialCount =
        0;


    Object.values(
        gameConfig.villageRoles
    ).forEach(
        enabled => {

            if (enabled) {

                villageSpecialCount++;

            }

        }
    );


    const villagePoolSize =
        villageSpecialCount +
        gameConfig.villagers;


    const errors = [];

    const warnings = [];


    // --------------------------------------
    // JUGADORES
    // --------------------------------------

    if (playerCount < 2) {

        errors.push(
            "Debe haber al menos 2 jugadores."
        );

    }


    // --------------------------------------
    // LOBOS
    // --------------------------------------

    if (
        gameConfig.wolves < 1
    ) {

        errors.push(
            "Debe haber al menos 1 lobo."
        );

    }


    if (
        gameConfig.wolves >=
        playerCount
    ) {

        errors.push(
            "No puede haber tantos lobos como jugadores."
        );

    }


    // --------------------------------------
    // POOL TOTAL
    // --------------------------------------

    const totalPool =
        wolfPoolSize +
        villagePoolSize;


    if (
        totalPool <
        playerCount
    ) {

        errors.push(
            `El pool total tiene ${totalPool} cargos, pero hay ${playerCount} jugadores. Debe haber al menos un cargo disponible por jugador.`
        );

    }


    // --------------------------------------
    // PUEBLERINOS
    // --------------------------------------

    if (
        gameConfig.villagers >
        playerCount -
        gameConfig.wolves
    ) {

        errors.push(
            "Hay más pueblerinos configurados que jugadores disponibles para el pueblo."
        );

    }


    // --------------------------------------
    // POOL DEL PUEBLO
    // --------------------------------------

    if (
        villagePoolSize === 0
    ) {

        errors.push(
            "El pool del pueblo está vacío."
        );

    }


    // --------------------------------------
    // CAMBIAPFORMAS
    // --------------------------------------

    if (
        gameConfig.wolfRoles.shapeshifter &&
        villagePoolSize < 1
    ) {

        errors.push(
            "El Lobo cambiaformas está activado, pero no existe ningún cargo de pueblo disponible."
        );

    }


    // --------------------------------------
    // JOKER
    // --------------------------------------

    if (
        gameConfig.villageRoles.joker &&
        villagePoolSize < 2
    ) {

        warnings.push(
            "El Joker está activado, pero el pool del pueblo es muy reducido. Puede que no tenga un cargo disponible para elegir."
        );

    }


    // --------------------------------------
    // MÉDIUM + REVELACIÓN
    // --------------------------------------

    if (
        gameConfig.revealRoles &&
        gameConfig.villageRoles.medium
    ) {

        warnings.push(
            "Al revelar los cargos al morir, la Médium pierde parte de su utilidad."
        );

    }


    // --------------------------------------
    // MUCHOS CARGOS
    // --------------------------------------

    if (
        totalPool >
        playerCount + 10
    ) {

        warnings.push(
            `Hay ${totalPool} cargos disponibles para ${playerCount} jugadores. Muchos cargos quedarán fuera del reparto.`
        );

    }


    return {

        errors,

        warnings,

        wolfPoolSize,

        villagePoolSize,

        totalPool

    };

}


// ==========================================
// MOSTRAR AVISOS
// ==========================================

function renderConfigurationWarnings(
    validation
) {

    const container =
        document.getElementById(
            "config-warnings"
        );


    container.innerHTML =
        "";


    if (
        validation.errors.length === 0 &&
        validation.warnings.length === 0
    ) {

        container.classList.add(
            "hidden"
        );

        return;

    }


    container.classList.remove(
        "hidden"
    );


    if (
        validation.errors.length > 0
    ) {

        container.classList.add(
            "error"
        );


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            "⚠ No se puede comenzar";


        container.appendChild(
            title
        );


        const list =
            document.createElement(
                "ul"
            );


        validation.errors.forEach(
            message => {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    message;


                list.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            list
        );

    } else {

        container.classList.remove(
            "error"
        );

    }


    if (
        validation.warnings.length > 0
    ) {

        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            validation.errors.length > 0
                ? "ℹ Además"
                : "⚠ Ten en cuenta";


        container.appendChild(
            title
        );


        const list =
            document.createElement(
                "ul"
            );


        validation.warnings.forEach(
            message => {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    message;


                list.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            list
        );

    }

}


// ==========================================
// NÚMERO REAL DE JUGADORES
// ==========================================

function getCurrentPlayerCount() {

    if (
        currentGame &&
        currentGame.players
    ) {

        return Object.keys(
            currentGame.players
        ).length;

    }


    return 0;

}


// ==========================================
// CONFIRMAR CONFIGURACIÓN
// ==========================================

document
    .getElementById(
        "confirm-config-btn"
    )
    .addEventListener(
        "click",
        confirmConfiguration
    );


async function confirmConfiguration() {

    if (!isHost) {
        return;
    }


    const validation =
        validateConfiguration();


    if (
        validation.errors.length > 0
    ) {

        alert(
            "Hay problemas en la configuración. Revísalos antes de comenzar."
        );

        return;

    }


    const players =
        currentGame.players || {};


    const playerIds =
        Object.keys(players);


    const roles =
        generateRolePool();


    shuffleArray(
        roles
    );


    if (
        roles.length <
        playerIds.length
    ) {

        alert(
            "No hay suficientes cargos para todos los jugadores."
        );

        return;

    }


    const assignedRoles = {};


    playerIds.forEach(
        (playerId, index) => {

            assignedRoles[playerId] =
                roles[index];

        }
    );


    const gamePlayers = {};


    playerIds.forEach(
        playerId => {

            const originalPlayer =
                players[playerId];


            gamePlayers[playerId] = {

                ...originalPlayer,

                role:
                    assignedRoles[playerId],

                alive:
                    true,

                roleRevealed:
                    false

            };

        }
    );


    const gameState = {

        phase:
            "night",

        round:
            1,

        night:
            1,

        startedAt:
            Date.now()

    };


    try {

        await update(
            ref(
                database,
                `games/${currentGameCode}`
            ),
            {

                status:
                    "started",

                config:
                    gameConfig,

                players:
                    gamePlayers,

                gameState:
                    gameState

            }
        );


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido comenzar la partida.\n\n" +
            error.message
        );

    }

}


// ==========================================
// GENERAR POOL DE CARGOS
// ==========================================

function generateRolePool() {

    const roles = [];


    // --------------------------------------
    // LOBOS COMUNES
    // --------------------------------------

    for (
        let i = 0;
        i < gameConfig.wolves;
        i++
    ) {

        roles.push(
            "wolf"
        );

    }


    // --------------------------------------
    // CARGOS ESPECIALES DE LOBOS
    // --------------------------------------

    if (
        gameConfig.wolfRoles.shapeshifter
    ) {

        roles.push(
            "shapeshifter"
        );

    }


    if (
        gameConfig.wolfRoles.lookout
    ) {

        roles.push(
            "lookout"
        );

    }


    if (
        gameConfig.wolfRoles.magic
    ) {

        roles.push(
            "magic"
        );

    }


    // --------------------------------------
    // PUEBLERINOS
    // --------------------------------------

    for (
        let i = 0;
        i < gameConfig.villagers;
        i++
    ) {

        roles.push(
            "villager"
        );

    }


    // --------------------------------------
    // CARGOS ESPECIALES DEL PUEBLO
    // --------------------------------------

    Object.entries(
        gameConfig.villageRoles
    ).forEach(
        ([role, enabled]) => {

            if (enabled) {

                roles.push(
                    role
                );

            }

        }
    );


    return roles;

}


// ==========================================
// MEZCLAR ARRAY
// ==========================================

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


    return array;

}


// ==========================================
// MOSTRAR PARTIDA
// ==========================================

function showGameScreen(game) {

    showScreen(
        "game-screen"
    );


    const players =
        game.players || {};


    if (isHost) {

        document
            .getElementById(
                "player-game-view"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "host-game-view"
            )
            .classList.remove(
                "hidden"
            );


        renderHostGameView(
            game
        );

    } else {

        document
            .getElementById(
                "host-game-view"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "player-game-view"
            )
            .classList.remove(
                "hidden"
            );


        const player =
            players[currentPlayerId];


        if (!player) {
            return;
        }


        renderPlayerGameView(
            game,
            player
        );

    }

}


// ==========================================
// VISTA DEL JUGADOR
// ==========================================

function renderPlayerGameView(
    game,
    player
) {

    const gameState =
        game.gameState || {};


    document
        .getElementById(
            "player-round"
        )
        .textContent =
            gameState.round || 1;


    document
        .getElementById(
            "player-role-name"
        )
        .textContent =
            ROLE_NAMES[player.role] ||
            player.role;


    document
        .getElementById(
            "player-role-description"
        )
        .textContent =
            ROLE_DESCRIPTIONS[player.role] ||
            "Tu cargo tiene habilidades especiales.";


    document
        .getElementById(
            "player-alive-status"
        )
        .textContent =
            player.alive
                ? "Vivo"
                : "Muerto";


    document
        .getElementById(
            "player-game-message"
        )
        .textContent =
            player.alive
                ? "El narrador está preparando la noche."
                : "Estás muerto. Observa la partida y espera las instrucciones del narrador.";

}


// ==========================================
// VISTA DEL NARRADOR
// ==========================================

function renderHostGameView(game) {

    const gameState =
        game.gameState || {};


    document
        .getElementById(
            "host-round"
        )
        .textContent =
            gameState.round || 1;


    const container =
        document.getElementById(
            "host-players-list"
        );


    container.innerHTML =
        "";


    const players =
        game.players || {};


    Object.entries(
        players
    ).forEach(
        ([playerId, player]) => {

            const element =
                document.createElement(
                    "div"
                );


            element.classList.add(
                "host-player"
            );


            const top =
                document.createElement(
                    "div"
                );


            top.classList.add(
                "host-player-top"
            );


            const name =
                document.createElement(
                    "span"
                );


            name.classList.add(
                "host-player-name"
            );


            name.textContent =
                player.name;


            const role =
                document.createElement(
                    "span"
                );


            role.classList.add(
                "host-player-role"
            );


            role.textContent =
                ROLE_NAMES[player.role] ||
                player.role;


            top.appendChild(
                name
            );


            top.appendChild(
                role
            );


            const status =
                document.createElement(
                    "div"
                );


            status.classList.add(
                "host-player-status"
            );


            status.textContent =
                player.alive
                    ? "Vivo"
                    : "Muerto";


            element.appendChild(
                top
            );


            element.appendChild(
                status
            );


            container.appendChild(
                element
            );

        }
    );

}


// ==========================================
// BOTÓN COMENZAR NOCHE
// ==========================================

document
    .getElementById(
        "start-night-btn"
    )
    .addEventListener(
        "click",
        startNight
    );


async function startNight() {

    if (!isHost) {
        return;
    }


    try {

        await update(
            ref(
                database,
                `games/${currentGameCode}/gameState`
            ),
            {

                phase:
                    "night",

                night:
                    currentGame?.gameState?.night ||
                    1

            }
        );


        alert(
            "Noche comenzada. La gestión de las acciones nocturnas será el siguiente módulo."
        );


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido comenzar la noche."
        );

    }

}


// ==========================================
// COPIAR CÓDIGO
// ==========================================

document
    .getElementById(
        "copy-code-btn"
    )
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
                    document.getElementById(
                        "copy-code-btn"
                    );


                const oldText =
                    button.textContent;


                button.textContent =
                    "✓";


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
// SALIR
// ==========================================

document
    .getElementById(
        "leave-game-btn"
    )
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

            await remove(
                ref(
                    database,
                    `games/${currentGameCode}`
                )
            );

        } else {

            await remove(
                ref(
                    database,
                    `games/${currentGameCode}/players/${currentPlayerId}`
                )
            );

        }


        resetGameState();


        showScreen(
            "home-screen"
        );


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

    currentGameCode =
        null;

    currentPlayerId =
        null;

    currentPlayerName =
        null;

    isHost =
        false;

    currentGame =
        null;

    gameConfig =
        createDefaultConfig();

}


// ==========================================
// GENERAR CÓDIGO
// ==========================================

function generateGameCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code =
        "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        code +=
            characters[index];

    }


    return code;

}


// ==========================================
// LIMPIAR PARTIDAS CADUCADAS
// ==========================================

async function cleanupExpiredGames() {

    try {

        const gamesRef =
            ref(
                database,
                "games"
            );


        const snapshot =
            await get(
                gamesRef
            );


        if (!snapshot.exists()) {
            return;
        }


        const games =
            snapshot.val();


        const now =
            Date.now();


        for (
            const [
                gameCode,
                game
            ]
            of Object.entries(games)
        ) {

            if (
                game.createdAt &&
                now -
                game.createdAt >=
                GAME_DURATION
            ) {

                console.log(
                    `Eliminando partida caducada: ${gameCode}`
                );


                await remove(
                    ref(
                        database,
                        `games/${gameCode}`
                    )
                );

            }

        }


    } catch (error) {

        console.error(
            "Error limpiando partidas:",
            error
        );

    }

}


cleanupExpiredGames();        "el-pueblo-duerme-a80f1.firebasestorage.app",

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
// CONFIGURACIÓN
// ==========================================

const GAME_DURATION = 3 * 60 * 60 * 1000;


// Valores iniciales

let gameConfig = {

    wolves: 3,

    villagers: 0,

    wolfRoles: {

        shapeshifter: true,

        lookout: true,

        magic: true

    },

    villageRoles: {

        girl: true,

        seer: true,

        cupid: true,

        witch: true,

        hunter: true,

        apprentice: true,

        mage: true,

        joker: true,

        medium: true,

        protector: true,

        detective: true

    },

    revealRoles: false

};


// ==========================================
// NAVEGACIÓN
// ==========================================

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    const screen =
        document.getElementById(screenId);

    if (screen) {
        screen.classList.remove("hidden");
    }
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


document
    .getElementById("config-back-btn")
    .addEventListener("click", () => {

        showScreen("lobby-screen");

    });


// ==========================================
// CREAR PARTIDA
// ==========================================

document
    .getElementById("create-confirm-btn")
    .addEventListener(
        "click",
        createGame
    );


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

        alert(
            "El nombre debe tener al menos 2 caracteres."
        );

        return;
    }


    try {

        let gameCode;

        let gameExists = true;


        while (gameExists) {

            gameCode =
                generateGameCode();


            const snapshot =
                await get(
                    ref(
                        database,
                        `games/${gameCode}`
                    )
                );


            gameExists =
                snapshot.exists();

        }


        const playersRef =
            ref(
                database,
                `games/${gameCode}/players`
            );


        const playerRef =
            push(playersRef);


        const playerId =
            playerRef.key;


        currentGameCode =
            gameCode;

        currentPlayerId =
            playerId;

        currentPlayerName =
            name;

        isHost = true;


        const gameData = {

            hostId:
                playerId,

            status:
                "waiting",

            createdAt:
                Date.now(),

            players: {

                [playerId]: {

                    name:
                        name,

                    host:
                        true

                }

            }

        };


        await set(
            ref(
                database,
                `games/${gameCode}`
            ),
            gameData
        );


        await onDisconnect(
            ref(
                database,
                `games/${gameCode}`
            )
        ).remove();


        document
            .getElementById(
                "game-code-display"
            )
            .textContent =
                gameCode;


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
    .addEventListener(
        "click",
        joinGame
    );


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
            ref(
                database,
                `games/${code}`
            );


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


        if (game.status !== "waiting") {

            alert(
                "Esta partida ya ha comenzado."
            );

            return;
        }


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


        const playersRef =
            ref(
                database,
                `games/${code}/players`
            );


        const playerRef =
            push(playersRef);


        const playerId =
            playerRef.key;


        currentGameCode =
            code;

        currentPlayerId =
            playerId;

        currentPlayerName =
            name;

        isHost = false;


        await set(
            playerRef,
            {

                name:
                    name,

                host:
                    false

            }
        );


        await onDisconnect(
            playerRef
        ).remove();


        document
            .getElementById(
                "game-code-display"
            )
            .textContent =
                code;


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
// ESCUCHAR CAMBIOS
// ==========================================

function listenToGame(gameCode) {

    const gameRef =
        ref(
            database,
            `games/${gameCode}`
        );


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

                    resetGameState();

                    showScreen(
                        "home-screen"
                    );

                    return;
                }


                if (
                    game.createdAt &&
                    Date.now() -
                    game.createdAt >=
                    GAME_DURATION
                ) {

                    if (isHost) {

                        remove(gameRef);

                    } else {

                        alert(
                            "Esta partida ha caducado."
                        );

                        resetGameState();

                        showScreen(
                            "home-screen"
                        );

                    }

                    return;
                }


                const players =
                    game.players || {};


                if (
                    currentPlayerId &&
                    !players[currentPlayerId]
                ) {

                    alert(
                        "Has sido expulsado de la partida."
                    );

                    resetGameState();

                    showScreen(
                        "home-screen"
                    );

                    return;
                }


                // --------------------------------------
                // CONFIGURANDO
                // --------------------------------------

                if (
                    game.status ===
                    "configuring"
                ) {

                    if (isHost) {

                        loadConfigFromFirebase(
                            game
                        );

                        showScreen(
                            "config-screen"
                        );

                        updateConfigurationUI();

                    } else {

                        showScreen(
                            "waiting-config-screen"
                        );

                    }

                    return;
                }


                // --------------------------------------
                // PARTIDA COMENZADA
                // --------------------------------------

                if (
                    game.status ===
                    "started"
                ) {

                    showScreen(
                        "game-screen"
                    );

                    return;
                }


                // --------------------------------------
                // SALA DE ESPERA
                // --------------------------------------

                renderLobby(game);

            }
        );

}


// ==========================================
// CONFIGURAR SALA
// ==========================================

function setupLobby() {

    document
        .getElementById(
            "game-code-display"
        )
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


    const playerCount =
        playerArray.length;


    document
        .getElementById(
            "player-count"
        )
        .textContent =
            playerCount === 1
                ? "1 jugador"
                : `${playerCount} jugadores`;


    const playersList =
        document
            .getElementById(
                "players-list"
            );


    playersList.innerHTML = "";


    playerArray.forEach(
        ([playerId, player]) => {

            const playerElement =
                document.createElement(
                    "div"
                );

            playerElement.classList.add(
                "player"
            );


            const info =
                document.createElement(
                    "div"
                );

            info.classList.add(
                "player-info"
            );


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.classList.add(
                "player-avatar"
            );


            avatar.textContent =
                player.name
                    .charAt(0)
                    .toUpperCase();


            const name =
                document.createElement(
                    "span"
                );

            name.classList.add(
                "player-name"
            );


            name.textContent =
                player.name;


            if (player.host) {

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.classList.add(
                    "host-badge"
                );

                badge.textContent =
                    " 👑 Narrador";

                name.appendChild(
                    badge
                );
            }


            info.appendChild(
                avatar
            );

            info.appendChild(
                name
            );


            playerElement.appendChild(
                info
            );


            if (
                isHost &&
                playerId !==
                currentPlayerId
            ) {

                const kickButton =
                    document.createElement(
                        "button"
                    );

                kickButton.classList.add(
                    "kick-btn"
                );

                kickButton.textContent =
                    "Expulsar";


                kickButton.addEventListener(
                    "click",
                    () =>
                        kickPlayer(playerId)
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


    const hostMessage =
        document
            .getElementById(
                "host-message"
            );


    const waitingMessage =
        document
            .getElementById(
                "waiting-message"
            );


    const startButton =
        document
            .getElementById(
                "start-game-btn"
            );


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


    if (
        playerId ===
        currentPlayerId
    ) {

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
// ABRIR CONFIGURACIÓN
// ==========================================

document
    .getElementById(
        "start-game-btn"
    )
    .addEventListener(
        "click",
        openConfiguration
    );


async function openConfiguration() {

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
                status:
                    "configuring",

                config:
                    gameConfig
            }
        );


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido abrir la configuración."
        );

    }

}


// ==========================================
// CONFIGURACIÓN
// ==========================================

function loadConfigFromFirebase(game) {

    if (!game.config) {
        return;
    }


    gameConfig = {

        ...gameConfig,

        ...game.config,

        wolfRoles: {

            ...gameConfig.wolfRoles,

            ...(game.config.wolfRoles || {})

        },

        villageRoles: {

            ...gameConfig.villageRoles,

            ...(game.config.villageRoles || {})

        }

    };

}


// ==========================================
// CONFIGURACIÓN - EVENTOS
// ==========================================

document
    .getElementById("wolves-minus")
    .addEventListener(
        "click",
        () => {

            if (
                gameConfig.wolves > 1
            ) {

                gameConfig.wolves--;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("wolves-plus")
    .addEventListener(
        "click",
        () => {

            const playerCount =
                getCurrentPlayerCount();


            if (
                gameConfig.wolves <
                playerCount - 1
            ) {

                gameConfig.wolves++;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("villagers-minus")
    .addEventListener(
        "click",
        () => {

            if (
                gameConfig.villagers > 0
            ) {

                gameConfig.villagers--;

                updateConfigurationUI();

            }

        }
    );


document
    .getElementById("villagers-plus")
    .addEventListener(
        "click",
        () => {

            gameConfig.villagers++;

            updateConfigurationUI();

        }
    );


// ==========================================
// CHECKBOXES
// ==========================================

const checkboxMap = {

    "role-shapeshifter":
        ["wolfRoles", "shapeshifter"],

    "role-lookout-wolf":
        ["wolfRoles", "lookout"],

    "role-magic-wolf":
        ["wolfRoles", "magic"],

    "role-girl":
        ["villageRoles", "girl"],

    "role-seer":
        ["villageRoles", "seer"],

    "role-cupid":
        ["villageRoles", "cupid"],

    "role-witch":
        ["villageRoles", "witch"],

    "role-hunter":
        ["villageRoles", "hunter"],

    "role-apprentice":
        ["villageRoles", "apprentice"],

    "role-mage":
        ["villageRoles", "mage"],

    "role-joker":
        ["villageRoles", "joker"],

    "role-medium":
        ["villageRoles", "medium"],

    "role-protector":
        ["villageRoles", "protector"],

    "role-detective":
        ["villageRoles", "detective"]

};


Object.entries(
    checkboxMap
).forEach(
    ([elementId, path]) => {

        document
            .getElementById(elementId)
            .addEventListener(
                "change",
                event => {

                    gameConfig[path[0]][path[1]] =
                        event.target.checked;

                    updateConfigurationUI();

                }
            );

    }
);


document
    .getElementById(
        "reveal-roles"
    )
    .addEventListener(
        "change",
        event => {

            gameConfig.revealRoles =
                event.target.checked;

            updateConfigurationUI();

        }
    );


// ==========================================
// ACTUALIZAR UI CONFIGURACIÓN
// ==========================================

function updateConfigurationUI() {

    const playerCount =
        getCurrentPlayerCount();


    document
        .getElementById(
            "config-player-count"
        )
        .textContent =
            playerCount;


    document
        .getElementById(
            "wolves-value"
        )
        .textContent =
            gameConfig.wolves;


    document
        .getElementById(
            "villagers-value"
        )
        .textContent =
            gameConfig.villagers;


    document
        .getElementById(
            "config-wolf-count-display"
        )
        .textContent =
            gameConfig.wolves;


    document
        .getElementById(
            "config-villager-count-display"
        )
        .textContent =
            gameConfig.villagers;


    // Sincronizar checkboxes

    Object.entries(
        checkboxMap
    ).forEach(
        ([elementId, path]) => {

            document
                .getElementById(
                    elementId
                )
                .checked =
                    gameConfig[path[0]][path[1]];

        }
    );


    document
        .getElementById(
            "reveal-roles"
        )
        .checked =
            gameConfig.revealRoles;


    const validation =
        validateConfiguration();


    document
        .getElementById(
            "wolf-pool-count"
        )
        .textContent =
            `${validation.wolfPoolSize} cargos`;


    document
        .getElementById(
            "village-pool-count"
        )
        .textContent =
            `${validation.villagePoolSize} cargos`;


    renderConfigurationWarnings(
        validation
    );


    document
        .getElementById(
            "confirm-config-btn"
        )
        .disabled =
            validation.errors.length > 0;

}


// ==========================================
// VALIDAR CONFIGURACIÓN
// ==========================================

function validateConfiguration() {

    const playerCount =
        getCurrentPlayerCount();


    let wolfPoolSize =
        gameConfig.wolves;


    if (
        gameConfig.wolfRoles.shapeshifter
    ) {

        wolfPoolSize++;

    }


    if (
        gameConfig.wolfRoles.lookout
    ) {

        wolfPoolSize++;

    }


    if (
        gameConfig.wolfRoles.magic
    ) {

        wolfPoolSize++;

    }


    let villageSpecialCount = 0;


    Object.values(
        gameConfig.villageRoles
    ).forEach(
        enabled => {

            if (enabled) {
                villageSpecialCount++;
            }

        }
    );


    const villagePoolSize =
        villageSpecialCount +
        gameConfig.villagers;


    const errors = [];

    const warnings = [];


    // --------------------------------------
    // Número de jugadores
    // --------------------------------------

    if (playerCount < 2) {

        errors.push(
            "Debe haber al menos 2 jugadores."
        );

    }


    // --------------------------------------
    // Número de lobos
    // --------------------------------------

    if (
        gameConfig.wolves < 1
    ) {

        errors.push(
            "Debe haber al menos 1 lobo."
        );

    }


    if (
        gameConfig.wolves >= playerCount
    ) {

        errors.push(
            "No puede haber tantos lobos como jugadores."
        );

    }


    // --------------------------------------
    // Pool total
    // --------------------------------------

    const totalPool =
        wolfPoolSize +
        villagePoolSize;


    if (
        totalPool <
        playerCount
    ) {

        errors.push(
            `El pool total tiene ${totalPool} cargos, pero hay ${playerCount} jugadores. Debe haber al menos un cargo disponible por jugador.`
        );

    }


    // --------------------------------------
    // Pueblerinos
    // --------------------------------------

    if (
        gameConfig.villagers >
        playerCount -
        gameConfig.wolves
    ) {

        errors.push(
            "Hay más pueblerinos configurados que jugadores disponibles para el pueblo."
        );

    }


    // --------------------------------------
    // CAMBIAPFORMAS / JOKER
    // --------------------------------------

    const villageRolesAvailable =
        villageSpecialCount +
        gameConfig.villagers;


    if (
        gameConfig.wolfRoles.shapeshifter &&
        villageRolesAvailable < 1
    ) {

        errors.push(
            "El Lobo cambiaformas está activado, pero no existe ningún cargo de pueblo que pueda quedar fuera del reparto."
        );

    }


    if (
        gameConfig.villageRoles.joker &&
        villageRolesAvailable < 2
    ) {

        warnings.push(
            "El Joker está activado, pero el pool del pueblo es muy reducido. Puede que no tenga un cargo disponible para elegir."
        );

    }


    // --------------------------------------
    // REVELACIÓN + MÉDIUM
    // --------------------------------------

    if (
        gameConfig.revealRoles &&
        gameConfig.villageRoles.medium
    ) {

        warnings.push(
            "Al revelar los cargos al morir, la Médium deja de tener utilidad. Se recomienda desactivarla."
        );

    }


    // --------------------------------------
    // PUEBLO SIN CARGOS
    // --------------------------------------

    if (
        villagePoolSize === 0
    ) {

        errors.push(
            "El pool del pueblo está vacío."
        );

    }


    // --------------------------------------
    // AVISO SI HAY MUCHOS CARGOS
    // --------------------------------------

    if (
        totalPool >
        playerCount + 10
    ) {

        warnings.push(
            `Hay ${totalPool} cargos disponibles para ${playerCount} jugadores. Quedarán bastantes cargos fuera del reparto.`
        );

    }


    return {

        errors,

        warnings,

        wolfPoolSize,

        villagePoolSize,

        totalPool

    };

}


// ==========================================
// MOSTRAR AVISOS
// ==========================================

function renderConfigurationWarnings(
    validation
) {

    const container =
        document.getElementById(
            "config-warnings"
        );


    container.innerHTML = "";


    if (
        validation.errors.length === 0 &&
        validation.warnings.length === 0
    ) {

        container.classList.add(
            "hidden"
        );

        return;

    }


    container.classList.remove(
        "hidden"
    );


    if (
        validation.errors.length > 0
    ) {

        container.classList.add(
            "error"
        );


        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            "⚠ No se puede comenzar";


        container.appendChild(
            title
        );


        const list =
            document.createElement(
                "ul"
            );


        validation.errors.forEach(
            message => {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    message;

                list.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            list
        );

    } else {

        container.classList.remove(
            "error"
        );

    }


    if (
        validation.warnings.length > 0
    ) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            validation.errors.length > 0
                ? "ℹ Además"
                : "⚠ Ten en cuenta";


        container.appendChild(
            title
        );


        const list =
            document.createElement(
                "ul"
            );


        validation.warnings.forEach(
            message => {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    message;

                list.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            list
        );

    }

}


// ==========================================
// OBTENER NÚMERO DE JUGADORES
// ==========================================

function getCurrentPlayerCount() {

    return getLobbyPlayerCount();

}


function getLobbyPlayerCount() {

    const playersList =
        document.getElementById(
            "players-list"
        );


    if (
        !playersList
    ) {

        return 0;

    }


    return playersList
        .querySelectorAll(
            ".player"
        )
        .length;

}


// ==========================================
// CONFIRMAR CONFIGURACIÓN
// ==========================================

document
    .getElementById(
        "confirm-config-btn"
    )
    .addEventListener(
        "click",
        confirmConfiguration
    );


async function confirmConfiguration() {

    if (!isHost) {
        return;
    }


    const validation =
        validateConfiguration();


    if (
        validation.errors.length > 0
    ) {

        alert(
            "Hay problemas en la configuración. Revísalos antes de comenzar."
        );

        return;

    }


    try {

        await update(
            ref(
                database,
                `games/${currentGameCode}`
            ),
            {

                status:
                    "started",

                config:
                    gameConfig

            }
        );


    } catch (error) {

        console.error(error);

        alert(
            "No se ha podido comenzar la partida.\n\n" +
            error.message
        );

    }

}


// ==========================================
// COPIAR CÓDIGO
// ==========================================

document
    .getElementById(
        "copy-code-btn"
    )
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


                button.textContent =
                    "✓";


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
    .getElementById(
        "leave-game-btn"
    )
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

            await remove(
                ref(
                    database,
                    `games/${currentGameCode}`
                )
            );

        } else {

            await remove(
                ref(
                    database,
                    `games/${currentGameCode}/players/${currentPlayerId}`
                )
            );

        }


        resetGameState();

        showScreen(
            "home-screen"
        );


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

    gameConfig = {

        wolves: 3,

        villagers: 0,

        wolfRoles: {

            shapeshifter: true,

            lookout: true,

            magic: true

        },

        villageRoles: {

            girl: true,

            seer: true,

            cupid: true,

            witch: true,

            hunter: true,

            apprentice: true,

            mage: true,

            joker: true,

            medium: true,

            protector: true,

            detective: true

        },

        revealRoles: false

    };

}


// ==========================================
// GENERAR CÓDIGO
// ==========================================

function generateGameCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        code +=
            characters[index];

    }


    return code;

}


// ==========================================
// LIMPIAR PARTIDAS CADUCADAS
// ==========================================

async function cleanupExpiredGames() {

    try {

        const gamesRef =
            ref(
                database,
                "games"
            );


        const snapshot =
            await get(gamesRef);


        if (!snapshot.exists()) {
            return;
        }


        const games =
            snapshot.val();


        const now =
            Date.now();


        for (
            const [
                gameCode,
                game
            ]
            of Object.entries(games)
        ) {

            if (
                game.createdAt &&
                now -
                game.createdAt >=
                GAME_DURATION
            ) {

                console.log(
                    `Eliminando partida caducada: ${gameCode}`
                );


                await remove(
                    ref(
                        database,
                        `games/${gameCode}`
                    )
                );

            }

        }


    } catch (error) {

        console.error(
            "Error limpiando partidas:",
            error
        );

    }

}


cleanupExpiredGames();
