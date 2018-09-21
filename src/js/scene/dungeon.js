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
        // add content placeholder to keep track of what is currently inside the room
        this.roomContent = {};

        // save new current scene in saveObject
        saveObject.profiles[saveObject.currentProfile].scene = 'dungeon';
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
    }

    addBackground() {
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundDungeon');
        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
    }

    addNavigationExit(x, y) {
        // add navigation button to return to profile overview and register corresponding function
        new Button('buttonExit', ['gameicons', 'exitLeft.png'], x, y, this);
        this.buttonExit.on('pointerup', this.exitDungeon, this);
        this.buttonExit.setTint(0x6666aa);
    }

    exitDungeon() {
        // stop animation complete listener
        this.character.off('animationcomplete');

        // stop character from moving when entering the scene
        this.characterEnterTween.stop();

        // stop character from moving when already moving to a side
        if (this.characterMovingTween != undefined) {
            this.characterMovingTween.stop();
        }

        // flip character to face the correct direction
        this.character.setScale(-1, 1);

        // play running animation if not already playing
        this.character.anims.play('characterRun', true);

        // move character to destination
        this.characterMovingTween = this.tweens.add({
            targets: [this.character],
            x: -100,
            duration: (-100 - this.character.x) * 5 * this.character.scaleX,
            onComplete: this.loadProfileOverviewScene
        });
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
    }

    addNavigationNextRoom(x, y) {
        // add navigation button to perform action based on room contents
        new Button('buttonNextRoom', ['gameicons', 'arrowRight.png'], x, y, this);
        this.buttonNextRoom.on('pointerup', this.goToNextRoom, this);
        this.buttonNextRoom.setTint(0x009966);
    }

    goToNextRoom() {
        // TODO: go to next room with one attack before leaving if an enemy is still in the room
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
            onComplete: this.characterIdle
        });
    }

    characterIdle() {
        // deactivate any event trigger when completing an animation as precaution
        this.parent.scene.character.off('animationcomplete');

        // start idle animation with sword
        this.parent.scene.character.anims.play('characterIdleWithSword');
    }

    addChest() {
        let chest = {
            content: {},
            open: false
        };
        this.roomContent.chest = chest;
    }

    addEnemy() {
        let enemy = {
        };
        this.roomContent.enemy = enemy;
    }

    addTrap() {
        let trap = {
        };
        this.roomContent.trap = trap;
    }
}