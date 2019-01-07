class resultScene extends Phaser.Scene {

    constructor() {
        super({key: 'result'});
    }

    preload() {

    }

    create() {
        // save new current scene in saveObject
        saveObject.profiles[saveObject.currentProfile].scene = 'result';
        saveData();

        // stop running audio
        stopSound();

        // set counter and timer for showing text
        this.nextText = 0;
        this.waitForInput = 500;

        // activate the possibility to click the scene which leads to the next text showing
        this.input.on('pointerdown', this.showNext, this);

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);

        // generate rare items for shop
        generateRareShopItems();
    }

    showNext() {
        // show more and more text the more the player clicks
        switch (this.nextText) {
            case 0:
                // display rooms cleared
                this.addRoomsCleared(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.15);
                break;
            case 1:
                // display highscore notification
                this.showHighscore(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.2);
                break;
            case 2:
                // display newly acquired items
                this.showItemsAcquired(this.sys.game.config.width * 0.25, this.sys.game.config.height * 0.3);
                break;
            case 3:
                // display lost items
                this.showItemsLost(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.3);
                break;
            default:
                // deactivate the function to show new text via click
                this.input.off('pointerdown');

                // activate the next click to lead to the next scene
                this.input.on('pointerdown', this.loadNextScene, this);

                this.showClickToContinue();
        }
        this.nextText++;
    }

    loadNextScene() {
        // set current scene to sleep to prevent any buttons or functions to trigger during other scenes
        this.scene.sleep();

        // load profile overview scene
        this.scene.start('profileOverview');
    }

    addHighscore(x, y) {
        this.newHighscore = false;

        // save new highscore
        if(saveObject.profiles[saveObject.currentProfile].roomsCleared > saveObject.profiles[saveObject.currentProfile].highscoreRoomsCleared) {
            saveObject.profiles[saveObject.currentProfile].highscoreRoomsCleared = saveObject.profiles[saveObject.currentProfile].roomsCleared;
            saveData();

            // enable highscore text to show up
            this.newHighscore = true;
        }

        // check if a new highscore was made
        if(this.newHighscore) {
            // add highscore text
            this.newHighscoreText = this.add.text(x, y, 'NEW HIGHSCORE!', {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 24,
                color: '#ffffff'
            });
            this.newHighscoreText.setOrigin(0.5,0.5);
            this.newHighscoreText.alpha = 0.5;

            this.highscoreBlinkingTween = this.tweens.add({
                targets: this.newHighscoreText,
                alpha: 1,
                ease: 'Power2',
                duration: 500,
                yoyo: 1,
                repeat: -1
            });
        }
    }

    addRoomsCleared(x, y) {
        // add amount of rooms cleared text
        this.roomsClearedText = this.add.text(x, y, 'Rooms cleared: ' + saveObject.profiles[saveObject.currentProfile].roomsCleared, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });
        this.roomsClearedText.setOrigin(0.5,0.5);

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);
    }

    showHighscore(x, y) {
        // add highscore if a new highscore has been made
        setTimeout(function(){ game.scene.getScene('result').addHighscore(x, y); }, this.waitForInput);

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);
    }

    showClickToContinue() {
        // add amount of rooms cleared text
        this.clickToContinueText = this.add.text(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.9, 'Click to Continue', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });
        this.clickToContinueText.setOrigin(0.5,0.5);
        this.clickToContinueText.alpha = 0.2;

        this.continueBlinkingTween = this.tweens.add({
            targets: this.clickToContinueText,
            alpha: 0.7,
            ease: 'Power1',
            duration: 1000,
            yoyo: 1,
            repeat: -1
        });
    }

    showItemsAcquired(x, y) {
        let loopCounter = 1;
        this.itemsAcquiredText = {};

        // add headline for newly acquired items
        this.itemsAcquiredHeadline = this.add.text(x, y, 'Acquired Items:', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });
        this.itemsAcquiredHeadline.setOrigin(0.5,0.5);

        // list all items acquired during the last run
        for(let item in saveObject.profiles[saveObject.currentProfile].itemsAcquired) {
            this.itemsAcquiredText[loopCounter] = this.add.text(x, y + 10 + (25 * loopCounter), saveObject.profiles[saveObject.currentProfile].itemsAcquired[item].type + '/' + saveObject.profiles[saveObject.currentProfile].itemsAcquired[item].name, {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 24,
                color: '#ffffff'
            });
            this.itemsAcquiredText[loopCounter].setOrigin(0.5,0.5);
            loopCounter++;
        }

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);
    }

    showItemsLost(x, y) {
        // list all items lost during the last run
        let loopCounter = 1;
        this.itemsLostText = {};

        // add headline for newly acquired items
        this.itemsLostHeadline = this.add.text(x, y, 'Lost Items:', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });
        this.itemsLostHeadline.setOrigin(0.5,0.5);

        // list all items lost during the last run
        for(let item in saveObject.profiles[saveObject.currentProfile].itemsLost) {
            this.itemsLostText[loopCounter] = this.add.text(x, y + 10 + (25 * loopCounter), saveObject.profiles[saveObject.currentProfile].itemsLost[item].type + '/' + saveObject.profiles[saveObject.currentProfile].itemsLost[item].name, {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 24,
                color: '#ffffff'
            });
            this.itemsLostText[loopCounter].setOrigin(0.5,0.5);
            loopCounter++;
        }

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);
    }
}