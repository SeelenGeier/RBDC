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

        // set counter for showing text
        this.nextText = 0;
        this.waitForInput = 500;

        // activate the possibility to click the scene which leads to the next text showing
        this.input.on('pointerdown', this.showNext, this);

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput);
    }

    showNext() {
        // show more and more text the more the player clicks
        switch (this.nextText) {
            case 0:
                this.showRoomsClearedAndHighscore();
                break;
            /*case 1:
                // TODO: show items acquired
                break;
            case 2:
                // TODO: show items lost
                break;
            case 3:
                // TODO: show new items in shop
                break;*/
            default:
                // deactivate the function to show new text via click
                this.input.off('pointerdown');

                // activate the next click to lead to the next scene
                this.input.on('pointerdown', this.loadNextScene, this);
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
        let newHighscore = false;

        // save new highscore
        if(saveObject.profiles[saveObject.currentProfile].roomsCleared > saveObject.profiles[saveObject.currentProfile].highscoreRoomsCleared) {
            saveObject.profiles[saveObject.currentProfile].highscoreRoomsCleared = saveObject.profiles[saveObject.currentProfile].roomsCleared;
            newHighscore = true;
        }

        // check if a new highscore was made
        if(newHighscore) {
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
                ease: 'Power1',
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
    }

    showRoomsClearedAndHighscore() {
        // show how deep the player got
        this.addRoomsCleared(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.2);

        // add highscore if a new highscore has been made
        setTimeout(function(){ game.scene.getScene('result').addHighscore(game.config.width * 0.5, game.config.height * 0.25); }, this.waitForInput);

        // add timer to show new text
        setTimeout(function(){ game.scene.getScene('result').showNext(); }, this.waitForInput * 2);
    }
}