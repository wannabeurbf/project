var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);
 
var player;
let cursors;
let bullets;

let enemies = [];
let score = 0; // ตัวแปรเก็บคะแนน
let scoreText; // ตัวแปรแสดงคะแนน
let health = 100; // เริ่มต้นพลังชีวิตที่ 100
let healthBar; // ตัวแปรสำหรับเก็บ health bar

function preload() {
   // โหลดภาพปุ่ม Restart
   this.load.image('restartButtonImage', 'assets/restart/restartButton.png');  
   console.log('Image loaded: restartButtonImage');
    // ---------- Load Character image Start ----------
    this.load.spritesheet('idle', '/assets/image/character/idle.png', { 
        frameWidth: 256, 
        frameHeight: 272    
    });
    this.load.spritesheet('floating', '/assets/image/character/floating.png', {
        frameWidth: 256,
        frameHeight: 272
    });

    this.load.image('bullet', '/assets/image/character/bullet.png' )
    // ---------- Load Character image End ----------

    // ---------- Load Enemy image Start ----------
    // slime image ----------
    this.load.spritesheet('slimehunt', '/assets/image/enemies/slime/slimehunt.png', {
        frameWidth: 44,
        frameHeight: 30
    });
    this.load.spritesheet('slimedie', '/assets/image/enemies/slime/slimedie.png', {
        frameWidth: 44,
        frameHeight: 30
    });

    // bat image ----------
    this.load.spritesheet('bathunt', '/assets/image/enemies/bat/bathunt.png', {
        frameWidth: 46,
        frameHeight: 30
    });
    this.load.spritesheet('batdie', '/assets/image/enemies/bat/batdie.png', {
        frameWidth: 46,
        frameHeight: 30
    });

    // mushroom image ----------
    this.load.spritesheet('mushhunt', '/assets/image/enemies/mushroom/mushRun.png', {
        frameWidth: 80,
        frameHeight: 40
    }); 
    this.load.spritesheet('mushdie', '/assets/image/enemies/mushroom/mushDie.png', {
        frameWidth: 80,
        frameHeight: 40
    });
    // ---------- Load Enemy image End ----------
}

function create() {
    // ---------- Charactor Start ----------
    player = this.physics.add.sprite(300, 200, 'idle');
    // this.cameras.main.startFollow(player);
    player.setScale(0.6);
   
    // สร้างกราฟิกสำหรับหลอดเลือด
    healthBar = this.add.graphics();
    updateHealthBar(this); // เรียกฟังก์ชันแสดง Health Bar


    // การตั้งค่าการเคลื่อนที่และการควบคุม (เช่น cursors, การยิงกระสุน)
       cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // ---------- Player Animation Start ----------
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'side',
        frames: this.anims.generateFrameNumbers('floating', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    // ---------- Player Animation End ----------

    // ---------- Player Control ----------
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    bullets = this.physics.add.group();

    // Shoot when the mouse is clicked
    // this.input.on('pointerdown', function (pointer) {
    //     shootBullet(this, pointer);
    // });

    this.time.addEvent({
        delay: 500, // ระยะเวลาการยิงกระสุน
        callback: () => {
            shootBullet(this);
        },
        callbackScope: this,
        loop: true 
    });
     // ---------- Score ----------
       scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff'
    });
    scoreText.setScrollFactor(0);
    // ---------- Charactor End ----------
    
    // ---------- Enemy Animation Start ----------
    // Slime Animation Start ----------
    this.anims.create({
        key: 'slime',
        frames: this.anims.generateFrameNumbers('slimehunt', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'die_slime',
        frames: this.anims.generateFrameNumbers('slimedie', { start: 0, end: 4}),
        frameRate: 5,
        repeat: 0
    });
    // Slime Animation End ----------

    // Bat Animation Start ----------
    this.anims.create({
        key: 'bat',
        frames: this.anims.generateFrameNumbers('bathunt', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'die_bat',
        frames: this.anims.generateFrameNumbers('batdie', { start: 0, end: 4}),
        frameRate: 5,
        repeat: 0
    });
    // Bat Animation End ----------

    // Mushroom Animaton Start ----------
    this.anims.create({
        key: 'mushroom',
        frames: this.anims.generateFrameNumbers('mushhunt', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'die_mushroom',
        frames: this.anims.generateFrameNumbers('mushdie', { start: 0, end: 7 }),
        frameRate: 5,
        repeat: 0
    });
    // Mushroom Animation End ----------

    this.time.addEvent({ 
        delay: 2000,
        callback: createEnemy,
        callbackScope: this,
        loop: true
    });
    // ---------- Enemy Animation End ----------
}

function update() {
    updateHealthBar(this); // อัพเดต Health Bar ในทุกการอัปเดต
    // ตรวจสอบพิกัด X และ Y ของกระสุนว่าหลุดขอบจอหรือไม่
    bullets.children.each(bullet => {
        if (bullet.x < 0 || bullet.x > this.scale.width || bullet.y < 0 || bullet.y > this.scale.height) {
            console.log(':: Destroy bullet ::')            
            bullet.destroy();
        }
    });

    //เป็นการใช้ ฟังก์ชัน overlap ใน Phaser.js ซึ่งจะช่วยให้สามารถตรวจสอบ การชนกัน (หรือการทับซ้อน) ระหว่างสองกลุ่มวัตถุ เช่น กระสุน และ ศัตรู
    this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
        console.log("Enemy hit!");
        bullet.destroy(); 
        enemy.destroy();
        // เพิ่มคะแนนเมื่อทำลายศัตรู
        score += 10; 
        scoreText.setText('Score: ' + score); // อัพเดตคะแนนที่แสดง
        enemies = enemies.filter(e => e !== enemy); 

        //ลบศัตรูที่ระบุออกจากอาร์เรย์ enemies
        //.filter() จะสร้างอาร์เรย์ใหม่ที่ประกอบด้วยเฉพาะค่า (e) ที่ทำให้เงื่อนไขเป็น true
        //เงื่อนไขที่ใช้คือ e !== enemy หมายความว่าเราต้องการเก็บเฉพาะศัตรูที่ ไม่ใช่ ตัวที่กำลังจะลบออก
        enemies = enemies.filter(e => e !== enemy); 

    });

    playerControl();
    updateEnemies();
}   

// ---------- Function Start ----------

function playerControl() {
    let moving = false;
    player.setVelocity(0);
    player.flipX = false;

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.flipX = true; 
        moving = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.flipX = false;
        moving = true;
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
        moving = true;
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
        moving = true;
    }

    if (moving) {
        if (cursors.up.isDown) {
            player.anims.play("side", true);
        } else if (cursors.down.isDown) {
            player.anims.play("side", true);
        } else {
            player.anims.play("side", true); 
        }
    } else {
        player.anims.play("idle", true);
    }

    // เช็คว่า player ออกจากจอไปรึยัง
    if(player.y < 0 + (player.getBounds().height / 2)) {
        player.y = player.getBounds().height / 2;
    } else if ( player.y > config.height - (player.getBounds().height / 2)) {
        player.y = config.height - (player.getBounds().height / 2);
    } 
    
    if (player.x < 0 + (player.getBounds().width / 2)) {
        player.x = player.getBounds().width / 2;
    } else if (player.x > config.width  - (player.getBounds().width / 2)){
        player.x = config.width  - (player.getBounds().width / 2);
    }
}

function shootBullet(scene) {
    let bulletSpeed = 500;

    let mouseX = scene.input.mousePointer.x;
    let mouseY = scene.input.mousePointer.y;

    let dx = mouseX - player.x;
    let dy = mouseY - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; 
    //คำสั่งที่ใช้ในการ ตรวจสอบว่าอาร์เรย์ enemies ว่างหรือไม่ หรือก็คือตรวจสอบความยาวของอาร์เรย์ (จำนวนสมาชิกในอาร์เรย์) ว่ามีค่าเป็น 0 รึป่าว
    //ถ้าจำนวนสมาชิกในอาร์เรย์เท่ากับ 0 (หมายถึงไม่มีศัตรูในเกมแล้ว) ฟังก์ชันจะ หยุดการทำงาน ด้วยคำสั่ง return

    let velocityX = (dx / distance) * bulletSpeed;
    let velocityY = (dy / distance) * bulletSpeed;

    let bullet = bullets.create(player.x, player.y, 'bullet');
    bullet.setOrigin(0.5, 0.5);
    bullet.setVelocity(velocityX, velocityY);
}

function createEnemy() {
    let enemyTypes = ['slime', 'bat', 'mushroom']; 
    let randomType = Phaser.Math.RND.pick(enemyTypes); 
    let x, y;

    //คำสั่งใน Phaser.js ที่ใช้ในการสุ่มค่า ระหว่าง 0 ถึง 3 (รวมทั้ง 0 และ 3) โดยใช้ฟังก์ชัน Phaser.Math.Between(min, max) ซึ่งจะสุ่มค่าในช่วงที่กำหนด
    let side = Phaser.Math.Between(0, 3);
    if (side === 0) { 
        x = 0; 
        y = Phaser.Math.Between(0, game.config.height); 
    } else if (side === 1) { 
        x = game.config.width; 
        y = Phaser.Math.Between(0, game.config.height); 
    } else if (side === 2) { 
        x = Phaser.Math.Between(0, game.config.width); 
        y = 0; 
    } else { 
        x = Phaser.Math.Between(0, game.config.width); 
        y = game.config.height; 
    }    

    let enemy = this.physics.add.sprite(x, y, randomType);

    // กำหนดขนาดของศัตรู
    if (randomType === 'slime') {
        enemy.setScale(1.5);
    } else {
        enemy.setScale(2);
    }

    //เป็นคำสั่งใน Phaser.js ที่ใช้ในการสุ่มค่าความเร็วของศัตรู (หรือวัตถุอื่นๆ) โดยกำหนดให้ค่าความเร็วเป็นตัวเลข ทศนิยม ระหว่าง 0.5 ถึง 1.2 
    //ซึ่งใช้ฟังก์ชัน Phaser.Math.FloatBetween(min, max) ในการสุ่มค่าทศนิยม
    enemy.speed = Phaser.Math.FloatBetween(0.5, 1.2); 
    enemy.play(randomType);
    //เป็นคำสั่งใน Phaser.js ที่ใช้ในการตรวจสอบการชนกัน (overlap) ระหว่าง ผู้เล่น และ ศัตรู แล้วเรียกใช้ฟังก์ชันเมื่อการชนเกิดขึ้น
    this.physics.add.overlap(player, enemy, hitPlayer, null, this); 

    enemies.push(enemy);
}

function updateEnemies() {
    enemies
        //filter() ซึ่งเป็นฟังก์ชันของ JavaScript Array ที่ใช้กรองข้อมูล (หรือกรองอ็อบเจ็กต์) ในอาร์เรย์ 
        //โดยเลือกเฉพาะข้อมูลที่ตรงกับเงื่อนไขที่กำหนดไว้ในฟังก์ชันที่ใช้เป็นพารามิเตอร์
        .filter(enemy => enemy.active) //กรอง ศัตรูที่มีคุณสมบัติ active เป็น true โดยจะ เก็บเฉพาะศัตรูที่ยัง "อยู่" หรือ "ทำงาน" ในเกมเท่านั้น
        .forEach((enemy) => { 
            let dx = player.x - enemy.x;
            let dy = player.y - enemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                enemy.setVelocity((dx / distance) * enemy.speed * 100, (dy / distance) * enemy.speed * 100);
            }

            //เป็นคำสั่งที่ใช้ในการพลิกทิศทางของ ศัตรู บนแกน X โดยขึ้นอยู่กับค่าของตัวแปร dx ซึ่งจะบ่งบอกถึงทิศทางระหว่างศัตรูและผู้เล่นในเกม
            enemy.flipX = dx > 0;
        });
}
///////////////////////////////////
function hitPlayer(player, enemy) {
    console.log("Player Hit!");
    enemy.destroy();
}

function updateHealthBar() {
    // ทำให้หลอดเลือดมีความยาวตามพลังชีวิต
    healthBar.clear();
    healthBar.fillStyle(0x00ff00, 1);  // สีเขียว (แสดงพลังชีวิต)
    healthBar.fillRect(10, 10, health * 2, 20);  // ขนาดของหลอดเลือด (ความยาว = health * 2)
}

function hitPlayer(player, enemy) {
    console.log("Player Hit!");
    health -= 10;  // ลดพลังชีวิตเมื่อถูกศัตรูโจมตี
    updateHealthBar(this);  // อัพเดต Health Bar

    if (health <= 0) {
        health = 0;
        console.log("Game Over");
        this.scene.pause();  // หยุดเกม

        // แสดงข้อความ Game Over
        let gameOverText = this.add.text(game.config.width / 2, game.config.height / 2 - 50, 'Game Over', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // สร้างปุ่ม Restart หลังจาก Game Over
        let restartButton = this.add.text(game.config.width / 2, game.config.height / 2 + 50, 'Click to Restart', {
            fontSize: '32px',
            fill: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        // เมื่อคลิกปุ่ม Restart ให้เริ่มเกมใหม่
        restartButton.on('pointerdown', () => {
            restartGame(this);  // เรียกฟังก์ชันรีสตาร์ท
        });

        // เปลี่ยนสีของปุ่มเมื่อ hover
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ fill: '#ff0000' });  // สีแดงเมื่อ hover
        });
        restartButton.on('pointerout', () => {
            restartButton.setStyle({ fill: '#00ff00' });  // กลับเป็นสีเขียวเมื่อออกจาก hover
        });
    }

    // ลบศัตรูออกจากเกม
    enemy.destroy();
}

function restartGame(scene) {
    // รีเซ็ตพลังชีวิตกลับไปที่ค่าเริ่มต้น
    health = 100;
    updateHealthBar(scene);

    // รีเซ็ตคะแนนและลบข้อความคะแนน
    score = 0;
    scoreText.setText('Score: 0');

    // ลบศัตรูออกจากเกม
    enemies.forEach(enemy => enemy.destroy());
    enemies = [];

    // รีเซ็ตตำแหน่งของผู้เล่นและการเล่นแอนิเมชัน
    player.setPosition(300, 200);
    player.anims.play('idle', true);

    // รีสตาร์ทฉากใหม่
    scene.scene.restart();
}



function updateHealthBar(scene) {
    healthBar.clear();
    healthBar.fillStyle(0x00ff00, 1);  // สีเขียว (แสดงพลังชีวิต)
    healthBar.fillRect(10, scene.game.config.height - 30, health * 2, 20);  // ย้าย Health Bar ไปที่ส่วนล่างของหน้าจอ
}


let restartButton = this.add.image(game.config.width / 2, game.config.height / 2 + 50, 'assets/restart/restartButton.png')
    .setOrigin(0.5)
    .setInteractive();

restartButton.on('pointerdown', () => {
    restartGame(this);
});

restartButton.on('pointerover', () => {
    restartButton.setTint(0xff0000);  // ให้เปลี่ยนสีเป็นแดงเมื่อ hover
});

restartButton.on('pointerout', () => {
    restartButton.clearTint();  // เคลียร์สีเมื่อออกจากการ hover
});
