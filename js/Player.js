export default class Player {

```
constructor(camera) {

    this.camera = camera;

    this.health = 100;
    this.maxHealth = 100;

    this.stamina = 100;
    this.maxStamina = 100;

    this.walkSpeed = 0.08;
    this.sprintSpeed = 0.16;

    this.mouseSensitivity = 0.002;

    this.keys = {};

    this.pitch = 0;
    this.yaw = 0;

    this.isDead = false;

    this.setupControls();
}

setupControls() {

    document.addEventListener(
        "keydown",
        (e) => {
            this.keys[e.key.toLowerCase()] = true;
        }
    );

    document.addEventListener(
        "keyup",
        (e) => {
            this.keys[e.key.toLowerCase()] = false;
        }
    );

    document.addEventListener(
        "click",
        () => {
            document.body.requestPointerLock();
        }
    );

    document.addEventListener(
        "mousemove",
        (e) => {

            if (
                document.pointerLockElement !==
                document.body
            ) return;

            this.yaw -=
                e.movementX *
                this.mouseSensitivity;

            this.pitch -=
                e.movementY *
                this.mouseSensitivity;

            const limit =
                Math.PI / 2 - 0.1;

            this.pitch =
                Math.max(
                    -limit,
                    Math.min(
                        limit,
                        this.pitch
                    )
                );

        }
    );
}

update() {

    if(this.isDead) return;

    let speed =
        this.walkSpeed;

    const sprinting =
        this.keys["shift"] &&
        this.stamina > 0;

    if(sprinting){

        speed =
            this.sprintSpeed;

        this.stamina -= 0.5;

    }
    else{

        this.stamina += 0.25;

    }

    this.stamina =
        Math.max(
            0,
            Math.min(
                this.maxStamina,
                this.stamina
            )
        );

    const forwardX =
        Math.sin(this.yaw);

    const forwardZ =
        Math.cos(this.yaw);

    const rightX =
        Math.sin(
            this.yaw + Math.PI / 2
        );

    const rightZ =
        Math.cos(
            this.yaw + Math.PI / 2
        );

    if(this.keys["w"]){

        this.camera.position.x +=
            forwardX * speed;

        this.camera.position.z -=
            forwardZ * speed;
    }

    if(this.keys["s"]){

        this.camera.position.x -=
            forwardX * speed;

        this.camera.position.z +=
            forwardZ * speed;
    }

    if(this.keys["a"]){

        this.camera.position.x -=
            rightX * speed;

        this.camera.position.z +=
            rightZ * speed;
    }

    if(this.keys["d"]){

        this.camera.position.x +=
            rightX * speed;

        this.camera.position.z -=
            rightZ * speed;
    }

    this.camera.rotation.order =
        "YXZ";

    this.camera.rotation.y =
        this.yaw;

    this.camera.rotation.x =
        this.pitch;
}

takeDamage(amount) {

    if(this.isDead) return;

    this.health -= amount;

    if(this.health <= 0){

        this.health = 0;

        this.die();
    }

    this.updateHUD();
}

heal(amount){

    this.health += amount;

    if(
        this.health >
        this.maxHealth
    ){

        this.health =
            this.maxHealth;
    }

    this.updateHUD();
}

updateHUD(){

    const healthText =
        document.getElementById(
            "healthValue"
        );

    if(healthText){

        healthText.textContent =
            Math.floor(
                this.health
            );
    }

}

die(){

    this.isDead = true;

    const gameOver =
        document.getElementById(
            "gameOverScreen"
        );

    if(gameOver){

        gameOver.style.display =
            "flex";
    }

}
```

}
