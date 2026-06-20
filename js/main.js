import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// =====================
// Scene Setup
// =====================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({
antialias: true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

document.body.appendChild(
renderer.domElement
);

// =====================
// Lights
// =====================

const ambientLight =
new THREE.AmbientLight(
0xffffff,
0.35
);

scene.add(ambientLight);

const pointLight =
new THREE.PointLight(
0xffffff,
15,
50
);

pointLight.position.set(
0,
8,
0
);

scene.add(pointLight);

// =====================
// Floor
// =====================

const floor =
new THREE.Mesh(

```
    new THREE.PlaneGeometry(
        60,
        60
    ),

    new THREE.MeshStandardMaterial({
        color: 0x333333
    })

);
```

floor.rotation.x =
-Math.PI / 2;

scene.add(floor);

// =====================
// Walls
// =====================

function createWall(
x,
y,
z,
w,
h,
d
) {

```
const wall =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            w,
            h,
            d
        ),

        new THREE.MeshStandardMaterial({
            color: 0x777777
        })

    );

wall.position.set(
    x,
    y,
    z
);

scene.add(wall);
```

}

createWall(0, 2, -20, 40, 4, 1);
createWall(-20, 2, 0, 1, 4, 40);
createWall(20, 2, 0, 1, 4, 40);

// =====================
// Terminal
// =====================

const terminal =
new THREE.Mesh(

```
    new THREE.BoxGeometry(
        1,
        2,
        1
    ),

    new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00aa00
    })

);
```

terminal.position.set(
0,
1,
-8
);

scene.add(terminal);

// =====================
// Exit Door
// =====================

const exitDoor =
new THREE.Mesh(

```
    new THREE.BoxGeometry(
        3,
        4,
        0.5
    ),

    new THREE.MeshStandardMaterial({
        color: 0x4444ff
    })

);
```

exitDoor.position.set(
0,
2,
-18
);

scene.add(exitDoor);

// =====================
// Movement
// =====================

const keys = {};

document.addEventListener(
"keydown",
(e) => {
keys[e.key.toLowerCase()] = true;
}
);

document.addEventListener(
"keyup",
(e) => {
keys[e.key.toLowerCase()] = false;
}
);

function updateMovement() {

```
const speed = 0.1;

if(keys["w"])
    camera.position.z -= speed;

if(keys["s"])
    camera.position.z += speed;

if(keys["a"])
    camera.position.x -= speed;

if(keys["d"])
    camera.position.x += speed;
```

}

// =====================
// Terminal Interaction
// =====================

const terminalWindow =
document.getElementById(
"terminalWindow"
);

const terminalContent =
document.getElementById(
"terminalContent"
);

const interactionPrompt =
document.getElementById(
"interactionPrompt"
);

document
.getElementById("closeTerminal")
.addEventListener(
"click",
() => {

```
    terminalWindow.style.display =
        "none";

}
```

);

document.addEventListener(
"keydown",
(e) => {

```
    if(
        e.key.toLowerCase() === "e"
    ){

        const distance =
            camera.position.distanceTo(
                terminal.position
            );

        if(distance < 3){

            terminalWindow.style.display =
                "block";

            terminalContent.innerHTML =
```

`LOG 071

Subject requests termination.

Request denied.

Project Ascension
remains operational.

Welcome to
Project Ascension.`;

```
        }

    }

}
```

);

// =====================
// Start Button
// =====================

document
.getElementById("startButton")
.addEventListener(
"click",
() => {

```
    document
    .getElementById(
        "loadingScreen"
    )
    .style.display = "none";

}
```

);

// =====================
// Exit Detection
// =====================

function checkVictory(){

```
const distance =
    camera.position.distanceTo(
        exitDoor.position
    );

if(distance < 2){

    document
    .getElementById(
        "victoryScreen"
    )
    .style.display = "flex";

}
```

}

// =====================
// Interaction Prompt
// =====================

function updatePrompt(){

```
const distance =
    camera.position.distanceTo(
        terminal.position
    );

if(distance < 3){

    interactionPrompt.style.display =
        "block";

}
else{

    interactionPrompt.style.display =
        "none";

}
```

}

// =====================
// Resize
// =====================

window.addEventListener(
"resize",
() => {

```
    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

}
```

);

// =====================
// Game Loop
// =====================

function animate(){

```
requestAnimationFrame(
    animate
);

updateMovement();

updatePrompt();

checkVictory();

renderer.render(
    scene,
    camera
);
```

}

animate();
