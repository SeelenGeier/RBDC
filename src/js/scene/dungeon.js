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
        if(typeof saveObject.profiles[saveObject.currentProfile].room === 'undefined'){
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

        // add random encounter to room
        if(Math.random() < config.default.setting.enemySpawnChance) {
            this.spawnEnemy();
        }else if(Math.random() < config.default.setting.enemySpawnChance + config.default.setting.chestSpawnChance) {
            this.spawnChest();
        }

        // add traps in a few rooms
        if(Math.random() < config.default.setting.trapSpawnChance) {
            this.spawnTrap();
        }

        // set enemy to idle per default
        this.enemyIsIdle = true;
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
        // unset current room
        saveObject.profiles[saveObject.currentProfile].room = undefined;

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
        if(this.characterIsIdle && this.enemyIsIdle) {
            if (this.isEnemyAlive()) {
                // let player and enemy both attack
                this.attackPlayer();
                this.attackEnemy();
            }else if(this.isChestClosed()) {
                this.openChest();
            }else if(this.isTrapArmed()) {
                console.log('armed trap present')
            }
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

        // set character to not being idle
        this[0].characterIsIdle = false;

        // stop animation complete listener
        this[0].character.off('animationcomplete');

        // stop character from moving when entering the scene
        this[0].characterEnterTween.stop();

        // stop character from moving when already moving to a side
        if (this[0].characterMovingTween != undefined) {
            this[0].characterMovingTween.stop();
        }

        // flip character to face the correct direction
        if (destination === 'exit') {
            this[0].character.setScale(-1, 1);
        } else {
            this[0].character.setScale(1, 1);
        }

        // play running animation if not already playing
        this[0].character.anims.play('characterRun', true);

        // set destination to be 100px outside of the screen (to make the character run off the screen)
        let destinationX = destination === 'exit' ? -100 : destination === 'center' ? this[0].sys.game.config.width / 2 : this[0].sys.game.config.width + 100;

        // move character to destination
        this[0].characterMovingTween = this[0].tweens.add({
            targets: [this[0].character],
            x: destinationX,
            duration: (destinationX - this[0].character.x) * 5 * this[0].character.scaleX,
            onComplete: destination === 'exit' ? this[0].loadProfileOverviewScene : destination === 'center' ? this[0].goToNextRoom : this[0].leaveRoom
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

        // add a room to the cleared counter
        saveObject.profiles[saveObject.currentProfile].roomsCleared++;

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
        // add enemy sprite
        this.enemy = this.add.sprite(x, y, saveObject.profiles[saveObject.currentProfile].room.enemy.type);
        this.enemy.setOrigin(0.5, 1);
        this.enemy.setScale(saveObject.profiles[saveObject.currentProfile].room.enemy.image.scale);

        // load animations if not done already
        addCharacterAnimations(saveObject.profiles[saveObject.currentProfile].room.enemy.type);

        // start enemy in idle animation
        this.enemyIdle();
    }

    addChest(x, y) {
        // add character outside of view
        this.chest = this.add.sprite(x, y, 'chestClosed');
        this.chest.setOrigin(0.5, 1);
    }

    openChest() {
        // check if player inventory is already full
        if(Object.keys(saveObject.profiles[saveObject.currentProfile].inventory.items).length >= config.default.status.inventorySize) {
            // show 'Inventory full' message
            new Dialog('Inventory full!', 'You can not have more than\n' + config.default.status.inventorySize + ' items.', this.scene);
        }else {
            // open chest
            this.chest.setTexture('chestOpen');
            saveObject.profiles[saveObject.currentProfile].room.chest.closed = false;

            // TODO: give correct item to player
            giveItem('weapon', 'knife', 111);
        }
    }

    characterIdle() {
        let that;

        // make sure the correct context is used
        if(this.constructor.name === 'Tween') {
            that = this.parent.scene;
        }else {
            that = this;
        }
        // deactivate any event trigger when completing an animation as precaution
        that.character.off('animationcomplete');

        // start idle animation with sword
        that.character.anims.play('characterIdleWithSword');

        // set character to being idle
        that.characterIsIdle = true;
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

        // set enemy to being idle
        this.enemyIsIdle = true;
    }

    spawnChest() {
        let chest = {
            closed: true,
            content: {}
        };

        // TODO: generate and add item to chest
        saveObject.profiles[saveObject.currentProfile].room.chest = chest;

        // add character to the left center of the screen
        this.addChest(this.sys.game.config.width * 0.50, this.sys.game.config.height * 0.62);
    }

    spawnEnemy() {
        // pick random monster
        let enemyStats = config.monster[Object.keys(config.monster)[Math.floor(Math.random()*Object.keys(config.monster).length)]];
        let enemy = JSON.parse(JSON.stringify(enemyStats));
        saveObject.profiles[saveObject.currentProfile].room.enemy = enemy;

        // add character to the left center of the screen
        this.addEnemy(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.62);
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
        if(typeof saveObject.profiles[saveObject.currentProfile].room.enemy === 'undefined') {
            return false;
        }else {
            // return true if enemy has more than 0 health (is still alive)
            return (saveObject.profiles[saveObject.currentProfile].room.enemy.health > 0);
        }
    }

    isChestClosed() {
        // check if any chest exists at all
        if(typeof saveObject.profiles[saveObject.currentProfile].room.chest === 'undefined') {
            return false;
        }else {
            // return true if chest is still closed
            return saveObject.profiles[saveObject.currentProfile].room.chest.closed;
        }
    }

    isTrapArmed() {
        // check if any trap exists at all
        if(typeof saveObject.profiles[saveObject.currentProfile].room.trap === 'undefined') {
            return false;
        }else {
            // return true if trap is still armed
            return saveObject.profiles[saveObject.currentProfile].room.trap.armed;
        }
    }

    attackPlayer() {
        // set enemy to be not idle
        this.characterIsIdle = false;

        // deactivate any event trigger when completing an animation as precaution
        this.character.off('animationcomplete');

        // start idle animation with sword
        this.character.anims.play('characterAttack' + Math.trunc(Math.random() * 3 + 1));

        this.enemyDamaged();

        // play idle animation after attack
        this.character.on('animationcomplete', this.characterIdle, this);
    }

    attackEnemy() {
        // set enemy to be not idle
        this.enemyIsIdle = false;

        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        // start idle animation with sword
        this.enemy.anims.play('slimeAttack');

        this.playerDamaged();

        // play idle animation after attack
        this.enemy.on('animationcomplete', this.enemyIdle, this);
    }

    enemyDie() {
        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        // start idle animation with sword
        this.enemy.anims.play('slimeDie');

        // spawn chest with fixed chance
        if(Math.random() < 0.01 * saveObject.profiles[saveObject.currentProfile].roomsCleared) {
            this.spawnChest();
        }
    }

    enemyDamaged() {
        // calculate damage based on weapon and defense
        let damage = this.calculateDamage(saveObject.profiles[saveObject.currentProfile].character, this.enemy);

        // subtract damage from enemy health
        saveObject.profiles[saveObject.currentProfile].room.enemy.health -= damage;

        // spawn damage number on top of enemy
        let damageNumber = this.add.text(this.enemy.x, this.enemy.y - this.enemy.height - 20, damage, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 32,
            color: '#FF3333'
        });

        // add up motion to damage number
        this.tweens.add({
            targets: [damageNumber],
            y: damageNumber.y - 100,
            alpha: 0,
            duration: 600,
            onComplete: damageNumber.destroy,
        });

        // process death if enemy lost all his health
        if(saveObject.profiles[saveObject.currentProfile].room.enemy.health <= 0) {
            this.enemyDie();
        }
    }

    playerDamaged() {
        // calculate damage based on weapon and defense
        let damage = this.calculateDamage(this.enemy, saveObject.profiles[saveObject.currentProfile].character);

        // subtract damage from enemy health
        saveObject.profiles[saveObject.currentProfile].character.health -= damage;

        // spawn damage number on top of enemy
        let damageNumber = this.add.text(this.character.x, this.character.y - this.character.height, damage, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 32,
            color: '#FF3333'
        });

        // add up motion to damage number
        this.tweens.add({
            targets: [damageNumber],
            y: damageNumber.y - 100,
            alpha: 0,
            duration: 600,
            onComplete: damageNumber.destroy,
        });

        // TODO: make player die
    }

    calculateDamage(attacker, defender) {
        let attackerDamage = {};
        let defenderResistance = {};
        let damageTotal = 0;

        // set array of equipment types to check for calculation
        let equipmentTypes = {'weapon': null, 'offhand': null, 'armor': null, 'trinket': null};

        for(let equipmentType in equipmentTypes) {

            let attackerItem = {};
            let defenderItem = {};
            let attackerItemName = '';
            let defenderItemName = '';

            // get equipment item for attacker
            if(attacker == saveObject.profiles[saveObject.currentProfile].character){
                // set attacker item to item in current character equipment
                if(attacker[equipmentType] != null) {
                    attackerItemName = getItem(attacker[equipmentType]).itemName;
                    attackerItem = config[equipmentType][attackerItemName];
                }
            }else {
                // set attacker item to item in monster configuration
                if(config.monster[attacker.texture.key][equipmentType] != null) {
                    attackerItemName = config.monster[attacker.texture.key][equipmentType];
                    attackerItem = config[equipmentType][attackerItemName];
                }
            }

            // get equipment item for defender
            if(defender == saveObject.profiles[saveObject.currentProfile].character){
                // set defender item to item in current character equipment
                if(defender[equipmentType] != null) {
                    defenderItemName = getItem(defender[equipmentType]).itemName;
                    defenderItem = config[equipmentType][defenderItemName];
                }
            }else {
                // set defender item to item in monster configuration
                if(config.monster[defender.texture.key][equipmentType] != null) {
                    defenderItemName = config.monster[defender.texture.key][equipmentType];
                    defenderItem = config[equipmentType][defenderItemName];
                }
            }

            // check if attacker has an item in this slot
            if(typeof attackerItem != 'undefined') {
                // collect all damage from current equipment type for attacker
                for (let damage in attackerItem.damage) {

                    // set damage type to 0 if not set already
                    if(typeof attackerDamage[damage] == 'undefined') {
                        attackerDamage[damage] = 0;
                    }
                    attackerDamage[damage] += attackerItem.damage[damage];
                }
            }

            // check if defender has an item in this slot
            if(typeof defenderItem != 'undefined') {
                // collect all resistances from current equipment type for defender
                for (let resistance in defenderItem.resistance) {

                    // set resistance type to 0 if not set already
                    if(typeof defenderResistance[resistance] == 'undefined') {
                        defenderResistance[resistance] = 0;
                    }
                    defenderResistance[resistance] += defenderItem.resistance[resistance];
                }
            }
        }

        // add damage to total for all types of damage the attacker has
        for (let damageType in attackerDamage) {
            if(typeof defenderResistance[damageType] == 'undefined') {
                defenderResistance[damageType] = 0;
            }
            // calculate damage by subtracting defender resistance from attacker damage
            let damage = attackerDamage[damageType] - defenderResistance[damageType];

            // add damage number to total if any damage comes through
            if(damage > 0) {
                damageTotal += damage;
            }
        }

        // make at least 1 damage per attack
        if(damageTotal < 1) {
            damageTotal = 1;
        }

        return damageTotal;
    }
}