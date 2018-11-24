class dungeonScene extends Phaser.Scene {

    constructor() {
        super({key: 'dungeon'});
    }

    preload() {
        // TODO: replace background
        // load background image for profile overview
        this.load.image('backgroundDungeon', '../assets/background/dungeon_mockup.png');
    }

    create() {
        // save new current scene in saveObject
        saveObject.profiles[saveObject.currentProfile].scene = 'dungeon';
        if(typeof saveObject.profiles[saveObject.currentProfile].room == 'undefined'){
            saveObject.profiles[saveObject.currentProfile].room = {};
        }
        saveData();

        // add button to navigate to config
        this.addBackground();

        // add button to exit the shop
        this.addNavigationExit(this.sys.game.config.width * 0.1, this.sys.game.config.height * 0.5);

        // add button to exit the shop
        this.addNavigationAction(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.3);

        // add button to exit the shop
        this.addNavigationNextRoom(this.sys.game.config.width * 0.9, this.sys.game.config.height * 0.5);

        // add button to exit the shop
        this.addNavigationInventory(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.9);

        // add character to the left center of the screen
        this.addCharacter(this.sys.game.config.width * 0.25, this.sys.game.config.height * 0.62);

        // TODO: replace with randomized chance of encounter
        this.spawnEnemy();
        if(typeof saveObject.profiles[saveObject.currentProfile].room.enemy != 'undefined') {
            // add character to the left center of the screen
            this.addEnemy(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.62);
        }
    }

    addBackground() {
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundDungeon');
        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
    }

    addNavigationExit(x, y) {
        // add navigation button to return to profile overview and register corresponding function
        new Button('buttonExit', ['gameicons', 'exitLeft.png'], x, y, this);
        this.buttonExit.on('pointerup', this.goTo, [this, 'exit']);
        this.buttonExit.setTint(0x6666aa);
    }

    loadProfileOverviewScene() {
        // hide current scene and start config scene
        this.parent.scene.scene.sleep();
        this.parent.scene.scene.start('profileOverview');
    }

    addNavigationAction(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonAction', ['gameicons_exp', 'fightFist.png'], x, y, this);
        this.buttonAction.on('pointerup', this.performAction, this);
        this.buttonAction.setTint(0xcc0000);
    }

    performAction() {
        // TODO: add actions based on current room contents
        // check if living enemy, closed chest or armed trap is present
        if (this.isEnemyAlive()) {
            // let player and enemy both attack
            this.attackPlayer();
            this.attackEnemy();
        }else if(this.isChestClosed()) {
        }else if(this.isTrapArmed()) {
        }
    }

    addNavigationNextRoom(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonNextRoom', ['gameicons', 'arrowRight.png'], x, y, this);
        this.buttonNextRoom.on('pointerup', this.goToCenter, [this, 'center']);
        this.buttonNextRoom.setTint(0x009966);
    }

    goTo() {
        let destination = this[1];

        // stop animation complete listener
        this[0].character.off('animationcomplete');

        // stop character from moving when entering the scene
        this[0].characterEnterTween.stop();

        // stop character from moving when already moving to a side
        if (this[0].characterMovingTween != undefined) {
            this[0].characterMovingTween.stop();
        }

        // flip character to face the correct direction
        if (destination == 'exit') {
            this[0].character.setScale(-1, 1);
        } else {
            this[0].character.setScale(1, 1);
        }

        // play running animation if not already playing
        this[0].character.anims.play('characterRun', true);

        // set destination to be 100px outside of the screen (to make the character run off the screen)
        let destinationX = destination == 'exit' ? -100 : destination == 'center' ? this[0].sys.game.config.width / 2 : this[0].sys.game.config.width + 100;

        // move character to destination
        this[0].characterMovingTween = this[0].tweens.add({
            targets: [this[0].character],
            x: destinationX,
            duration: (destinationX - this[0].character.x) * 5 * this[0].character.scaleX,
            onComplete: destination == 'exit' ? this[0].loadProfileOverviewScene : destination == 'center' ? this[0].goToNextRoom : this[0].leaveRoom
        });
    }

    goToCenter() {
        // check if player is on the left of the center of the room
        if(this[0].character.x < this[0].sys.game.config.width / 2) {
            // move player to center
            this[0].goTo.call(this);
        }
    }

    goToNextRoom() {
        // go to the center of the room
        if (this.parent.scene.isEnemyAlive()) {
            this.parent.scene.attackEnemy();
        }
        this.parent.scene.goTo.call([this.parent.scene, 'nextRoom']);
    }

    leaveRoom() {
        // unset current room
        saveObject.profiles[saveObject.currentProfile].room = undefined;

        // open next room
        this.parent.scene.scene.start('dungeon');
    }

    addNavigationInventory(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonInventory', ['gameicons', 'video.png'], x, y, this);
        this.buttonInventory.on('pointerup', this.openInventory, this);
        this.buttonInventory.setTint(0xeeaa00);
    }

    openInventory() {
        // TODO: add inventory sliding up and displaying inventory items to be equippable (add X to close)
    }

    addCharacter(x, y) {
        // add character outside of view
        this.character = this.add.sprite(-100, y, 'character');
        this.character.setOrigin(0.5, 1);

        // load animations if not done already
        addCharacterAnimations('character');

        // set character animation as running
        this.character.anims.play('characterRun');

        // have the sword drawn during the entire run
        this.character.swordDrawn = true;

        // add moving motion to the center of the screen and switch to idle animation after arrival
        this.characterEnterTween = this.tweens.add({
            targets: [this.character],
            x: x,
            duration: (x - this.character.x) * 5,
            onComplete: this.characterIdle,
        });
    }

    addEnemy(x, y) {
        // add character outside of view
        this.enemy = this.add.sprite(x, y, saveObject.profiles[saveObject.currentProfile].room.enemy.type);
        this.enemy.setOrigin(0.5, 1);
        this.enemy.setScale(saveObject.profiles[saveObject.currentProfile].room.enemy.image.scale);

        // load animations if not done already
        addCharacterAnimations(saveObject.profiles[saveObject.currentProfile].room.enemy.type);

        // start enemy in idle animation
        this.enemyIdle();
    }

    characterIdle() {
        let that;
        if(this.constructor.name == 'Tween') {
            that = this.parent.scene;
        }else {
            that = this;
        }
        // deactivate any event trigger when completing an animation as precaution
        that.character.off('animationcomplete');

        // start idle animation with sword
        that.character.anims.play('characterIdleWithSword');
    }

    enemyIdle() {
        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        if(this.isEnemyAlive()) {
            // set enemy to idle animation
            this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Idle');
        }else  {
            // set enemy to die animation
            this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Die');
        }
    }

    spawnChest() {
        let chest = {
            closed: true,
            content: {}
        };
        // TODO: generate and add item to chest
        saveObject.profiles[saveObject.currentProfile].room.chest = chest;
    }

    spawnEnemy() {
        // TODO: generate actual enemy
        let enemy = config.monster['slime'];
        saveObject.profiles[saveObject.currentProfile].room.enemy = enemy;
    }

    spawnTrap() {
        // TODO: generate actual trap
        let trap = {
            armed: true
        };
        saveObject.profiles[saveObject.currentProfile].room.trap = trap;
    }

    isEnemyAlive() {
        // check if any enemy exists at all
        if(typeof saveObject.profiles[saveObject.currentProfile].room.enemy == 'undefined') {
            return false;
        }else {
            // return true if enemy has more than 0 health (is still alive)
            return (saveObject.profiles[saveObject.currentProfile].room.enemy.health > 0);
        }
    }

    isChestClosed() {
        // check if any chest exists at all
        if(typeof saveObject.profiles[saveObject.currentProfile].room.chest == 'undefined') {
            return false;
        }else {
            // return true if chest is still closed
            return saveObject.profiles[saveObject.currentProfile].room.chest.closed;
        }
    }

    isTrapArmed() {
        // check if any trap exists at all
        if(typeof saveObject.profiles[saveObject.currentProfile].room.trap == 'undefined') {
            return false;
        }else {
            // return true if trap is still armed
            return saveObject.profiles[saveObject.currentProfile].room.trap.armed;
        }
    }

    attackPlayer() {
        // deactivate any event trigger when completing an animation as precaution
        this.character.off('animationcomplete');

        // start idle animation with sword
        this.character.anims.play('characterAttack' + Math.trunc(Math.random() * 3 + 1));

        this.enemyDamaged();

        // play idle animation after attack
        this.character.on('animationcomplete', this.characterIdle, this);
    }

    attackEnemy() {
        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        // start idle animation with sword
        this.enemy.anims.play('slimeAttack');

        this.playerDamaged();

        // play idle animation after attack
        this.enemy.on('animationcomplete', this.enemyIdle, this);
    }

    enemyDamaged() {
        // TODO: resolve damage
        console.log('enemy took ' + this.calculateDamage(saveObject.profiles[saveObject.currentProfile].character, this.enemy) + 'damage');
    }

    playerDamaged() {
        // TODO: resolve damage
        console.log('enemy took ' + this.calculateDamage(this.enemy, saveObject.profiles[saveObject.currentProfile].character) + 'damage');
    }

    calculateDamage(attacker, defender) {
        let attackerDamage = {};
        let defenderResistance = {};

        let equipmentTypes = {'weapon': true, 'offhand': true, 'armor': true, 'trinket': true};

        for(let equipmentType in equipmentTypes) {

            // collect all damage from current equipment type for attacker
            if (typeof attacker[equipmentType] != 'undefined') {
                for (let damage in config[equipmentType][getItem(attacker[equipmentType]).itemType].damage) {
                    attackerDamage[damage] += config[equipmentType][attacker[equipmentType]].damage[damage];
                }
            }

            // collect all resistances from currecnt equipment type for defender
            if (typeof defender[equipmentType] != 'undefined') {
                for (let resistance in config[equipmentType][defender[equipmentType]].resistances) {
                    defenderResistance[resistance] += config[equipmentType][getItem(defender[equipmentType]).itemType].resistance[resistance];
                }
            }
        }
        console.log(attackerDamage);
        console.log(defenderResistance);

        return 0;
    }
}