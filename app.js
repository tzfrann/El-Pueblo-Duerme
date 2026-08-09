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


// ==========================================
// CONFIGURACIÓN
// ==========================================

const GAME_DURATION =
    3 * 60 * 60 * 1000;


function getDefaultGameConfig() {

    return {

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

        revealRoles: false,
        secretVoting: false
    };
}

    };

}


let gameConfig =
    getDefaultGameConfig();


// ==========================================
// INFORMACIÓN DE CARGOS
// ==========================================

const ROLE_INFO = {

    wolf: {

        name: "Lobo",

        description:
            "Formas parte del bando de los lobos. Tu objetivo es eliminar al pueblo."

    },


    shapeshifter: {

        name: "Lobo cambiaformas",

        description:
            "Eres un lobo con una identidad especial. Más adelante esta habilidad tendrá sus reglas propias."

    },


    lookout: {

        name: "Lobo vigía",

        description:
            "Eres un lobo con una habilidad especial de vigilancia."

    },


    magic: {

        name: "Lobo mágico",

        description:
            "Eres un lobo con una habilidad mágica especial."

    },


    villager: {

        name: "Pueblerino",

        description:
            "No tienes una habilidad especial. Tu objetivo es descubrir y eliminar a los lobos."

    },


    girl: {

        name: "Niña",

        description:
            "Perteneces al pueblo y dispones de tu habilidad especial durante la noche."

    },


    seer: {

        name: "Vidente",

        description:
            "Perteneces al pueblo y puedes descubrir información sobre otros jugadores."

    },


    cupid: {

        name: "Cupido",

        description:
            "Perteneces al pueblo y tienes la capacidad de establecer los vínculos propios de Cupido."

    },


    witch: {

        name: "Bruja",

        description:
            "Perteneces al pueblo y dispones de las habilidades de la Bruja."

    },


    hunter: {

        name: "Cazador",

        description:
            "Perteneces al pueblo y cuentas con la habilidad especial del Cazador."

    },


    apprentice: {

        name: "Aprendiz",

        description:
            "Perteneces al pueblo. Si llega el momento correspondiente, podrás adquirir el cargo de pueblo asociado al Lobo cambiaformas."

    },


    mage: {

        name: "Mago",

        description:
            "Perteneces al pueblo y dispones de la habilidad especial del Mago."

    },


    joker: {

        name: "Joker",

        description:
            "Perteneces al pueblo y dispones de la habilidad especial del Joker."

    },


    medium: {

        name: "Médium",

        description:
            "Perteneces al pueblo y dispones de la habilidad especial de la Médium."

    },


    protector: {

        name: "Protector",

        description:
            "Perteneces al pueblo y dispones de la habilidad especial del Protector."

    },


    detective: {

        name: "Detective",

        description:
            "Perteneces al pueblo y dispones de la habilidad especial del Detective."

    }

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
// NAVEGACIÓN PRINCIPAL
// ==========================================

document
    .getElementById("create-game-btn")
    .addEventListener(
        "click",
        () => {

            showScreen("create-screen");

        }
    );


document
    .getElementById("join-game-btn")
    .addEventListener(
        "click",
        () => {

            showScreen("join-screen");

        }
    );


document
    .getElementById("create-back-btn")
    .addEventListener(
        "click",
        () => {

            showScreen("home-screen");

        }
    );


document
    .getElementById("join-back-btn")
    .addEventListener(
        "click",
        () => {

            showScreen("home-screen");

        }
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
                window.currentGameData = game;


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


                // ======================================
                // CONFIGURACIÓN
                // ======================================

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


                // ======================================
                // PARTIDA
                // ======================================

                if (
    game.status ===
    "started"
) {

    showScreen(
        "game-screen"
    );

    // Solo inicializamos el motor si
    // todavía no hemos empezado esta partida.

    if (
        currentRoundActions.length === 0
    ) {

        initializeGame();

    }

    return;
}}


                // ======================================
                // SALA
                // ======================================

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


    /*
     * IMPORTANTE:
     *
     * El narrador aparece en la lista,
     * pero NO cuenta como jugador de la partida.
     */

    const actualPlayers =
        playerArray.filter(
            ([playerId, player]) =>
                playerId !== game.hostId &&
                player.host !== true
        );


    const playerCount =
        actualPlayers.length;


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


            if (
                playerId === game.hostId ||
                player.host === true
            ) {

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
// CARGAR CONFIGURACIÓN
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
// EVENTOS CONFIGURACIÓN
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

document
    .getElementById(
        "secret-voting"
    )
    .addEventListener(
        "change",
        event => {
            gameConfig.secretVoting = event.target.checked;
            updateConfigurationUI();
        }
    );


// ==========================================
// ACTUALIZAR CONFIGURACIÓN
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
            getWolfPoolSize();


    document
        .getElementById(
            "config-villager-count-display"
        )
        .textContent =
            getVillagePoolSize();


    Object.entries(
        checkboxMap
    ).forEach(
        ([elementId, path]) => {

            document
                .getElementById(elementId)
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
    
    document
        .getElementById(
            "secret-voting"
        )
        .checked =
            gameConfig.secretVoting;

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
// TAMAÑOS DE POOL
// ==========================================

function getWolfPoolSize() {

    let count =
        gameConfig.wolves;


    if (
        gameConfig.wolfRoles.shapeshifter
    ) {

        count++;

    }


    if (
        gameConfig.wolfRoles.lookout
    ) {

        count++;

    }


    if (
        gameConfig.wolfRoles.magic
    ) {

        count++;

    }


    return count;

}


function getVillagePoolSize() {

    let count =
        gameConfig.villagers;


    Object.values(
        gameConfig.villageRoles
    ).forEach(
        enabled => {

            if (enabled) {

                count++;

            }

        }
    );


    return count;

}


// ==========================================
// VALIDAR CONFIGURACIÓN
// ==========================================

function validateConfiguration() {

    const playerCount =
        getCurrentPlayerCount();


    const wolfPoolSize =
        getWolfPoolSize();


    const villagePoolSize =
        getVillagePoolSize();


    const totalPool =
        wolfPoolSize +
        villagePoolSize;


    const errors = [];

    const warnings = [];


    // --------------------------------------
    // JUGADORES
    // --------------------------------------

    if (playerCount < 1) {

        errors.push(
            "Debe haber al menos 1 jugador además del narrador."
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
        gameConfig.wolves >= playerCount
    ) {

        errors.push(
            "No puede haber tantos lobos normales como jugadores."
        );

    }


    // --------------------------------------
    // POOL TOTAL
    // --------------------------------------

    if (
        totalPool <
        playerCount
    ) {

        errors.push(
            `El pool tiene ${totalPool} cargos para ${playerCount} jugadores. Faltan cargos.`
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
    // REVELACIÓN + MÉDIUM
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
// NÚMERO DE JUGADORES
// ==========================================

function getCurrentPlayerCount() {

    const playersList =
        document.getElementById(
            "players-list"
        );


    if (!playersList) {

        return 0;

    }


    const elements =
        playersList.querySelectorAll(
            ".player"
        );


    let count = 0;


    elements.forEach(
        element => {

            const badge =
                element.querySelector(
                    ".host-badge"
                );


            if (!badge) {

                count++;

            }

        }
    );


    return count;

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

        /*
         * Creamos el reparto.
         *
         * IMPORTANTE:
         * El narrador no participa en el reparto.
         */

        const gameRef =
            ref(
                database,
                `games/${currentGameCode}`
            );


        const snapshot =
            await get(gameRef);


        if (!snapshot.exists()) {

            alert(
                "La partida ya no existe."
            );

            return;

        }


        const game =
            snapshot.val();


        const players =
            game.players || {};


        const playerEntries =
            Object.entries(players)
                .filter(
                    ([playerId, player]) =>
                        playerId !== game.hostId &&
                        player.host !== true
                );


        if (
            playerEntries.length < 1
        ) {

            alert(
                "No hay jugadores para repartir."
            );

            return;

        }


        // ======================================
        // CREAR POOL DE CARGOS
        // ======================================

        const rolePool = [];


        // Lobos normales

        for (
            let i = 0;
            i < gameConfig.wolves;
            i++
        ) {

            rolePool.push("wolf");

        }


        // Lobos especiales

        if (
            gameConfig.wolfRoles.shapeshifter
        ) {

            rolePool.push(
                "shapeshifter"
            );

        }


        if (
            gameConfig.wolfRoles.lookout
        ) {

            rolePool.push(
                "lookout"
            );

        }


        if (
            gameConfig.wolfRoles.magic
        ) {

            rolePool.push(
                "magic"
            );

        }


        // Pueblerinos

        for (
            let i = 0;
            i < gameConfig.villagers;
            i++
        ) {

            rolePool.push(
                "villager"
            );

        }


        // Roles especiales del pueblo

        Object.entries(
            gameConfig.villageRoles
        ).forEach(
            ([role, enabled]) => {

                if (enabled) {

                    rolePool.push(
                        role
                    );

                }

            }
        );


        // ======================================
        // BARAJAR
        // ======================================

        shuffleArray(
            rolePool
        );


        // ======================================
        // REPARTIR
        // ======================================

        const assignedRoles = {};

        const usedRoles = [];


        playerEntries.forEach(
            ([playerId, player]) => {

                const role =
                    rolePool.shift();


                assignedRoles[playerId] =
                    role;


                usedRoles.push(
                    role
                );

            }
        );


        // ======================================
        // CARGOS SOBRANTES
        // ======================================

        const unusedRoles =
            [...rolePool];


        // ======================================
        // PREPARAR PLAYERS
        // ======================================

        const playerUpdates = {};


        Object.entries(
            assignedRoles
        ).forEach(
            ([playerId, role]) => {

                playerUpdates[
                    `players/${playerId}/role`
                ] =
                    role;


                playerUpdates[
                    `players/${playerId}/originalRole`
                ] =
                    role;


                playerUpdates[
                    `players/${playerId}/alive`
                ] =
                    true;


                playerUpdates[
                    `players/${playerId}/deathNight`
                ] =
                    null;

            }
        );


        // ======================================
        // DATOS INICIALES DE PARTIDA
        // ======================================

        const gameUpdates = {
            status: "started",
            config: gameConfig,
            round: 1, 
            phase: "night",
            currentActionIndex: 0,
            initializedAt: Date.now(),
            unusedRoles: unusedRoles,
            nightActions: {}, 
            usedPowers: { 
                magicWolf: false,
                seer: false,
                mage: false,
                witchRevive: false,
                witchKill: false
            },
            deaths: {},
            events: {}
        };


        Object.assign(
            gameUpdates,
            playerUpdates
        );


        await update(
            gameRef,
            gameUpdates
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
// MOSTRAR PARTIDA
// ==========================================

function showGameScreen(game) {

    showScreen(
        "game-screen"
    );


    document
        .getElementById(
            "current-night"
        )
        .textContent =
            game.night || 1;


    if (isHost) {

        showNarratorGameView(
            game
        );

    } else {

        showPlayerGameView(
            game
        );

    }

}

// ==========================================
// VISTA JUGADOR
// ==========================================

function showPlayerGameView(game) {
    document.getElementById("player-game-view").classList.remove("hidden");
    document.getElementById("narrator-game-view").classList.add("hidden");

    const player = game.players && game.players[currentPlayerId];
    if (!player) return;

    document.getElementById("game-player-name").textContent = player.name;

    const role = player.role;
    const info = ROLE_INFO[role] || {
        name: role || "Sin cargo",
        description: "No hay información disponible sobre este cargo."
    };

    document.getElementById("player-role-name").textContent = info.name;
    document.getElementById("player-role-description").textContent = info.description;

    const statusElement = document.getElementById("player-status");
    if (player.alive === false) {
        statusElement.textContent = "Muerto";
        statusElement.classList.remove("alive-status");
        statusElement.classList.add("dead-status");
    } else {
        statusElement.textContent = "Vivo";
        statusElement.classList.remove("dead-status");
        statusElement.classList.add("alive-status");
    }

    const message = document.getElementById("player-game-message");
    message.innerHTML = ""; // Limpiamos para poder meter botones
    
    // Si está muerto, día o votación, mostramos texto estático
    if (!game.players[currentPlayerId].alive) {
        message.textContent = "Has muerto. No puedes hablar ni interactuar.";
        message.style.borderColor = ""; message.style.color = "";
        return;
    } else if (game.phase === "day") {
        message.textContent = "☀️ El pueblo despierta. Escucha al narrador.";
        message.style.borderColor = ""; message.style.color = "";
        return;
    } else if (game.phase === "voting") {
        // --- NUEVO: Llamamos a la pantalla de votación ---
        renderPlayerVoting(game, message);
        return;
    }

    // SI ESTAMOS EN LA NOCHE: Comprobar si es mi turno
    const activeActions = getActiveActions(game);
    if (game.currentActionIndex >= activeActions.length) {
        message.textContent = "🌙 El pueblo duerme. Cierra los ojos.";
        return;
    }

    const currentAction = activeActions[game.currentActionIndex];
    const playerRole = game.players[currentPlayerId].role;
    
    // ¿Me toca a mí?
    const isWolfAction = currentAction.type === "wolves" && ["wolf", "shapeshifter", "lookout", "magic"].includes(playerRole);
    const isMyRoleAction = currentAction.requiresRole === playerRole;
    
    if (isWolfAction || isMyRoleAction) {
        // ¡Es mi turno! Dibujamos los botones
        renderPlayerNightAction(game, currentAction, message);
    } else {
        // No es mi turno
        message.textContent = "🌙 El pueblo duerme. Cierra los ojos y espera en silencio.";
        message.style.borderColor = ""; message.style.color = "";
    }
}

function renderPlayerNightAction(game, action, container) {
    const currentDecision = game.nightActions && game.nightActions[action.id];
    
    if (currentDecision) {
        container.innerHTML = `<strong>¡Decisión enviada!</strong><br>Espera a que el narrador valide la acción en silencio.`;
        container.style.borderColor = "#9fd0a5";
        container.style.color = "#9fd0a5";
        return;
    }
    
    container.style.borderColor = "#7b5cff";
    container.style.color = "white";

    // --- INTERFAZ EXCLUSIVA PARA LA BRUJA ---
    if (action.id === "witch") {
        const title = document.createElement("p");
        title.style.marginBottom = "15px";
        title.innerHTML = `<strong>¡Despierta, Bruja!</strong><br>Tienes dos pociones.`;
        container.appendChild(title);

        let decision = { revive: null, kill: null };
        const wolfTargetId = game.nightActions && game.nightActions.wolves;
        const wolfTargetName = wolfTargetId && wolfTargetId !== "skip" && game.players[wolfTargetId] ? game.players[wolfTargetId].name : null;

        // POCIÓN DE VIDA
        const reviveDiv = document.createElement("div");
        reviveDiv.style.marginBottom = "20px"; reviveDiv.style.padding = "15px";
        reviveDiv.style.background = "#29263a"; reviveDiv.style.borderRadius = "8px";
        
        if (game.usedPowers && game.usedPowers.witchRevive) {
            reviveDiv.innerHTML = `<span style="color:#aaa6b8;">Poción de Vida: Agotada</span>`;
        } else if (wolfTargetName) {
            reviveDiv.innerHTML = `<p style="margin-bottom:10px;">Los lobos han atacado a <strong>${wolfTargetName}</strong>.</p>`;
            const btnRevive = document.createElement("button");
            btnRevive.className = "action-player-btn";
            btnRevive.textContent = `💉 Revivir a ${wolfTargetName}`;
            btnRevive.addEventListener("click", () => {
                btnRevive.classList.toggle("selected");
                decision.revive = btnRevive.classList.contains("selected") ? wolfTargetId : null;
            });
            reviveDiv.appendChild(btnRevive);
        } else {
            reviveDiv.innerHTML = `<span style="color:#aaa6b8;">Nadie ha sido atacado por los lobos.</span>`;
        }
        container.appendChild(reviveDiv);

        // POCIÓN DE MUERTE
        const killDiv = document.createElement("div");
        killDiv.style.marginBottom = "20px"; killDiv.style.padding = "15px";
        killDiv.style.background = "#29263a"; killDiv.style.borderRadius = "8px";

        if (game.usedPowers && game.usedPowers.witchKill) {
            killDiv.innerHTML = `<span style="color:#aaa6b8;">Poción de Muerte: Agotada</span>`;
        } else {
            killDiv.innerHTML = `<p style="margin-bottom:10px;">Poción de Muerte (Opcional):</p>`;
            const list = document.createElement("div");
            list.className = "action-player-list";
            Object.entries(game.players).filter(([id, p]) => p.alive && !p.host).forEach(([id, p]) => {
                const btnKill = document.createElement("button");
                btnKill.className = "action-player-btn";
                btnKill.textContent = `☠️ Matar a ${p.name}`;
                btnKill.addEventListener("click", () => {
                    Array.from(list.children).forEach(b => b.classList.remove("selected"));
                    if (decision.kill === id) {
                        decision.kill = null; 
                    } else {
                        btnKill.classList.add("selected");
                        decision.kill = id;
                    }
                });
                list.appendChild(btnKill);
            });
            killDiv.appendChild(list);
        }
        container.appendChild(killDiv);

        // BOTÓN CONFIRMAR
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "primary-btn";
        confirmBtn.style.width = "100%";
        confirmBtn.textContent = "Confirmar decisiones";
        confirmBtn.addEventListener("click", () => {
            if (!decision.revive && !decision.kill) {
                sendNightActionToFirebase(action.id, "skip");
            } else {
                sendNightActionToFirebase(action.id, decision);
            }
        });
        container.appendChild(confirmBtn);

        return; // Termina la UI de la bruja
    }
    // --- FIN INTERFAZ BRUJA ---

    // UI para el resto de roles (Vidente, Lobos, etc.)
    const title = document.createElement("p");
    title.style.marginBottom = "15px";
    title.innerHTML = `<strong>¡Despierta! Es tu turno.</strong><br>${action.description}`;
    container.appendChild(title);

    const list = document.createElement("div");
    list.className = "action-player-list";

    const optionalRoles = ["seer", "magic", "protector", "mage"]; 
    if (optionalRoles.includes(action.requiresRole)) {
        const passBtn = document.createElement("button");
        passBtn.className = "action-player-btn";
        passBtn.style.backgroundColor = "#4b416f"; 
        passBtn.textContent = "No usar poder esta noche";
        passBtn.addEventListener("click", () => sendNightActionToFirebase(action.id, "skip"));
        list.appendChild(passBtn);
    }

    let optionsList = [];
    if (action.targetPlayers) {
        optionsList = Object.entries(game.players)
            .filter(([id, p]) => p.alive && !p.host)
            .map(([id, p]) => ({ id, name: p.name }));
    } else if (action.targetPool === "village") {
        const unusedRoles = game.unusedRoles || [];
        const villageRoles = unusedRoles.filter(role => role !== "wolf" && role !== "shapeshifter" && role !== "lookout" && role !== "magic");
        optionsList = villageRoles.map((role, idx) => ({ id: `${role}-${idx}`, name: ROLE_INFO[role] ? ROLE_INFO[role].name : role }));
    }
    
    const amount = action.targetPlayers || 1;
    let selectedIds = [];

    optionsList.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "action-player-btn";
        btn.textContent = opt.name;
        
        btn.addEventListener("click", () => {
            if (amount === 1) {
                sendNightActionToFirebase(action.id, opt.id);
            } else {
                if (selectedIds.includes(opt.id)) {
                    selectedIds = selectedIds.filter(id => id !== opt.id);
                    btn.classList.remove("selected");
                } else if (selectedIds.length < amount) {
                    selectedIds.push(opt.id);
                    btn.classList.add("selected");
                }
                if (selectedIds.length === amount) {
                    sendNightActionToFirebase(action.id, selectedIds.join(","));
                }
            }
        });
        list.appendChild(btn);
    });
    container.appendChild(list);
}

async function sendNightActionToFirebase(actionId, targetId) {
    if (!currentGameCode) return;
    try {
        await update(ref(database, `games/${currentGameCode}/nightActions`), {
            [actionId]: targetId
        });
    } catch (error) {
        console.error("Error enviando acción nocturna:", error);
    }
}

// ==========================================
// VISTA NARRADOR
// ==========================================

function showNarratorGameView(game) {

    document
        .getElementById(
            "player-game-view"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "narrator-game-view"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "narrator-night"
        )
        .textContent =
            game.night || 1;


    const players =
        game.players || {};


    const playerEntries =
        Object.entries(players)
            .filter(
                ([playerId, player]) =>
                    playerId !== game.hostId &&
                    player.host !== true
            );


    const list =
        document.getElementById(
            "narrator-players-list"
        );


    list.innerHTML = "";


    playerEntries.forEach(
        ([playerId, player]) => {

            const element =
                document.createElement(
                    "div"
                );


            element.classList.add(
                "narrator-player"
            );


            if (
                player.alive === false
            ) {

                element.classList.add(
                    "narrator-player-dead"
                );

            }


            const name =
                document.createElement(
                    "span"
                );


            name.classList.add(
                "narrator-player-name"
            );


            name.textContent =
                player.name;


            const role =
                document.createElement(
                    "span"
                );


            role.classList.add(
                "narrator-player-role"
            );


            const roleInfo =
                ROLE_INFO[player.role];


            role.textContent =
                roleInfo
                    ? roleInfo.name
                    : player.role || "—";


            element.appendChild(
                name
            );


            element.appendChild(
                role
            );


            list.appendChild(
                element
            );

        }
    );


    renderUnusedRoles(
        game.unusedRoles || []
    );
// Mostrar resumen de acciones al narrador
    const summaryBox = document.querySelector("#narrator-game-view .game-message");
    summaryBox.innerHTML = "<strong>Resumen de la Noche:</strong><br><br>";
    
    if (game.nightActions && Object.keys(game.nightActions).length > 0) {
        Object.entries(game.nightActions).forEach(([actionId, targetId]) => {
            let targetName = targetId;
            // Si el objetivo es un jugador, mostramos su nombre
            if (game.players[targetId]) {
                targetName = game.players[targetId].name;
            }
            summaryBox.innerHTML += `► <b>${actionId}</b> eligió a: <b>${targetName}</b><br><br>`;
        });
    } else {
        summaryBox.innerHTML += "Todavía no hay acciones registradas esta noche.";
    }
// Refrescar el panel de acciones si es de noche
    if (game.phase === "night") {
        renderCurrentAction();
    }
}


// ==========================================
// CARGOS SOBRANTES
// ==========================================

function renderUnusedRoles(
    roles
) {

    const container =
        document.getElementById(
            "unused-roles-list"
        );


    container.innerHTML = "";


    if (
        roles.length === 0
    ) {

        container.textContent =
            "No quedan cargos fuera del reparto.";

        return;

    }


    roles.forEach(
        role => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.classList.add(
                "role-tag"
            );


            const info =
                ROLE_INFO[role];


            tag.textContent =
                info
                    ? info.name
                    : role;


            container.appendChild(
                tag
            );

        }
    );

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


    gameConfig =
        getDefaultGameConfig();

}


// ==========================================
// BARAJAR ARRAY
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

// ==========================================
// MOTOR DE RONDAS
// ==========================================


// ------------------------------------------
// DEFINICIÓN DE ACCIONES
// ------------------------------------------

const ROUND_1_ACTIONS = [

    {
        id: "sleep",
        role: "Pueblo",
        title: "El pueblo duerme",
        icon: "🌙",
        description:
            "Todos los jugadores deben cerrar los ojos.",
        type: "narrator"
    },

    {
        id: "shapeshifter",
        role: "Lobo cambiaformas",
        title: "Lobo cambiaformas",
        icon: "🐺",
        description:
            "El Lobo cambiaformas puede elegir un cargo del pool de sobras del pueblo.",
        type: "role",
        requiresRole: "shapeshifter",
        targetPool: "village"
    },

    {
        id: "joker",
        role: "Joker",
        title: "Joker",
        icon: "🃏",
        description:
            "El Joker puede elegir un cargo del pool de sobras del pueblo.",
        type: "role",
        requiresRole: "joker",
        targetPool: "village"
    },

    {
        id: "cupid",
        role: "Cupido",
        title: "Cupido",
        icon: "💘",
        description:
            "Cupido debe elegir a los dos jugadores que estarán enamorados.",
        type: "role",
        requiresRole: "cupid",
        targetPlayers: 2
    },

    {
        id: "lovers",
        role: "Enamorados",
        title: "Los enamorados se despiertan",
        icon: "❤️",
        description:
            "Los dos enamorados se despiertan y se ven entre ellos.",
        type: "special"
    },

    {
        id: "magic-wolf",
        role: "Lobo mágico",
        title: "Lobo mágico",
        icon: "🔮",
        description:
            "El Lobo mágico decide si quiere utilizar su poder.",
        type: "role",
        requiresRole: "magic"
    },

    {
        id: "seer",
        role: "Vidente",
        title: "Vidente",
        icon: "👁️",
        description:
            "La Vidente decide si quiere utilizar su poder y puede elegir a cualquier jugador.",
        type: "role",
        requiresRole: "seer",
        targetPlayers: 1
    },

    {
        id: "detective",
        role: "Detective",
        title: "Detective",
        icon: "🕵️",
        description:
            "El Detective elige a un jugador.",
        type: "role",
        requiresRole: "detective",
        targetPlayers: 1
    },

    {
        id: "protector",
        role: "Protector",
        title: "Protector",
        icon: "🛡️",
        description:
            "El Protector decide si quiere utilizar su poder.",
        type: "role",
        requiresRole: "protector",
        targetPlayers: 1
    },

    {
        id: "wolves",
        role: "Lobos",
        title: "Los lobos despiertan",
        icon: "🐺",
        description:
            "Los lobos deciden conjuntamente a quién eliminar.",
        type: "wolves",
        targetPlayers: 1
    },

    {
        id: "witch",
        role: "Bruja",
        title: "Bruja",
        icon: "🧙",
        description:
            "La Bruja decide si quiere utilizar alguno de sus poderes.",
        type: "role",
        requiresRole: "witch"
    },

    {
        id: "wake",
        role: "Pueblo",
        title: "El pueblo despierta",
        icon: "☀️",
        description:
            "Todos los jugadores abren los ojos.",
        type: "narrator"
    },

    {
        id: "wolf-death",
        role: "Narrador",
        title: "Resolución de los lobos",
        icon: "⚔️",
        description:
            "El narrador anuncia quién ha sido eliminado durante la noche.",
        type: "narrator"
    },

    {
        id: "vote",
        role: "Pueblo",
        title: "Votación del pueblo",
        icon: "🗳️",
        description:
            "El pueblo debe votar para decidir a quién eliminar.",
        type: "vote"
    },

    {
        id: "vote-result",
        role: "Narrador",
        title: "Resolución de la votación",
        icon: "☠️",
        description:
            "El narrador elimina al jugador que haya recibido la votación.",
        type: "narrator"
    }

];


const NEXT_ROUND_ACTIONS = [

    {
        id: "sleep",
        role: "Pueblo",
        title: "El pueblo duerme",
        icon: "🌙",
        description:
            "Todos los jugadores deben cerrar los ojos.",
        type: "narrator"
    },

    {
        id: "medium",
        role: "Médium",
        title: "Médium",
        icon: "👻",
        description:
            "La Médium puede mirar las cartas correspondientes.",
        type: "role",
        requiresRole: "medium"
    },

    {
        id: "apprentice",
        role: "Aprendiz",
        title: "Aprendiz",
        icon: "🎓",
        description:
            "El Aprendiz realiza su acción.",
        type: "role",
        requiresRole: "apprentice"
    },

    {
        id: "magic-wolf",
        role: "Lobo mágico",
        title: "Lobo mágico",
        icon: "🔮",
        description:
            "El Lobo mágico decide si quiere utilizar su poder, si todavía dispone de él.",
        type: "role",
        requiresRole: "magic"
    },

    {
        id: "mage",
        role: "Mago",
        title: "Mago",
        icon: "🧙",
        description:
            "El Mago decide si quiere utilizar su poder, si todavía dispone de él.",
        type: "role",
        requiresRole: "mage"
    },

    {
        id: "seer",
        role: "Vidente",
        title: "Vidente",
        icon: "👁️",
        description:
            "La Vidente decide si quiere utilizar su poder y puede elegir a cualquier jugador.",
        type: "role",
        requiresRole: "seer",
        targetPlayers: 1
    },

    {
        id: "detective",
        role: "Detective",
        title: "Detective",
        icon: "🕵️",
        description:
            "El Detective elige a un jugador.",
        type: "role",
        requiresRole: "detective",
        targetPlayers: 1
    },

    {
        id: "protector",
        role: "Protector",
        title: "Protector",
        icon: "🛡️",
        description:
            "El Protector decide si quiere utilizar su poder.",
        type: "role",
        requiresRole: "protector",
        targetPlayers: 1
    },

    {
        id: "wolves",
        role: "Lobos",
        title: "Los lobos despiertan",
        icon: "🐺",
        description:
            "Los lobos deciden conjuntamente a quién eliminar.",
        type: "wolves",
        targetPlayers: 1
    },

    {
        id: "witch",
        role: "Bruja",
        title: "Bruja",
        icon: "🧙",
        description:
            "La Bruja decide si quiere utilizar alguno de sus poderes, si todavía dispone de ellos.",
        type: "role",
        requiresRole: "witch"
    },

    {
        id: "wake",
        role: "Pueblo",
        title: "El pueblo despierta",
        icon: "☀️",
        description:
            "Todos los jugadores abren los ojos.",
        type: "narrator"
    },

    {
        id: "wolf-death",
        role: "Narrador",
        title: "Resolución de los lobos",
        icon: "⚔️",
        description:
            "El narrador anuncia quién ha sido eliminado durante la noche.",
        type: "narrator"
    },

    {
        id: "vote",
        role: "Pueblo",
        title: "Votación del pueblo",
        icon: "🗳️",
        description:
            "El pueblo debe votar para decidir a quién eliminar.",
        type: "vote"
    },

    {
        id: "vote-result",
        role: "Narrador",
        title: "Resolución de la votación",
        icon: "☠️",
        description:
            "El narrador elimina al jugador que haya recibido la votación.",
        type: "narrator"
    }

];


// ------------------------------------------
// ESTADO DEL MOTOR
// ------------------------------------------

let currentRound = 1;

let currentActionIndex = 0;

let currentRoundActions = [];


// ------------------------------------------
// INICIAR PARTIDA
// ------------------------------------------

function initializeGame() {

    currentRound = 1;

    currentActionIndex = 0;

    currentRoundActions =
        [...ROUND_1_ACTIONS];

    renderCurrentAction();

}


// ------------------------------------------
// COMENZAR NUEVA RONDA
// ------------------------------------------

function startNextRound() {

    currentRound++;

    currentActionIndex = 0;

    currentRoundActions =
        [...NEXT_ROUND_ACTIONS];

    renderCurrentAction();

}


// ------------------------------------------
// OBTENER ACCIONES ACTIVAS
// ------------------------------------------

function getActiveActions(game) {
    const actionsSource = game.round === 1 ? ROUND_1_ACTIONS : NEXT_ROUND_ACTIONS;
    
    return actionsSource.filter(action => {
        if (!action.requiresRole && action.type !== "role") return true;

        const roleExistsInGame = Object.values(game.players).some(p => p.role === action.requiresRole && p.alive);
        if (!roleExistsInGame && action.requiresRole) return false;

        const powers = game.usedPowers || {};
        if (action.id === "seer" && powers.seer) return false;
        if (action.id === "magic-wolf" && powers.magicWolf) return false;
        if (action.id === "mage" && powers.mage) return false;
        
        // Si la Bruja ya ha gastado sus dos pociones, nos saltamos su turno
        if (action.id === "witch" && powers.witchRevive && powers.witchKill) return false;

        return true;
    });
}

// ------------------------------------------
// MOSTRAR ACCIÓN ACTUAL
// ------------------------------------------

function renderCurrentAction() {
    if (!window.currentGameData) return;
    const game = window.currentGameData;
    
    const content = document.getElementById("action-content");

    // --- NUEVO: PANTALLA DE DÍA (Resultados de la noche) ---
    if (game.phase === "day") {
        document.getElementById("current-round").textContent = game.round;
        document.getElementById("action-title").textContent = "☀️ El amanecer";
        document.getElementById("action-icon").textContent = "☀️";
        document.getElementById("action-role").textContent = "Narrador";
        document.getElementById("action-number").textContent = "Resolución";
        document.getElementById("action-total").textContent = "-";
        document.getElementById("action-progress-fill").style.width = "100%";
        document.getElementById("action-instruction").textContent = "Comunica al pueblo los resultados de esta noche.";
        content.innerHTML = "";

        const deaths = game.lastNightDeaths || [];
        const instruction = document.createElement("p");
        instruction.className = "action-instruction";
        
        if (deaths.length === 0) {
            instruction.innerHTML = `<strong>¡El pueblo despierta en paz!</strong><br><br>Nadie ha muerto esta noche.<br><br>Anúncialo y pulsa el botón para iniciar la fase de debate y votación.`;
        } else {
            let deadNames = deaths.map(id => game.players[id] ? game.players[id].name : "Alguien").join(", ");
            instruction.innerHTML = `<strong>¡Tragedia en el pueblo!</strong><br><br>Esta noche han muerto: <strong style="color:#d98e8e;">${deadNames}</strong>.<br><br>Anúncialo y pulsa el botón para iniciar la fase de debate y votación.`;
        }
        content.appendChild(instruction);
        
        const btn = document.getElementById("next-action-btn");
        btn.textContent = "Iniciar Votación";
        return;
    }

    // --- NUEVO: PANTALLA DE VOTACIÓN ---
    if (game.phase === "voting") {
        document.getElementById("action-title").textContent = "🗳️ Votación del pueblo";
        document.getElementById("action-icon").textContent = "🗳️";
        document.getElementById("action-role").textContent = "Pueblo";
        document.getElementById("action-instruction").textContent = "Control de votos en tiempo real.";
        content.innerHTML = "";
        
        const aliveCount = Object.values(game.players).filter(p => p.alive && !p.host).length;
        const votes = game.votes || {};
        const voteCount = Object.keys(votes).length;
        
        const status = document.createElement("p");
        status.className = "action-instruction";
        status.innerHTML = `Han votado <strong>${voteCount}</strong> de <strong>${aliveCount}</strong> jugadores vivos.<br><br>`;
        
        // Calcular votos
        const tally = {};
        Object.values(votes).forEach(v => { tally[v] = (tally[v] || 0) + 1; });
        
        if (game.config.secretVoting) {
            status.innerHTML += `<span style="color:#aaa6b8;">(La configuración indica Votos Secretos. No puedes ver quién va ganando hasta cerrar la votación).</span>`;
        } else if (voteCount > 0) {
            status.innerHTML += `<strong>Escrutinio actual:</strong><br>`;
            Object.entries(tally).forEach(([targetId, count]) => {
                const targetName = targetId === "blanco" ? "En Blanco" : (game.players[targetId]?.name || "Desconocido");
                status.innerHTML += `- ${targetName}: ${count} votos<br>`;
            });
        }
        
        content.appendChild(status);
        
        const btn = document.getElementById("next-action-btn");
        btn.textContent = "Cerrar Votación y Anochecer";
        return;
    }

    // --- PANTALLA NORMAL DE NOCHE ---
    const activeActions = getActiveActions(game);
    if (game.currentActionIndex >= activeActions.length) return; 

    const action = activeActions[game.currentActionIndex];

    document.getElementById("current-round").textContent = game.round;
    document.getElementById("action-title").textContent = action.title;
    document.getElementById("action-description").textContent = action.description;
    document.getElementById("action-icon").textContent = action.icon;
    document.getElementById("action-role").textContent = action.role;
    document.getElementById("action-instruction").textContent = action.description;
    document.getElementById("action-number").textContent = `Acción ${game.currentActionIndex + 1}`;
    document.getElementById("action-total").textContent = `de ${activeActions.length}`;

    const percentage = ((game.currentActionIndex + 1) / activeActions.length) * 100;
    document.getElementById("action-progress-fill").style.width = `${percentage}%`;

    content.innerHTML = "";
    renderActionContent(action, content, game);
    updateNextButton(action);
}


    const action =
        activeActions[
            currentActionIndex
        ];


    document
        .getElementById(
            "current-round"
        )
        .textContent =
            currentRound;


    document
        .getElementById(
            "action-title"
        )
        .textContent =
            action.title;


    document
        .getElementById(
            "action-description"
        )
        .textContent =
            action.description;


    document
        .getElementById(
            "action-icon"
        )
        .textContent =
            action.icon;


    document
        .getElementById(
            "action-role"
        )
        .textContent =
            action.role;


    document
        .getElementById(
            "action-instruction"
        )
        .textContent =
            action.description;


    document
        .getElementById(
            "action-number"
        )
        .textContent =
            `Acción ${currentActionIndex + 1}`;


    document
        .getElementById(
            "action-total"
        )
        .textContent =
            `de ${activeActions.length}`;


    const percentage =
        (
            (currentActionIndex + 1) /
            activeActions.length
        ) * 100;


    document
        .getElementById(
            "action-progress-fill"
        )
        .style.width =
            `${percentage}%`;


    const content =
        document.getElementById(
            "action-content"
        );


    content.innerHTML = "";


    renderActionContent(
        action,
        content
    );


    updateNextButton(
        action
    );

}


// ------------------------------------------
// CONTENIDO DE CADA ACCIÓN
// ------------------------------------------
function renderActionContent(action, container, game) {
    if (action.type === "narrator") {
        const msg = document.createElement("p");
        msg.className = "action-instruction";
        msg.textContent = "Anuncia esto en voz alta y pulsa Siguiente.";
        container.appendChild(msg);
        return;
    }

    const title = document.createElement("p");
    title.className = "action-instruction";
    
    const currentDecision = game.nightActions && game.nightActions[action.id];

    if (currentDecision === "skip") {
        title.innerHTML = `<strong style="color:#d98e8e;">Ha decidido NO usar su poder.</strong><br>Pulsa <strong>Validar Acción</strong> para continuar en silencio.`;
        container.appendChild(title);
        return; 
    }

    // --- INTERFAZ BRUJA NARRADOR ---
    if (action.id === "witch") {
        title.innerHTML = `Esperando a que <strong>La Bruja</strong> tome sus decisiones...<br><br><span style="font-size:0.85rem; color:#aaa6b8;">(Elegirá en su móvil. Opcionalmente puedes forzar "Pasar").</span>`;
        
        if (currentDecision && currentDecision !== "skip") {
            let msg = `<strong style="color:#9fd0a5;">¡Decisiones recibidas!</strong><br><br>`;
            if (currentDecision.revive) {
                const revName = game.players[currentDecision.revive]?.name;
                msg += `💉 Ha revivido a: <strong>${revName}</strong><br>`;
            }
            if (currentDecision.kill) {
                const killName = game.players[currentDecision.kill]?.name;
                msg += `☠️ Ha matado a: <strong>${killName}</strong><br>`;
            }
            msg += `<br>Pulsa <strong>Validar Acción</strong> para confirmar.`;
            title.innerHTML = msg;
        }
        container.appendChild(title);
        
        const skipBtn = document.createElement("button");
        skipBtn.className = "action-player-btn";
        skipBtn.textContent = "Forzar: No usar pociones";
        skipBtn.dataset.targetId = "skip";
        skipBtn.addEventListener("click", () => {
            skipBtn.classList.add("selected");
            title.innerHTML = `Has forzado manualmente que no use pociones.<br>Pulsa <strong>Validar Acción</strong>.`;
        });
        container.appendChild(skipBtn);

        return; 
    }
    // --- FIN INTERFAZ BRUJA NARRADOR ---

    // Lectura del resto de roles
    title.innerHTML = `Esperando a que <strong>${action.role}</strong> tome una decisión...<br><br><span style="font-size:0.85rem; color:#aaa6b8;">(El jugador elegirá en su móvil).</span>`;
    container.appendChild(title);

    const list = document.createElement("div");
    list.className = "action-player-list";

    let optionsList = [];
    if (action.targetPlayers) {
        optionsList = Object.entries(game.players)
            .filter(([id, p]) => p.alive && !p.host)
            .map(([id, p]) => ({ id, name: p.name }));
    } else if (action.targetPool === "village") {
        const unusedRoles = game.unusedRoles || [];
        const villageRoles = unusedRoles.filter(role => role !== "wolf" && role !== "shapeshifter" && role !== "lookout" && role !== "magic");
        optionsList = villageRoles.map((role, idx) => ({ id: `${role}-${idx}`, name: ROLE_INFO[role] ? ROLE_INFO[role].name : role }));
    }

    optionsList.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "action-player-btn";
        btn.textContent = opt.name;
        btn.dataset.targetId = opt.id; 

        if (currentDecision === opt.id) {
            btn.classList.add("selected");
            btn.style.borderColor = "#9fd0a5"; 
            
            let chivatazo = "";
            if (action.id === "seer") {
                const targetRole = game.players[opt.id].role;
                const roleName = ROLE_INFO[targetRole] ? ROLE_INFO[targetRole].name : targetRole;
                chivatazo = `<br><span style="color:#c7baff; font-size: 1.1rem;">(Hazle una seña: es <strong>${roleName}</strong>)</span>`;
            }

            title.innerHTML = `<strong style="color:#9fd0a5;">¡Decisión recibida!</strong><br>${action.role} ha elegido a ${opt.name}.${chivatazo}<br><br>Pulsa <strong>Validar Acción</strong> para confirmar.`;
        }

        btn.addEventListener("click", () => {
            document.querySelectorAll(".action-player-btn").forEach(b => {
                b.classList.remove("selected");
                b.style.borderColor = "";
            });
            btn.classList.add("selected");
            title.innerHTML = `Has marcado a ${opt.name} manualmente.<br>Pulsa <strong>Validar Acción</strong> para confirmar.`;
        });
        list.appendChild(btn);
    });

    container.appendChild(list);
}


    // --------------------------------------
    // CAMBIAFORMAS / JOKER
    // --------------------------------------

    if (
        action.targetPool ===
        "village"
    ) {

        renderVillageRolePool(
            container
        );

        return;

    }


    // --------------------------------------
    // RESTO DE ACCIONES
    // --------------------------------------

    const message =
        document.createElement(
            "p"
        );

    message.className =
        "action-instruction";

    message.textContent =
        "El narrador debe resolver esta acción.";

    container.appendChild(
        message
    );

}


// ------------------------------------------
// SELECTOR DE JUGADORES
// Borrado.(?)

// ------------------------------------------
// OBTENER JUGADORES
// ------------------------------------------

function getCurrentPlayers() {

    const playersList =
        document.getElementById(
            "players-list"
        );


    if (!playersList) {
        return [];
    }


    const elements =
        playersList.querySelectorAll(
            ".player"
        );


    return Array.from(
        elements
    ).map(
        element => {

            const nameElement =
                element.querySelector(
                    ".player-name"
                );


            return {

                id:
                    element.dataset.playerId ||
                    nameElement?.textContent ||
                    "",

                name:
                    nameElement
                        ? nameElement.textContent
                            .replace(
                                " 👑 Narrador",
                                ""
                            )
                            .trim()
                        : ""

            };

        }
    );

}


// ------------------------------------------
// POOL DE CARGOS DEL PUEBLO
// ------------------------------------------

function getVillageRolePool() {

    const pool = [];


    // Pueblerino normal

    for (
        let i = 0;
        i < gameConfig.villagers;
        i++
    ) {

        pool.push(
            "Pueblerino"
        );

    }


    // Cargos especiales del pueblo

    const villageRoleNames = {

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


    Object.entries(
        gameConfig.villageRoles
    ).forEach(
        ([role, enabled]) => {

            if (
                enabled &&
                villageRoleNames[role]
            ) {

                pool.push(
                    villageRoleNames[role]
                );

            }

        }
    );


    return pool;

}


// ------------------------------------------
// BOTÓN SIGUIENTE
// ------------------------------------------

function updateNextButton(action) {
    const button = document.getElementById("next-action-btn");
    
    if (action.type === "narrator") {
        button.textContent = "Siguiente";
    } else {
        button.textContent = "Validar Acción";
    }
}


// ------------------------------------------
// SIGUIENTE ACCIÓN
// ------------------------------------------

document
    .getElementById(
        "next-action-btn"
    )
    .addEventListener(
        "click",
        nextAction
    );

async function nextAction() {
    if (!isHost || !currentGameCode) return;
    try {
        const gameRef = ref(database, `games/${currentGameCode}`);
        const snapshot = await get(gameRef);
        const game = snapshot.val();
        
        const activeActions = getActiveActions(game); 
        const currentAction = activeActions[game.currentActionIndex];
        
        const selectedBtn = document.querySelector(".action-player-btn.selected");
        let manualTarget = selectedBtn ? selectedBtn.dataset.targetId : null;

        let finalDecision = game.nightActions ? game.nightActions[currentAction.id] : null;
        if (manualTarget) finalDecision = manualTarget;

        const updates = {};
        if (finalDecision) {
            updates[`nightActions/${currentAction.id}`] = finalDecision;
            
            if (currentAction.id === "seer") updates[`usedPowers/seer`] = true;
            if (currentAction.id === "magic-wolf") updates[`usedPowers/magicWolf`] = true;
            if (currentAction.id === "mage") updates[`usedPowers/mage`] = true;
            
            if (currentAction.id === "witch" && finalDecision !== "skip") {
                if (finalDecision.revive) updates[`usedPowers/witchRevive`] = true;
                if (finalDecision.kill) updates[`usedPowers/witchKill`] = true;
            }
        }

        const isLastAction = game.currentActionIndex >= activeActions.length - 1;

        if (isLastAction) {
            if (game.phase === "night") {
                updates["phase"] = "day";
                processDawn(game, updates); // <--- AQUÍ LLAMAMOS A LA CALCULADORA
            } else if (game.phase === "voting") {
                // --- CALCULADORA DE VOTOS ---
                const votes = game.votes || {};
                const voteCounts = {};
                Object.values(votes).forEach(votedId => {
                    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
                });
                
                let maxVotes = 0;
                let expelledId = null;
                let tie = false;
                
                for (const [id, count] of Object.entries(voteCounts)) {
                    if (id !== "blanco" && count > maxVotes) {
                        maxVotes = count;
                        expelledId = id;
                        tie = false;
                    } else if (id !== "blanco" && count === maxVotes) {
                        tie = true; // Hay empate, no muere nadie
                    }
                }
                
                if (expelledId && !tie) {
                    updates[`players/${expelledId}/alive`] = false;
                    updates[`players/${expelledId}/deathNight`] = "voting";
                }
                // -----------------------------
                
                updates["phase"] = "night";
                updates["round"] = (game.round || 1) + 1;
                updates["currentActionIndex"] = 0;
                updates["nightActions"] = null; 
                updates["lastNightDeaths"] = null;
                updates["votes"] = null;
            }
        } else {
            updates["currentActionIndex"] = game.currentActionIndex + 1;
        }

        await update(gameRef, updates);
    } catch (error) {
        console.error("Error al avanzar la acción:", error);
    }
}


// ------------------------------------------
// MODIFICAR LISTA DE JUGADORES
// ------------------------------------------
//
// Guardamos el ID real del jugador en cada
// elemento visual de la sala.
// ------------------------------------------

// ==========================================
// CALCULADORA DEL AMANECER
// ==========================================
function processDawn(game, updates) {
    const nightActions = game.nightActions || {};
    const players = game.players || {};
    let killedThisNight = [];

    // 1. Recoger objetivos
    const wolfTarget = nightActions["wolves"];
    const protectorTarget = nightActions["protector"];
    const witchDecision = nightActions["witch"];
    
    let witchKill = null;
    let witchRevive = null;
    if (witchDecision && witchDecision !== "skip") {
        witchKill = witchDecision.kill;
        witchRevive = witchDecision.revive;
    }

    // 2. Procesar ataque de los Lobos
    if (wolfTarget && wolfTarget !== "skip") {
        // Muere si no lo salva el protector ni lo revive la bruja
        if (protectorTarget !== wolfTarget && witchRevive !== wolfTarget) {
            if (!killedThisNight.includes(wolfTarget)) killedThisNight.push(wolfTarget);
        }
    }

    // 3. Procesar veneno de la Bruja
    if (witchKill && witchKill !== "skip") {
        // Asumimos que el protector también puede parar a la bruja
        if (protectorTarget !== witchKill) {
            if (!killedThisNight.includes(witchKill)) killedThisNight.push(witchKill);
        }
    }

    // 4. Lógica de Enamorados (Cupido)
    const lovers = nightActions["cupid"]; 
    if (lovers && lovers !== "skip" && typeof lovers === "string") {
        const [lover1, lover2] = lovers.split(",");
        // Si muere uno, el otro muere de pena automáticamente
        if (killedThisNight.includes(lover1) && !killedThisNight.includes(lover2)) {
            killedThisNight.push(lover2);
        } else if (killedThisNight.includes(lover2) && !killedThisNight.includes(lover1)) {
            killedThisNight.push(lover1);
        }
    }

    // 5. Aplicar muertes y buscar roles especiales para el Aprendiz
    let apprenticeId = null;
    Object.entries(players).forEach(([id, p]) => {
        if (p.role === "apprentice" && p.alive) apprenticeId = id;
    });

    let deadSpecialRoles = [];

    killedThisNight.forEach(victimId => {
        if (players[victimId]) {
            updates[`players/${victimId}/alive`] = false;
            updates[`players/${victimId}/deathNight`] = game.round;
            
            const role = players[victimId].role;
            // Si el muerto es del pueblo y tiene un rol útil, lo guardamos
            if (role !== "villager" && role !== "wolf" && role !== "apprentice") {
                deadSpecialRoles.push(role);
            }
        }
    });

    // 6. Evolución del Aprendiz
    if (apprenticeId && deadSpecialRoles.length > 0) {
         // Se convierte en el primer rol especial que haya muerto esa noche
         updates[`players/${apprenticeId}/role`] = deadSpecialRoles[0];
    }

    // Guardamos la lista de muertos para que el Narrador la lea
    updates["lastNightDeaths"] = killedThisNight;
}

// ==========================================
// PANTALLA DE VOTACIÓN (JUGADORES)
// ==========================================
function renderPlayerVoting(game, container) {
    // Si ya he votado, muestro confirmación
    const myVote = game.votes && game.votes[currentPlayerId];
    if (myVote) {
        const votedName = game.players[myVote] ? game.players[myVote].name : "alguien";
        container.innerHTML = `<strong>¡Voto registrado!</strong><br>Has votado para expulsar a: <span style="color:#d98e8e;">${votedName}</span>.<br>Espera a que el resto termine.`;
        container.style.borderColor = "#9fd0a5";
        container.style.color = "#9fd0a5";
        return;
    }

    container.style.borderColor = "#d98e8e";
    container.style.color = "white";

    const title = document.createElement("p");
    title.style.marginBottom = "15px";
    title.innerHTML = `<strong>¡Es hora de votar!</strong><br>Selecciona a quién quieres expulsar del pueblo.`;
    container.appendChild(title);

    const list = document.createElement("div");
    list.className = "action-player-list";

    // Mostramos a todos los vivos
    const alivePlayers = Object.entries(game.players).filter(([id, p]) => p.alive && !p.host);

    alivePlayers.forEach(([id, p]) => {
        const btn = document.createElement("button");
        btn.className = "action-player-btn";
        btn.textContent = `Expulsar a ${p.name}`;
        
        btn.addEventListener("click", () => {
            const confirmed = confirm(`¿Seguro que quieres expulsar a ${p.name}?`);
            if (confirmed) {
                sendVoteToFirebase(id);
            }
        });
        list.appendChild(btn);
    });
    
    // Botón para votar en blanco
    const skipBtn = document.createElement("button");
    skipBtn.className = "action-player-btn";
    skipBtn.style.backgroundColor = "#4b416f";
    skipBtn.textContent = "Votar en blanco";
    skipBtn.addEventListener("click", () => {
        if(confirm("¿Seguro que quieres votar en blanco?")) sendVoteToFirebase("blanco");
    });
    list.appendChild(skipBtn);

    container.appendChild(list);
}

async function sendVoteToFirebase(targetId) {
    if (!currentGameCode) return;
    try {
        await update(ref(database, `games/${currentGameCode}/votes`), {
            [currentPlayerId]: targetId
        });
    } catch (error) {
        console.error("Error enviando voto:", error);
    }
}


function addPlayerIdsToLobby() {

    const players =
        getCurrentPlayers();

    // Esta función queda preparada para
    // conectar posteriormente los IDs reales.
}


// ------------------------------------------
// INICIAR EL MOTOR CUANDO LA PARTIDA
// PASA A "STARTED"
// ------------------------------------------
//
// IMPORTANTE:
// Sustituimos la parte correspondiente de
// listenToGame para llamar a initializeGame().
// ------------------------------------------
cleanupExpiredGames();
