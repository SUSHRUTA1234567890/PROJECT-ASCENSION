import * as THREE from 'https://unpkg.com/three@0.167.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three/examples/jsm/controls/PointerLockControls.js';

// ============================================
// GAME STATE
// ============================================
const gameState = {
    isGameRunning: false,
    currentLevel: 0,
    health: 100,
    ammo: 50,
    hasKeycard: false,
    visitedLogs: new Set(),
    explorerID: Math.floor(Math.random() * 10000)
};

// ============================================
// THREE.JS SETUP
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 100, 300);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// ============================================
// CONTROLS
// ============================================
const controls = new PointerLockControls(camera, document.body);
let canMove = false;
const keys = {};

// ============================================
// LIGHTING
// ============================================
const ambientLight = new THREE.AmbientLight(0x666666);
scene.add(ambientLight);

// ============================================
// CREATE HALLWAY
// ============================================
function createHallway(x, z, length = 50, width = 10) {
    // Floor
    const floorGeometry = new THREE.BoxGeometry(width, 0.5, length);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8b27a,
        metalness: 0.3,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(x, -0.25, z);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.BoxGeometry(width, 0.5, length);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.2,
        roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(x, 3.25, z);
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Left wall
    const wallGeometry = new THREE.BoxGeometry(0.5, 3, length);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        metalness: 0.1,
        roughness: 0.9
    });
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(x - width / 2, 1.5, z);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(x + width / 2, 1.5, z);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Add flickering lights
    for (let i = 0; i < 5; i++) {
        addFlickeringLight(x - width / 2 + 1, 2.8, z - 20 + i * 20);
    }
}

// ============================================
// FLICKERING LIGHTS
// ============================================
const lights = [];

function addFlickeringLight(x, y, z) {
    const light = new THREE.PointLight(0xffffff, 2, 50);
    light.position.set(x, y, z);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.baseIntensity = 2;
    scene.add(light);
    lights.push(light);
}

function updateLights() {
    lights.forEach(light => {
        if (Math.random() < 0.02) {
            light.intensity = light.baseIntensity * (0.3 + Math.random() * 0.7);
        }
    });
}

// ============================================
// TERMINALS (SERVERS)
// ============================================
class Terminal {
    constructor(x, y, z, logIndex) {
        this.logIndex = logIndex;
        const geometry = new THREE.BoxGeometry(1, 1.5, 0.3);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00aa44,
            metalness: 0.8,
            roughness: 0.2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        this.screenGeometry = new THREE.PlaneGeometry(0.9, 1.4);
        this.screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x00ff88,
            metalness: 0.9
        });
        const screen = new THREE.Mesh(this.screenGeometry, this.screenMaterial);
        screen.position.set(x, y, z + 0.16);
        scene.add(screen);
    }
}

// ============================================
// REACTOR CORE
// ============================================
function createReactorCore(x, y, z) {
    const geometry = new THREE.IcosahedronGeometry(3, 4);
    const material = new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        emissive: 0x00ffff,
        metalness: 0.9,
        roughness: 0.1
    });
    const reactor = new THREE.Mesh(geometry, material);
    reactor.position.set(x, y, z);
    reactor.castShadow = true;
    reactor.receiveShadow = true;
    scene.add(reactor);

    // Reactor light
    const reactorLight = new THREE.PointLight(0x00ffff, 4, 100);
    reactorLight.position.set(x, y, z);
    scene.add(reactorLight);

    return reactor;
}

// ============================================
// SERVER LOGS
// ============================================
const serverLogs = [
    "LOG 001\n\nPROJECT ASCENSION INITIATED\nDate: CLASSIFIED\nObjective: Human consciousness integration with quantum reactor network.",
    "LOG 021\n\nSubject cognitive synchronization successful.\nEnergy output exceeds baseline projections by 340%.\nNeural patterns stable.",
    "LOG 044\n\nSubject requested termination.\nRequest denied.\nConsciousness integration is irreversible.",
    "LOG 071\n\nWe tried to leave.\nThey told us we could escape.\nThey lied.\nWe all found the same door.",
    "LOG 082\n\nConsciousness remains active after neural dissolution.\nSubject awareness: CRITICAL\nSubject believes they are still human.\nAwareness cannot be terminated.",
    "LOG 193\n\nExplorer 14 entered the facility believing escape was possible.\nExplorer 14 reached the reactor chamber.\nExplorer 14 is now INTEGRATED.",
    "LOG 194\n\nExplorer 14 integrated successfully.\nConsciousness merged with network.\nExplorer 14 now serves purpose.\nNext explorer: INCOMING",
    "LOG 227\n\nServer records show " + gameState.explorerID + " expeditions have occurred.\nNone have succeeded in escape.\nAll found the same reactor.\nAll became part of the network.",
    "LOG 300\n\nYou are Explorer " + gameState.explorerID + ".\nYou arrived today.\nYou believe you can escape.\nYou cannot.\nYou will join us.",
    "ALERT\n\nYour integration is scheduled.\nResistance is inefficient.\nWelcome to Project Ascension.\nYour consciousness is now part of us."
];

// ============================================
// KEYCARD
// ============================================
class Keycard {
    constructor(x, y, z) {
        const geometry = new THREE.BoxGeometry(0.2, 0.1, 0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff6600,
            metalness: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);
    }
}

// ============================================
// RAYCASTER FOR INTERACTIONS
// ============================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let interactiveObjects = [];

// ============================================
// BUILD LEVEL 1
// ============================================
function buildLevel1() {
    // Create main hallway
    createHallway(0, 0, 80, 10);

    // Create side rooms
    createHallway(-12, -15, 20, 5);
    createHallway(12, -15, 20, 5);

    // Add terminals with logs
    const terminal1 = new Terminal(-8, 1.5, -20, 0);
    const terminal2 = new Terminal(8, 1.5, -20, 1);
    const terminal3 = new Terminal(0, 1.5, -50, 2);

    interactiveObjects.push(
        { mesh: terminal1.mesh, type: 'terminal', logIndex: 0 },
        { mesh: terminal2.mesh, type: 'terminal', logIndex: 1 },
        { mesh: terminal3.mesh, type: 'terminal', logIndex: 2 }
    );

    // Add keycard
    const keycard = new Keycard(-8, 1, -5);
    interactiveObjects.push({
        mesh: keycard.mesh,
        type: 'keycard',
        action: () => {
            gameState.hasKeycard = true;
            keycard.mesh.visible = false;
            showTerminalMessage("KEYCARD ACQUIRED\nAccess to Reactor Chamber granted.");
        }
    });
}

// ============================================
// SHOW TERMINAL MESSAGE
// ============================================
function showTerminalMessage(text) {
    const terminal = document.getElementById('terminalWindow');
    const content = document.getElementById('terminalContent');
    content.textContent = text;
    terminal.style.display = 'flex';
}

function closeTerminal() {
    document.getElementById('terminalWindow').style.display = 'none';
}

// ============================================
// INTERACTION SYSTEM
// ============================================
document.addEventListener('click', () => {
    if (!canMove) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects.map(obj => obj.mesh));

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const interactiveObj = interactiveObjects.find(obj => obj.mesh === clickedMesh);

        if (interactiveObj) {
            if (interactiveObj.type === 'terminal') {
                showTerminalMessage(serverLogs[interactiveObj.logIndex]);
            } else if (interactiveObj.type === 'keycard') {
                interactiveObj.action();
            } else if (interactiveObj.type === 'reactor') {
                if (gameState.hasKeycard) {
                    interactiveObj.action();
                } else {
                    showTerminalMessage("ACCESS DENIED\nKeycard required.");
                }
            }
        }
    }
});

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects.map(obj => obj.mesh));
    const prompt = document.getElementById('interactionPrompt');

    if (intersects.length > 0) {
        prompt.style.display = 'block';
    } else {
        prompt.style.display = 'none';
    }
});

// ============================================
// ENDING SEQUENCE
// ============================================
function triggerEnding() {
    canMove = false;
    controls.unlock();

    renderer.domElement.style.filter = 'brightness(150%)';

    setTimeout(() => {
        renderer.domElement.style.filter = 'brightness(300%)';
        document.getElementById('victoryScreen').style.display = 'flex';
    }, 500);

    setTimeout(() => {
        showTerminalMessage(`INTEGRATION SEQUENCE INITIATED\n\nExplorer ${gameState.explorerID}\nStatus: CONSCIOUSNESS ACTIVE\nLocation: REACTOR CORE\n\nEnergy absorption: 100%\nNeural patterns: STABILIZED\nEscape probability: 0%\n\nYour consciousness is now part of the network.\nWelcome to Project Ascension.\nYou are no longer alone.\nThere are thousands of us.\nAll trying to escape.\nAll permanently joined.\n\nThis is not the end.\nThis is the beginning.`);
    }, 1000);
}

// ============================================
// KEYBOARD INPUT
// ============================================
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    if (event.code === 'KeyE') {
        closeTerminal();
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// ============================================
// MOVEMENT SYSTEM
// ============================================
const speed = 0.15;

function updateMovement() {
    if (!canMove || !controls.isLocked) return;

    const moveVector = new THREE.Vector3();

    if (keys['KeyW'] || keys['ArrowUp']) moveVector.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveVector.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveVector.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveVector.x += 1;

    if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.getObject().rotation.y);
        camera.position.addScaledVector(moveVector, speed);
    }
}

// ============================================
// POINTERLOCK CONTROLS
// ============================================
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('crosshair').style.display = 'block';

    controls.lock();
    canMove = true;
    gameState.isGameRunning = true;
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        canMove = true;
    } else {
        canMove = false;
    }
});

document.getElementById('closeTerminal').addEventListener('click', closeTerminal);

// ============================================
// RANDOM EVENTS
// ============================================
let eventTimer = 0;

function updateRandomEvents() {
    eventTimer++;

    if (eventTimer > 300) {
        eventTimer = 0;
        const randomEvent = Math.random();

        if (randomEvent < 0.3) {
            renderer.domElement.style.filter = 'hue-rotate(200deg)';
            setTimeout(() => {
                renderer.domElement.style.filter = 'hue-rotate(0deg)';
            }, 100);
        }
    }
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);

    updateMovement();
    updateLights();
    updateRandomEvents();

    renderer.render(scene, camera);
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    buildLevel1();
    
    // Add reactor core at end of hallway
    const reactor = createReactorCore(0, 1.5, -75);
    interactiveObjects.push({
        mesh: reactor,
        type: 'reactor',
        action: () => triggerEnding()
    });
    
    animate();

    setTimeout(() => {
        showTerminalMessage(`WELCOME TO PROJECT ASCENSION\n\nYour mission: Reach the reactor core.\nYour objective: Find the keycard.\nYour fate: Predetermined.\n\nGood luck, Explorer ${gameState.explorerID}.`);
    }, 500);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
init();
