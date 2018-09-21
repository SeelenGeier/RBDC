class splashScene extends Phaser.Scene {

    constructor() {
        super({key: 'splash'});
    }

    preload() {
        // load splash screen image
        this.load.image('splash', '../assets/splash.jpg');
    }

    create() {

        // add title of the game
        this.addTextTitle(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.25);

        // add splash image in the center of the splash screen
        this.addSplashImage(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.45);

        // add 'by' in separate line
        this.addTextBy(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.65);

        // add author info below 'by'
        this.addTextAuthor(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.73);

        // add timer to activate pointer (to have the splash screen stay for a while)
        this.time.delayedCall(1000, this.activatePointer, [], this);
    }

    fadeSplash() {
        // add fading animation when clicked which loads the next scene the fading is complete
        this.fadeSplashTween = this.tweens.add({
            targets: [this.splashImage, this.splashTitle, this.splashBy, this.splashAuthor],
            alpha: 0,
            ease: 'Power1',
            duration: 1500,
            onComplete: splashScene.loadNextScene
        });
    }

    static loadNextScene() {
        // set current scene to sleep to prevent any buttons or functions to trigger during other scenes
        this.parent.scene.scene.sleep();

        // check if a profile is currently loaded
        if (saveObject.currentProfile != undefined) {
            // load scene where current profile is located
            this.parent.scene.scene.start(saveObject.profiles[saveObject.currentProfile].scene);
        } else {
            // load default profile management scene
            this.parent.scene.scene.start('profileManagement');
        }
    }

    activatePointer() {
        // activate the possibility to click the scene which leads to the splash screen fading
        this.input.on('pointerdown', this.fadeSplash, this);
    }

    addTextTitle(x, y) {
        // add title text to splash screen
        this.splashTitle = this.add.text(x, y, config.default.setting.title, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });

        // change position of title text to be centered
        this.splashTitle.setOrigin(0.5, 0.5);
    }

    addSplashImage(x, y) {
        // add splash image
        this.splashImage = this.add.sprite(x, y, 'splash');
    }

    addTextBy(x, y) {
        // add text 'by' as separate line under splash image
        this.splashBy = this.add.text(x, y, 'by', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });

        // change position of 'by' text to be centered
        this.splashBy.setOrigin(0.5, 0.5);
    }

    addTextAuthor(x, y) {
        // add author text as separate line under 'by' text
        this.splashAuthor = this.add.text(x, y, config.default.setting.author, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#ffffff'
        });

        // change position of author text to be centered
        this.splashAuthor.setOrigin(0.5, 0.5);
    }
}