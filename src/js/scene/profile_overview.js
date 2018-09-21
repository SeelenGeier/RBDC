class profileOverviewScene extends Phaser.Scene {

    constructor() {
        super({key: 'profileOverview'});
    }

    preload() {
        // TODO: replace background
        // load background image for profile overview
        this.load.image('backgroundProfileOverview', '../assets/background/profile_overview_mockup.png');
    }

    create() {
        this.lastScene = saveObject.profiles[saveObject.currentProfile].scene;

        // save new current scene in saveObject
        saveObject.profiles[saveObject.currentProfile].scene = 'profileOverview';
        saveData();

        // add button to navigate to config
        this.addBackground();

        // add button to navigate to config
        this.addNavigationConfig(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.1);

        // add button to navigate to the shop
        this.addNavigationShop(this.sys.game.config.width * 0.1, this.sys.game.config.height * 0.5);

        // add button to navigate to the dungeon
        this.addNavigationDungeon(this.sys.game.config.width * 0.90, this.sys.game.config.height * 0.5);

        // add profile name in the top center
        this.addProfileName(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.2);

        // add equipment at the bottom of the screen
        this.addEquipment(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.8);

        // add character to the left center of the screen
        this.addCharacter(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.62);

        // add character to the center of the screen
        this.addCurrency(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.66);
    }

    goToConfig() {
        // hide current scene and start config scene
        this.scene.sleep();
        this.scene.start('config');
    }

    goTo() {
        let destination = this[0];

        // stop timer for drawing/sheathing sword if character stopped once
        if (this[1].switchIdleCall != undefined) {
            this[1].switchIdleCall.destroy();
        }
        // stop animation complete listener
        this[1].character.off('animationcomplete');

        // stop character from moving when entering the scene
        this[1].characterEnterTween.stop();

        // stop character from moving when already moving to a side
        if (this[1].characterMovingTween != undefined) {
            this[1].characterMovingTween.stop();
        }

        // flip character to face the correct direction
        if (destination == 'shop') {
            this[1].character.setScale(-1, 1);
        } else {
            this[1].character.setScale(1, 1);
        }

        // play running animation if not already playing
        this[1].character.anims.play('characterRun', true);

        // set destination to be 100px outside of the screen (to make the character run off the screen)
        let destinationX = destination == 'shop' ? -100 : this[1].sys.game.config.width + 100;

        // move character to destination
        this[1].characterMovingTween = this[1].tweens.add({
            targets: [this[1].character],
            x: destinationX,
            duration: (destinationX - this[1].character.x) * 5 * this[1].character.scaleX,
            onComplete: destination == 'shop' ? this[1].loadShopScene : this[1].loadDungeonScene
        });
    }

    loadShopScene() {
        // hide current scene and start config scene
        this.parent.scene.scene.sleep();
        this.parent.scene.scene.start('shop');
    }

    loadDungeonScene() {
        // hide current scene and start config scene
        this.parent.scene.scene.sleep();
        this.parent.scene.scene.start('dungeon');
    }

    addProfileName(x, y) {
        // show profile name in top center of the screen
        this.profileName = this.add.text(x, y, saveObject.currentProfile, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });
        this.profileName.setOrigin(0.5, 0.5);
    }

    addNavigationConfig(x, y) {
        // add navigation button to open config and register corresponding function
        new Button('buttonConfig', ['gameicons', 'gear.png'], x, y, this);
        this.buttonConfig.on('pointerup', this.goToConfig, this);
        this.buttonConfig.setTint(0xaaaaaa);
    }

    addNavigationShop(x, y) {
        // add navigation button to go to the shop
        new Button('buttonShop', ['gameicons', 'cart.png'], x, y, this);
        this.buttonShop.on('pointerup', this.goTo, ['shop', this]);
        this.buttonShop.setTint(0xeecc00);
    }

    addNavigationDungeon(x, y) {
        // add navigation button to go to the dungeon
        new Button('buttonDungeon', ['gameicons_exp', 'diamond.png'], x, y, this);
        this.buttonDungeon.on('pointerup', this.goTo, ['dungeon', this]);
        this.buttonDungeon.setTint(0x00ffff);
    }

    addBackground() {
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundProfileOverview');
        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
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
            image = config[type][getItem(saveObject.profiles[saveObject.currentProfile].character[type]).itemName].image;
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
            this['equipped' + type[0].toUpperCase() + type.substring(1)].setTexture(config[type][getItem(saveObject.profiles[saveObject.currentProfile].character[type]).itemName].image);
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
            if (getItem(itemId).itemType == type) {
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
            unequipItemtype(type);
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
            if (getItem(itemId).itemType == type) {
                // set first item of array for future checks
                if (firstItem == null) {
                    // check if first item is the currently equipped item
                    if (itemId == equippedItemId) {
                        // unequip currently equipped item
                        unequipItemtype(type);
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

    addCharacter(x, y) {
        // add character outside of view
        this.character = this.add.sprite(-100, y, 'character');
        this.character.setOrigin(0.5, 1);

        // load animations if not done already
        addCharacterAnimations('character');

        // set character animation as running
        this.character.anims.play('characterRun');

        // leave sword sheathed initially
        this.character.swordDrawn = false;

        // check if character is coming back from the dungeon
        if (this.lastScene == 'dungeon') {
            // turn character around to move from the right to the left
            this.character.setScale(-1, 1);

            // set character position to be on the dungeon side
            this.character.x = this.sys.game.config.width + 100;

            // leave sword drawn when coming from the dungeon
            this.character.swordDrawn = true;
        }

        // add moving motion to the center of the screen and switch to idle animation after arrival
        this.characterEnterTween = this.tweens.add({
            targets: [this.character],
            x: x,
            duration: (x - this.character.x) * 5 * this.character.scaleX,
            onComplete: this.characterIdle
        });
    }

    characterIdle() {
        // deactivate any event trigger when completing an animation as precaution
        this.parent.scene.character.off('animationcomplete');

        // set delay for idle switching
        let delay = 5000 + (5000 * Math.random());

        // check if character is coming from the dungeon
        if (this.parent.scene.lastScene == 'dungeon' && this.parent.scene.character.scaleX == -1) {
            // remove first delay to immediately sheathe sword
            delay = 0;
        }else {
            // check if sword is drawn or not if not coming back from dungeon
            if (this.parent.scene.character.swordDrawn) {
                // start idle animation with sword
                this.parent.scene.character.anims.play('characterIdleWithSword');
            } else {
                // start idle animation without sword
                this.parent.scene.character.anims.play('characterIdleNoSword');
            }
        }

        // add timer for switching idle status
        this.parent.scene.switchIdleCall = this.parent.scene.time.delayedCall(delay, this.parent.scene.switchIdle, [], this);
    }

    switchIdle() {
        // check if the sword has been drawn or not
        if (this.parent.scene.character.swordDrawn) {
            // play sword sheathing animation
            this.parent.scene.character.anims.play('characterSheatheSword');

            // set sword drawn status to false
            this.parent.scene.character.swordDrawn = false;

            // turn character around if he is not facing to the right
            this.parent.scene.character.setScale(1, 1);

            // add event trigger when sheathing animation is complete to switch to idle animation
            this.parent.scene.character.on('animationcomplete', this.parent.scene.characterIdle, this);
        } else {
            // play sword drawing animation
            this.parent.scene.character.anims.play('characterDrawSword');

            // set sword drawn status to true
            this.parent.scene.character.swordDrawn = true;

            // add event trigger when sheathing animation is complete to switch to first attack animation
            this.parent.scene.character.on('animationcomplete', this.parent.scene.idleAttack1, this);
        }
    }

    idleAttack1() {
        // deactivate any event trigger when completing an animation
        this.parent.scene.character.off('animationcomplete');

        // play first attack animation
        this.parent.scene.character.anims.play('characterAttack1');

        // add event trigger when attack animation is complete to switch to second attack animation
        this.parent.scene.character.on('animationcomplete', this.parent.scene.idleAttack2, this);
    }

    idleAttack2() {
        // deactivate any event trigger when completing an animation
        this.parent.scene.character.off('animationcomplete');

        // play second attack animation
        this.parent.scene.character.anims.play('characterAttack2');

        // add event trigger when attack animation is complete to switch to third attack animation
        this.parent.scene.character.on('animationcomplete', this.parent.scene.idleAttack3, this);
    }

    idleAttack3() {
        // deactivate any event trigger when completing an animation
        this.parent.scene.character.off('animationcomplete');

        // play third attack animation
        this.parent.scene.character.anims.play('characterAttack3');

        // add event trigger when attack animation is complete to switch to idle animation
        this.parent.scene.character.on('animationcomplete', this.parent.scene.characterIdle, this);
    }

    addCurrency(x, y) {
        // display current amount of currency
        this.textBuySellSelected = this.add.text(x, y, saveObject.profiles[saveObject.currentProfile].inventory.currency, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 20,
            color: '#dddd00'
        });
        this.textBuySellSelected.setStroke('#222222', 4);

        // add icon next to currency
        this.imageBuySellSelected = this.add.sprite(x - 20, y + 15, 'currency');
        this.imageBuySellSelected.setScale(0.75);
    }
}