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

        revealRoles: false

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

                    showGameScreen(game);

                    return;

                }


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

            status:
                "started",

            config:
                gameConfig,

            night:
                1,

            phase:
                "night",

            initializedAt:
                Date.now(),

            unusedRoles:
                unusedRoles,

            nightActions:
                {},

            deaths:
                {},

            events:
                {}

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

    document
        .getElementById(
            "player-game-view"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "narrator-game-view"
        )
        .classList.add(
            "hidden"
        );


    const player =
        game.players &&
        game.players[currentPlayerId];


    if (!player) {

        return;

    }


    document
        .getElementById(
            "game-player-name"
        )
        .textContent =
            player.name;


    const role =
        player.role;


    const info =
        ROLE_INFO[role] ||
        {

            name:
                role || "Sin cargo",

            description:
                "No hay información disponible sobre este cargo."

        };


    document
        .getElementById(
            "player-role-name"
        )
        .textContent =
            info.name;


    document
        .getElementById(
            "player-role-description"
        )
        .textContent =
            info.description;


    const statusElement =
        document.getElementById(
            "player-status"
        );


    if (
        player.alive === false
    ) {

        statusElement.textContent =
            "Muerto";


        statusElement.classList.remove(
            "alive-status"
        );


        statusElement.classList.add(
            "dead-status"
        );

    } else {

        statusElement.textContent =
            "Vivo";


        statusElement.classList.remove(
            "dead-status"
        );


        statusElement.classList.add(
            "alive-status"
        );

    }


    const message =
        document.getElementById(
            "player-game-message"
        );


    if (
        game.phase === "night"
    ) {

        message.textContent =
            "Es de noche. El narrador está preparando las acciones nocturnas.";

    } else {

        message.textContent =
            "El pueblo está despierto.";

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


cleanupExpiredGames();
