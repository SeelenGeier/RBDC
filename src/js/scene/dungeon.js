class dungeonScene extends Phaser.Scene {

    constructor() {
        super({key: 'dungeon'});
    }

    preload() {
        // load background image for profile overview
        this.load.image('backgroundDungeon', '../assets/background/dungeon_mockup.png');
    }

    create() {
        // save new current scene in saveObject
        saveObject.profiles[saveObject.currentProfile].scene = 'dungeon';
        if (typeof saveObject.profiles[saveObject.currentProfile].room === 'undefined') {
            this.startRoom();
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

        // add character to the left center of the screen
        this.addCharacter(this.sys.game.config.width * 0.25, this.sys.game.config.height * 0.62);

        // add health indicator for player character
        this.addCharacterHealth(this.sys.game.config.width * 0.25, this.sys.game.config.height * 0.3);

        // add counter in top right corner for current room number
        this.addRoomCounter(this.sys.game.config.width * 0.85, this.sys.game.config.height * 0.07);

        // add equipment at the bottom of the screen
        this.addEquipment(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.8);

        if (this.isEnemyAlive()) {
            // add enemy to the right of the room
            this.addEnemy(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.62);

            // add health indicator for player character
            this.addEnemyHealth(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.3);
        }

        if (this.isChestClosed()) {
            // add chest in center of the room
            this.addChest(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.62);
        }

        // set enemy to idle per default
        this.enemyIsIdle = true;
    }

    addRoomCounter(x, y) {
        // add visible counter for rooms
        this.roomCounter = this.add.text(x, y, (saveObject.profiles[saveObject.currentProfile].roomsCleared + 1), {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 32,
            color: '#FFFFFF'
        });
    }

    startRoom() {
        // invalidate any currently saved room
        saveObject.profiles[saveObject.currentProfile].room = {};

        // add random encounter to room
        let chance = Math.random();
        if (chance < config.default.setting.enemySpawnChance) {
            this.spawnEnemy();
        } else if (chance < config.default.setting.enemySpawnChance + config.default.setting.chestSpawnChance) {
            this.spawnChest();
        }

        // add random trap to room
        if (Math.random() < config.default.setting.trapSpawnChance) {
            this.spawnTrap();
        }

        // save just in case
        saveData();
    }

    addBackground() {
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundDungeon');
        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
    }

    addNavigationExit(x, y) {
        // add navigation button to return to profile overview and register corresponding function
        new Button('buttonExit', ['gameicons', 'exitLeft.png'], x, y, this);
        this.buttonExit.on('pointerup', this.exitWarning, this);
        this.buttonExit.setTint(0x6666aa);
    }

    exitWarning() {
        // show confirmation dialog with warning
        new Dialog('End Run?', '- keep items found\n- the room counter will be reset!', this.scene, true);

        // only exit dungeon if player is ok with resetting the counter
        this.dialogButtonYES.on('pointerup', this.goTo, [this, 'exit']);
    }

    loadProfileOverviewScene() {
        // unset current room
        saveObject.profiles[saveObject.currentProfile].room = undefined;
        saveData();

        // hide current scene and start config scene
        this.parent.scene.scene.sleep();
        this.parent.scene.scene.start('profileOverview');
    }

    addNavigationAction(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonAction', ['gameicons_exp', ''], x, y, this);

        // set action function on click
        this.buttonAction.on('pointerup', this.performAction, this);

        // update action button
        this.changeActionButton();
    }

    changeActionButton() {
        // change action button according to current room content
        if (this.isEnemyAlive()) {
            this.buttonAction.setTexture('gameicons_exp');
            this.buttonAction.setFrame('fightFist.png');
            this.buttonAction.setTint(0xcc0000);
        } else if (this.isChestClosed()) {
            this.buttonAction.setTexture('gameicons');
            this.buttonAction.setFrame('basket.png');
            this.buttonAction.setTint(0xeeaa00);
        } else {
            this.buttonAction.setTexture('gameicons_exp');
            this.buttonAction.setFrame('coin.png');
            this.buttonAction.setTint(0xaaaaaa);
        }
    }

    performAction() {
        // check if living enemy, closed chest or armed trap is present
        if (this.characterIsIdle && this.enemyIsIdle) {
            if (this.isEnemyAlive()) {
                // let player and enemy both attack
                this.attackPlayer();
                this.attackEnemy();

                // reduce durability of used weapon
                this.reduceEquipmentDurability();
            } else if (this.isChestClosed()) {
                this.openChest();
            } else if (this.isTrapArmed()) {
                console.log('trap disarmed!')
            }else {
                console.log('trap triggered!')
            }
        }
    }

    addNavigationNextRoom(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonNextRoom', ['gameicons', 'arrowRight.png'], x, y, this);
        this.buttonNextRoom.on('pointerup', this.nextRoomWarning, this);
        this.buttonNextRoom.setTint(0x009966);
    }

    nextRoomWarning() {
        // only go to next room if character is alive
        if (saveObject.profiles[saveObject.currentProfile].character.health > 0) {
            if (this.isEnemyAlive()) {
                // show confirmation dialog with warning
                new Dialog('Run past enemy?', 'The enemy still present will hit you!', this.scene, true);

                // only exit dungeon if player is ok with resetting the counter
                this.dialogButtonYES.on('pointerup', this.goToCenter, [this, 'center']);
            } else {
                this.goToCenter.call([this, 'center']);
            }
        } else {
            this.characterDie();
        }
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
        if (this[0].character.x < this[0].sys.game.config.width / 2) {
            // move player to center
            this[0].goTo.call(this);
        }
    }

    goToNextRoom() {
        // go to the center of the room
        if (this.parent.scene.isEnemyAlive()) {
            this.parent.scene.attackEnemy();
        }
        if (this.parent.scene.isTrapArmed()) {
            console.log('trap triggered!')
        }
        this.parent.scene.goTo.call([this.parent.scene, 'nextRoom']);
    }

    leaveRoom() {
        // unset current room
        saveObject.profiles[saveObject.currentProfile].room = undefined;

        // add a room to the cleared counter
        saveObject.profiles[saveObject.currentProfile].roomsCleared++;
        saveData();

        // open next room
        this.parent.scene.scene.start('dungeon');
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
        this.enemy.setScale(saveObject.profiles[saveObject.currentProfile].room.enemy.image.scale * saveObject.profiles[saveObject.currentProfile].room.enemy.image.direction, saveObject.profiles[saveObject.currentProfile].room.enemy.image.scale);

        // load animations if not done already
        addCharacterAnimations(saveObject.profiles[saveObject.currentProfile].room.enemy.type);

        // start enemy in idle animation
        this.enemyIdle();
    }

    addCharacterHealth(x, y) {
        // add frame image for character health indicator
        this.characterHealthFrame = this.add.sprite(x, y, 'gameicons_exp', 'fightJ.png');
        this.characterHealthFrame.setTint(0x222222);

        // add image for character health indicator
        this.characterHealth = this.add.sprite(x, y, 'gameicons_exp', 'fightJ.png');

        // update color of character health indicator
        this.updateCharacterHealth();
    }

    updateCharacterHealth() {
        // update color of health indicator to correspond with character health
        let currentHealth = saveObject.profiles[saveObject.currentProfile].character.health;
        let maxHealth = config.default.status.health;
        let red = Math.trunc((1 - (currentHealth / maxHealth)) * 255);
        let green = Math.trunc((currentHealth / maxHealth) * 255);
        let color = Phaser.Display.Color.RGBStringToColor('rgb(' + red + ', ' + green + ', 0)');
        this.characterHealth.setTint(color.color);
        if(currentHealth > 0) {
            this.characterHealth.setScale(((currentHealth / maxHealth) * 0.8) + 0.2);
        }else {
            this.characterHealth.setScale(0);
        }
    }

    addEnemyHealth(x, y) {
        // add frame image for enemy health indicator
        this.enemyHealthFrame = this.add.sprite(x, y, 'gameicons_exp', 'fightJ.png');
        this.enemyHealthFrame.setTint(0x222222);

        // add image for enemy health indicator
        this.enemyHealth = this.add.sprite(x, y, 'gameicons_exp', 'fightJ.png');

        // update color of enemy health indicator
        this.updateEnemyHealth();
    }

    updateEnemyHealth() {
        // update color of health indicator to correspond with enemy health
        let currentHealth = saveObject.profiles[saveObject.currentProfile].room.enemy.health;
        let maxHealth = config.monster[saveObject.profiles[saveObject.currentProfile].room.enemy.type].health;
        let red = Math.trunc((1 - (currentHealth / maxHealth)) * 255);
        let green = Math.trunc((currentHealth / maxHealth) * 255);
        let color =Phaser.Display.Color.RGBStringToColor('rgb(' + red + ', ' + green + ', 0)');
        this.enemyHealth.setTint(color.color);
        if(currentHealth > 0) {
            this.enemyHealth.setScale(((currentHealth / maxHealth) * 0.8) + 0.2);
        }else {
            this.enemyHealth.setScale(0);
        }
    }

    addChest(x, y) {
        // add character outside of view
        this.chest = this.add.sprite(x, y, 'chestClosed');
        this.chest.setOrigin(0.5, 1);
    }

    openChest() {
        // check if player inventory is already full
        if (Object.keys(saveObject.profiles[saveObject.currentProfile].inventory.items).length >= config.default.status.inventorySize) {
            // show 'Inventory full' message
            new Dialog('Inventory full!', 'You can not have more than\n' + config.default.status.inventorySize + ' items.', this.scene);
        } else {
            // open chest
            this.chest.setTexture('chestOpen');
            saveObject.profiles[saveObject.currentProfile].room.chest.closed = false;
            saveData();

            let newItemId = giveItem(saveObject.profiles[saveObject.currentProfile].room.chest.item.category, saveObject.profiles[saveObject.currentProfile].room.chest.item.type, saveObject.profiles[saveObject.currentProfile].room.chest.item.durability);

            let newItem = getItem(newItemId);
            new Dialog('Item found!', 'You found a ' + config[newItem.type][newItem.name].name + ' with ' + newItem.durability + ' durability.', this.scene);
        }

        // update action button
        this.changeActionButton();
    }

    characterIdle() {
        let that;

        // make sure the correct context is used
        if (this.constructor.name === 'Tween') {
            that = this.parent.scene;
        } else {
            that = this;
        }

        // process death if character lost all his health
        if (saveObject.profiles[saveObject.currentProfile].character.health <= 0) {
            that.characterDie();
        } else {
            // deactivate any event trigger when completing an animation as precaution
            that.character.off('animationcomplete');

            // start idle animation with sword
            that.character.anims.play('characterIdleWithSword');

            // set character to being idle
            that.characterIsIdle = true;
        }
    }

    enemyIdle() {
        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        if (this.isEnemyAlive()) {
            // set enemy to idle animation
            this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Idle');
        } else {
            // set enemy to die animation
            this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Die');
        }

        // set enemy to being idle
        this.enemyIsIdle = true;
    }

    spawnChest() {
        // generate empty chest.
        let chest = {
            closed: true,
            item: {}
        };

        // save chest to room
        saveObject.profiles[saveObject.currentProfile].room.chest = chest;

        // add item to chest
        saveObject.profiles[saveObject.currentProfile].room.chest.item = this.getRandomItem();

        saveData();
    }

    spawnEnemy() {
        // pick random monster
        let enemyStats = config.monster[Object.keys(config.monster)[Math.floor(Math.random() * Object.keys(config.monster).length)]];
        let enemy = JSON.parse(JSON.stringify(enemyStats));

        // save enemy to room
        saveObject.profiles[saveObject.currentProfile].room.enemy = enemy;
        saveData();
    }

    spawnTrap() {
        // TODO: generate actual trap
        let trap = {
            armed: true
        };
        saveObject.profiles[saveObject.currentProfile].room.trap = trap;
        saveData();
    }

    isEnemyAlive() {
        // check if any enemy exists at all
        if (typeof saveObject.profiles[saveObject.currentProfile].room.enemy === 'undefined') {
            return false;
        } else {
            // return true if enemy has more than 0 health (is still alive)
            return (saveObject.profiles[saveObject.currentProfile].room.enemy.health > 0);
        }
    }

    isChestClosed() {
        // check if any chest exists at all
        if (typeof saveObject.profiles[saveObject.currentProfile].room.chest === 'undefined') {
            return false;
        } else {
            // return true if chest is still closed
            return saveObject.profiles[saveObject.currentProfile].room.chest.closed;
        }
    }

    isTrapArmed() {
        // check if any trap exists at all
        if (typeof saveObject.profiles[saveObject.currentProfile].room.trap === 'undefined') {
            return false;
        } else {
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

        // deal damage to the enemy
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
        this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Attack');

        // deal damage to the player
        this.playerDamaged();

        // play idle animation after attack
        this.enemy.on('animationcomplete', this.enemyIdle, this);
    }

    enemyDie() {
        // deactivate any event trigger when completing an animation as precaution
        this.enemy.off('animationcomplete');

        // start death animation
        this.enemy.anims.play(saveObject.profiles[saveObject.currentProfile].room.enemy.type + 'Die');

        // spawn chest with fixed chance
        if (Math.random() < config.default.setting.chestSpawnChanceAfterKill * saveObject.profiles[saveObject.currentProfile].roomsCleared) {
            this.spawnChest();

            // add chest in center of the room
            this.addChest(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.62);
        }

        // update action button
        this.changeActionButton();
    }

    enemyDamaged() {
        // calculate damage based on weapon and defense
        let damage = this.calculateDamage(saveObject.profiles[saveObject.currentProfile].character, this.enemy);

        // subtract damage from enemy health
        saveObject.profiles[saveObject.currentProfile].room.enemy.health -= damage;
        saveData();

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

        // update color of character health indicator
        this.updateEnemyHealth();

        // process death if enemy lost all his health
        if (saveObject.profiles[saveObject.currentProfile].room.enemy.health <= 0) {
            this.enemyDie();
        }
    }

    playerDamaged() {
        // calculate damage based on weapon and defense
        let damage = this.calculateDamage(this.enemy, saveObject.profiles[saveObject.currentProfile].character);

        // subtract damage from enemy health
        saveObject.profiles[saveObject.currentProfile].character.health -= damage;
        saveData();

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

        // update color of character health indicator
        this.updateCharacterHealth();

        // process death if character lost all his health
        if (saveObject.profiles[saveObject.currentProfile].character.health <= 0) {
            this.characterDie();
        }
    }

    calculateDamage(attacker, defender) {
        let attackerDamage = {};
        let defenderResistance = {};
        let damageTotal = 0;

        // set array of equipment types to check for calculation
        let equipmentTypes = {'weapon': null, 'offhand': null, 'armor': null, 'trinket': null};

        for (let equipmentType in equipmentTypes) {

            let attackerItem = {};
            let defenderItem = {};
            let attackername = '';
            let defendername = '';

            // get equipment item for attacker
            if (attacker == saveObject.profiles[saveObject.currentProfile].character) {
                // set attacker item to item in current character equipment
                if (attacker[equipmentType] != null) {
                    attackername = getItem(attacker[equipmentType]).name;
                    attackerItem = config[equipmentType][attackername];
                }
            } else {
                // set attacker item to use monster configuration
                if(equipmentType == 'weapon') {
                    attackerItem = config.monster[this.enemy.texture.key];
                }else {
                    attackerItem = undefined;
                }
            }

            // get equipment item for defender
            if (defender == saveObject.profiles[saveObject.currentProfile].character) {
                // set defender item to item in current character equipment
                if (defender[equipmentType] != null) {
                    defendername = getItem(defender[equipmentType]).name;
                    defenderItem = config[equipmentType][defendername];
                }
            } else {
                // set defender item to use monster configuration
                if(equipmentType == 'armor') {
                    defenderItem = config.monster[this.enemy.texture.key];
                }else {
                    defenderItem = undefined;
                }
            }

            // check if attacker has an item in this slot
            if (typeof attackerItem != 'undefined') {
                // collect all damage from current equipment type for attacker
                for (let damage in attackerItem.damage) {

                    // set damage type to 0 if not set already
                    if (typeof attackerDamage[damage] == 'undefined') {
                        attackerDamage[damage] = 0;
                    }
                    attackerDamage[damage] += attackerItem.damage[damage];
                }
            }

            // check if defender has an item in this slot
            if (typeof defenderItem != 'undefined') {
                // collect all resistances from current equipment type for defender
                for (let resistance in defenderItem.resistance) {

                    // set resistance type to 0 if not set already
                    if (typeof defenderResistance[resistance] == 'undefined') {
                        defenderResistance[resistance] = 0;
                    }
                    defenderResistance[resistance] += defenderItem.resistance[resistance];
                }
            }
        }

        // add damage to total for all types of damage the attacker has
        for (let damageType in attackerDamage) {
            if (typeof defenderResistance[damageType] == 'undefined') {
                defenderResistance[damageType] = 0;
            }
            // calculate damage by subtracting defender resistance from attacker damage
            let damage = attackerDamage[damageType] - defenderResistance[damageType];

            // add damage number to total if any damage comes through
            if (damage > 0) {
                damageTotal += damage;
            }
        }

        // make at least 1 damage per attack
        if (damageTotal < 1) {
            damageTotal = 1;
        }

        return damageTotal;
    }

    getRandomItem() {
        let category;
        let type;
        let durability;
        let keys = [];

        let chance = Math.random();
        if (chance < 0.25) {
            category = 'weapon';
        } else if (chance < 0.50) {
            category = 'offhand';
        } else if (chance < 0.75) {
            category = 'armor';
        } else {
            category = 'trinket';
        }

        for (let prop in config[category]) {
            if (config[category].hasOwnProperty(prop)) {
                keys.push(prop);
            }
        }
        type = keys[keys.length * Math.random() << 0];

        durability = 10 + Math.trunc(Math.random() * 10 * saveObject.profiles[saveObject.currentProfile].roomsCleared);

        let item = {
            category: category,
            type: type,
            durability: durability
        };
        return item;
    }

    characterDie() {
        // deactivate any event trigger when completing an animation as precaution
        this.character.off('animationcomplete');

        // start idle animation with sword
        this.character.anims.play('characterDie');

        // play idle animation after attack
        this.character.on('animationcomplete', this.showDeadDialog, this);
    }

    showDeadDialog() {
        // show "retreat" dialog
        new Dialog('You have to retreat!', 'You have to draw back in order to survive.\nDuring your escape you lost your equipped items.', this.scene);

        // remove all currently equipped items
        removeItem(saveObject.profiles[saveObject.currentProfile].character.weapon);
        removeItem(saveObject.profiles[saveObject.currentProfile].character.offhand);
        removeItem(saveObject.profiles[saveObject.currentProfile].character.armor);
        removeItem(saveObject.profiles[saveObject.currentProfile].character.trinket);
        saveData();

        // exit dungeon after retreat
        this.dialogButtonOK.on('pointerup', this.goTo, [this, 'exit']);
    }

    addEquipment(x, y) {
        // add one item and up/down arrow for each equipable category
        this.addEquipped(x - 90, y, 'weapon');
        this.addEquipped(x - 30, y, 'armor');
        this.addEquipped(x + 30, y, 'offhand');
        this.addEquipped(x + 90, y, 'trinket');
    }

    addEquipped(x, y, type) {
        let image = '';
        let durabilityText = '';
        if (saveObject.profiles[saveObject.currentProfile].character[type] != null) {
            // get image from item config
            image = config[type][getItem(saveObject.profiles[saveObject.currentProfile].character[type]).name].image;
            durabilityText = getItem(saveObject.profiles[saveObject.currentProfile].character[type]).durability != null ? getItem(saveObject.profiles[saveObject.currentProfile].character[type]).durability + '' : 'X';
        } else {
            image = 'X';
            durabilityText = '-';
        }

        // add image for item
        this['equipped' + type[0].toUpperCase() + type.substring(1)] = this.add.sprite(x, y, image);

        // add durability info below item
        this['equipped' + type[0].toUpperCase() + type.substring(1)].durability = this.add.text(x - (durabilityText.length * 4), y + 40, durabilityText, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 16,
            color: '#ffffff'
        });

        // add up button to equip next item
        new Button('buttonItemNext' + type[0].toUpperCase() + type.substring(1), ['gameicons', 'up.png'], x, y - 50, this);
        this['buttonItemNext' + type[0].toUpperCase() + type.substring(1)].on('pointerup', this.changeItemNext, [type, this]);
        this['buttonItemNext' + type[0].toUpperCase() + type.substring(1)].setTint(0xcccccc);

        // add down button to equip previous item
        new Button('buttonItemPrev' + type[0].toUpperCase() + type.substring(1), ['gameicons', 'down.png'], x, y + 80, this);
        this['buttonItemPrev' + type[0].toUpperCase() + type.substring(1)].on('pointerup', this.changeItemPrev, [type, this]);
        this['buttonItemPrev' + type[0].toUpperCase() + type.substring(1)].setTint(0xcccccc);
    }

    updateEquipped(type) {
        let durabilityText = '';

        // check if item slot has an item equipped
        if (saveObject.profiles[saveObject.currentProfile].character[type] != null) {
            // change image of this item type to current item image
            this['equipped' + type[0].toUpperCase() + type.substring(1)].setTexture(config[type][getItem(saveObject.profiles[saveObject.currentProfile].character[type]).name].image);
            durabilityText = getItem(saveObject.profiles[saveObject.currentProfile].character[type]).durability != null ? getItem(saveObject.profiles[saveObject.currentProfile].character[type]).durability + '' : 'X';
        } else {
            // use "nothing" image and no durability if nothing is equipped
            this['equipped' + type[0].toUpperCase() + type.substring(1)].setTexture('X');
            durabilityText = '-';
        }
        // update durability text and position to be centered with image
        this['equipped' + type[0].toUpperCase() + type.substring(1)].durability.setText(durabilityText);
        this['equipped' + type[0].toUpperCase() + type.substring(1)].durability.x = this['equipped' + type[0].toUpperCase() + type.substring(1)].x - (durabilityText.length * 4);
    }

    changeItemNext() {
        let type = this[0];
        let previousItem = null;

        // get id of current item
        let equippedItemId = saveObject.profiles[saveObject.currentProfile].character[type];

        // loop through all items of this type in inventory
        for (let itemId in saveObject.profiles[saveObject.currentProfile].inventory.items) {
            if (getItem(itemId).type == type) {
                // check if the item before the current item is the currently equipped item
                if (previousItem == equippedItemId) {
                    // equip current item
                    equipItem(itemId);
                    this[1].updateEquipped(type);
                    return true;
                }

                // set previous item to current item and continue loop
                previousItem = itemId;
            }
        }

        // check if last found item is the current item
        if (previousItem == equippedItemId) {
            // unequip current item
            unequiptype(type);
            this[1].updateEquipped(type);
            return true;
        }

        // save equipment choice
        saveData();
    }

    changeItemPrev() {
        let type = this[0];
        let firstItem = null;
        let previousItem = null;
        // get id of current item
        let equippedItemId = saveObject.profiles[saveObject.currentProfile].character[type];
        // loop through all items of this type in inventory
        for (let itemId in saveObject.profiles[saveObject.currentProfile].inventory.items) {
            if (getItem(itemId).type == type) {
                // set first item of array for future checks
                if (firstItem == null) {
                    // check if first item is the currently equipped item
                    if (itemId == equippedItemId) {
                        // unequip currently equipped item
                        unequiptype(type);
                        this[1].updateEquipped(type);
                        return true;
                    }
                    // set first item to skip this step in future loops
                    firstItem = itemId;
                }
                // check if the current item is the currently equipped item
                if (itemId == equippedItemId) {
                    // equip the previously found item
                    equipItem(previousItem);
                    this[1].updateEquipped(type);
                    return true;
                }
                // set previous item to current item and continue loop
                previousItem = itemId;
            }
        }
        // check if the last item found is not the equipped item
        if (previousItem != equippedItemId) {
            // otherwise equip the last item
            equipItem(previousItem);
            this[1].updateEquipped(type);
            return true;
        }

        // save equipment choice
        saveData();
    }

    reduceEquipmentDurability() {
        let imageCategories = ['weapon', 'armor', 'offhand', 'trinket'];
        for(let category in imageCategories) {
            if(saveObject.profiles[saveObject.currentProfile].character[imageCategories[category]] != null) {
                if(getItem(saveObject.profiles[saveObject.currentProfile].character[imageCategories[category]]).durability != null) {
                    // make item loose durability depending on the configured chance
                    if(Math.random() < config.default.setting.durabilityLossChance) {
                        getItem(saveObject.profiles[saveObject.currentProfile].character[imageCategories[category]]).durability--;
                        if(getItem(saveObject.profiles[saveObject.currentProfile].character[imageCategories[category]]).durability <= 0) {
                            removeItem(saveObject.profiles[saveObject.currentProfile].character[imageCategories[category]]);
                        }
                        this.updateEquipped(imageCategories[category]);
                    }
                }
            }
        }

        // save equipment choice
        saveData();
    }
}