// configure Phaser
let gameConfig = {
    type: Phaser.AUTO,
    width: 750 * 0.5,
    height: 1334 * 0.5,
    parent: 'rbdcGame',
    backgroundColor: '#000000',
    scene: [{
        preload: preload,
        create: create
    }, splashScene, profileManagementScene, profileOverviewScene, configScene, shopScene, dungeonScene, resultScene],
    pixelArt: true,
    antialiasing: false
};

let url = new URL(window.location.href);
let fullscreen = url.searchParams.get("fullscreen");

// always keep the screen centered in the browser
let canvas = document.getElementById(gameConfig.parent);

if(fullscreen) {
    // hide navigation
    document.getElementById('navigation').style.display = 'none';

    // resize game to fit the current window
    gameConfig.width = window.innerWidth;
    gameConfig.height = window.innerHeight;
    
    // try to hide mobile navigation bar
    document.location.href = "#";
}else {
    // fix position of game in center of the screen
    canvas.style.maxWidth = gameConfig.width + 'px';
    canvas.style.margin = '50px auto';
}

// initialize game with Phaser
let game = new Phaser.Game(gameConfig);

// global config (e.g. config.weapon[config.default.equipment.weapon])
let config;

// global save object for storage
let saveObject;

function preload() {

    // load configuration files
    this.load.json('default', 'config/default.json');
    this.load.json('audio', 'config/audio.json');
    this.load.json('monster', 'config/monster.json');
    this.load.json('trap', 'config/trap.json');
    this.load.json('weapon', 'config/weapon.json');
    this.load.json('armor', 'config/armor.json');
    this.load.json('offhand', 'config/offhand.json');
    this.load.json('trinket', 'config/trinket.json');
    this.load.json('valuable', 'config/valuable.json');

    // load backgrounds
    this.load.image('backgroundBlack', '../assets/background/black.png');
    this.load.image('backgroundBeige', '../assets/background/beige.png');
    this.load.image('backgroundParchment', '../assets/background/parchment.png');
    this.load.image('backgroundTab', '../assets/background/tab.png');

    // load texture atlases
    this.load.atlasXML('uipack_blue', '../assets/spritesheet/uipack_blue.png', '../assets/spritesheet/uipack_blue.xml');
    this.load.atlasXML('uipack_green', '../assets/spritesheet/uipack_green.png', '../assets/spritesheet/uipack_green.xml');
    this.load.atlasXML('uipack_grey', '../assets/spritesheet/uipack_grey.png', '../assets/spritesheet/uipack_grey.xml');
    this.load.atlasXML('uipack_red', '../assets/spritesheet/uipack_red.png', '../assets/spritesheet/uipack_red.xml');
    this.load.atlasXML('uipack_rpg', '../assets/spritesheet/uipack_rpg.png', '../assets/spritesheet/uipack_rpg.xml');
    this.load.atlasXML('uipack_yellow', '../assets/spritesheet/uipack_yellow.png', '../assets/spritesheet/uipack_yellow.xml');
    this.load.atlasXML('gameicons', '../assets/spritesheet/gameicons.png', '../assets/spritesheet/gameicons.xml');
    this.load.atlasXML('gameicons_exp', '../assets/spritesheet/gameicons_exp.png', '../assets/spritesheet/gameicons_exp.xml');

    // load character spritesheet
    this.load.spritesheet('character', '../assets/unit/character.png', {frameWidth: 200, frameHeight: 148});
    this.load.spritesheet('trap', '../assets/trap.png', {frameWidth: 22, frameHeight: 21});
}

function create() {
    // register configuration for easier access
    config = {
        default: this.cache.json.get('default'),
        audio: this.cache.json.get('audio'),
        monster: this.cache.json.get('monster'),
        trap: this.cache.json.get('trap'),
        weapon: this.cache.json.get('weapon'),
        armor: this.cache.json.get('armor'),
        offhand: this.cache.json.get('offhand'),
        trinket: this.cache.json.get('trinket'),
        valuable: this.cache.json.get('valuable')
    };

    // load images for configured items
    let itemCategories = ['weapon', 'armor', 'offhand', 'trinket', 'valuable'];
    for (let category in itemCategories) {
        for (let item in config[itemCategories[category]]) {
            if (config[itemCategories[category]][item].image != null) {
                this.load.image(config[itemCategories[category]][item].image, '../assets/item/' + config[itemCategories[category]][item].image + '.png');
            }
        }
    }

    // load all configured audio files
    for (let audioFile in config.audio) {
        this.load.audio(audioFile, '../assets/audio/' + config.audio[audioFile].filename);
    }

    // load images for configured enemies
    for (let monster in config.monster) {
        if (monster == 'skeleton_1') {
            this.load.spritesheet('skeleton_1Idle', '../assets/unit/enemy/skeleton_1/idle.png', {
                frameWidth: 24,
                frameHeight: 32
            });
            this.load.spritesheet('skeleton_1Die', '../assets/unit/enemy/skeleton_1/die.png', {
                frameWidth: 33,
                frameHeight: 32
            });
            this.load.spritesheet('skeleton_1Attack', '../assets/unit/enemy/skeleton_1/attack.png', {
                frameWidth: 43,
                frameHeight: 37
            });
        } else if (monster == 'skeleton_2') {
            this.load.spritesheet('skeleton_2Idle', '../assets/unit/enemy/skeleton_2/idle.png', {
                frameWidth: 48,
                frameHeight: 32
            });
            this.load.spritesheet('skeleton_2Die', '../assets/unit/enemy/skeleton_2/die.png', {
                frameWidth: 72,
                frameHeight: 32
            });
            this.load.spritesheet('skeleton_2Attack', '../assets/unit/enemy/skeleton_2/attack.png', {
                frameWidth: 56,
                frameHeight: 40
            });
        } else {
            this.load.spritesheet(config.monster[monster].type, '../assets/unit/enemy/' + config.monster[monster].image.file, {
                frameWidth: config.monster[monster].image.width,
                frameHeight: config.monster[monster].image.height
            });
        }
    }

    // load image for "nothing"
    this.load.image('X', '../assets/item/X.png');

    // load image for currency
    this.load.image('currency', '../assets/' + config.default.setting.coinImage);

    // load chest image
    this.load.image('chestClosed', '../assets/' + config.default.setting.chestImageClosed);
    this.load.image('chestOpen', '../assets/' + config.default.setting.chestImageOpen);

    // run loader to load all prepared images in create function
    this.load.start();

    // load possible save data
    loadData();

    this.loadingText = this.add.text(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'LOADING ' + (game.scene.getScene('default').load.progress * 100) + '%', {
        fontFamily: config.default.setting.fontFamily,
        fontSize: 24,
        color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5, 0.5);

    // start game if finished loading
    startGame();
}

function startGame() {
    // check if everything has loaded
    if (game.scene.getScene('default').load.progress == 1) {
        game.scene.getScene('default').loadingText.destroy();

        // always start splash screen first
        game.scene.start('splash');
    } else {
        // update loading counter
        let progressPercent = Math.round(game.scene.getScene('default').load.progress * 10000) / 100;
        game.scene.getScene('default').loadingText.setText('LOADING ' + progressPercent + '%');
        setTimeout(function () {
            startGame()
        }, 30);
    }
}