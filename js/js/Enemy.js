import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export default class Watcher {

```
constructor(scene, player) {

    this.scene = scene;
    this.player = player;

    this.state = "PATROL";

    this.health = 100;

    this.detectionRadius = 12;
    this.attackRadius = 1.8;

    this.chaseSpeed = 0.03;
    this.patrolSpeed = 0.01;

    this.attackCooldown = 0;

    this.lastTeleport = 0;

    this.patrolTarget =
        new THREE.Vector3(
            5,
            1,
            -5
        );

    this.createMesh();
}

createMesh() {

    const geometry =
        new THREE.BoxGeometry(
            1,
            2,
            1
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xaa0000,
            emissive: 0x220000
        });

    this.mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    this.mesh.position.set(
        8,
        1,
        -10
    );

    this.scene.add(
        this.mesh
    );
}

update() {

    if(!this.mesh) return;

    const distance =
        this.mesh.position.distanceTo(
            this.player.camera.position
        );

    if(
        distance <
        this.attackRadius
    ){

        this.state = "ATTACK";

    }
    else if(
        distance <
        this.detectionRadius
    ){

        this.state = "CHASE";

    }
    else{

        this.state = "PATROL";

    }

    switch(this.state){

        case "PATROL":
            this.patrol();
            break;

        case "CHASE":
            this.chase();
            break;

        case "ATTACK":
            this.attack();
            break;

    }

    this.horrorEffects();

    if(
        this.attackCooldown > 0
    ){

        this.attackCooldown--;
    }

}

patrol() {

    this.mesh.lookAt(
        this.patrolTarget
    );

    this.mesh.position.lerp(
        this.patrolTarget,
        this.patrolSpeed
    );

    const distance =
        this.mesh.position.distanceTo(
            this.patrolTarget
        );

    if(distance < 1){

        this.patrolTarget =
            new THREE.Vector3(

                (Math.random()-0.5)
                * 20,

                1,

                (Math.random()-0.5)
                * 20

            );
    }
}

chase() {

    const playerPos =
        this.player.camera.position;

    this.mesh.lookAt(
        playerPos
    );

    this.mesh.position.lerp(
        playerPos,
        this.chaseSpeed
    );
}

attack() {

    const playerPos =
        this.player.camera.position;

    this.mesh.lookAt(
        playerPos
    );

    if(
        this.attackCooldown <= 0
    ){

        this.player.takeDamage(
            10
        );

        this.attackCooldown =
            120;
    }

}

horrorEffects() {

    const now =
        performance.now();

    const playerPos =
        this.player.camera.position;

    const distance =
        this.mesh.position.distanceTo(
            playerPos
        );

    if(
        distance > 15 &&
        now - this.lastTeleport > 15000
    ){

        const offsetX =
            (Math.random()-0.5)
            * 6;

        const offsetZ =
            (Math.random()-0.5)
            * 6;

        this.mesh.position.set(

            playerPos.x + offsetX,

            1,

            playerPos.z - 8 + offsetZ

        );

        this.lastTeleport =
            now;
    }

}

takeDamage(amount){

    this.health -= amount;

    if(
        this.health <= 0
    ){

        this.die();
    }

}

die(){

    this.scene.remove(
        this.mesh
    );

    this.mesh = null;
}
```

}
