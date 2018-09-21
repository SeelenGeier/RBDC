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
    }, splashScene, profileManagementScene, profileOverviewScene, configScene, shopScene, dungeonScene, resultScene]
};

// always keep the screen centered in the browser
let canvas = document.getElementById(gameConfig.parent);
canvas.style.maxWidth = gameConfig.width + 'px';
canvas.style.margin = '50px auto';

let game = new Phaser.Game(gameConfig);

// global config (e.g. config.weapon[config.default.equipment.weapon])
let config;

// global save object for storage
let saveObject;

function preload() {

    // load configuration files
    this.load.json('default', 'config/default.json');
    this.load.json('trap_type', 'config/trap_type.json');
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
}

function create() {
    // register configuration for easier access
    config = {
        default: this.cache.json.get('default'),
        trap_type: this.cache.json.get('trap_type'),
        monster: this.cache.json.get('monster'),
        trap: this.cache.json.get('trap'),
        weapon: this.cache.json.get('weapon'),
        armor: this.cache.json.get('armor'),
        offhand: this.cache.json.get('offhand'),
        trinket: this.cache.json.get('trinket'),
        valuable: this.cache.json.get('valuable')
    };

    // load images for configured items
    let imageCategories = ['weapon', 'armor', 'offhand', 'trinket', 'valuable'];
    for(let category in imageCategories) {
        for(let item in config[imageCategories[category]]) {
            if(config[imageCategories[category]][item].image != null) {
                this.load.image(config[imageCategories[category]][item].image, '../assets/item/' + config[imageCategories[category]][item].image + '.png');
            }
        }
    }

    // load image for "nothing"
    this.load.image('X', '../assets/item/X.png');

    // load image for currency
    this.load.image('currency', '../assets/item/coin.png');

    // run loader to load all prepared images in create function
    this.load.start();

    // load possible save data
    loadData();

    // always start splash screen first
    this.scene.start('splash');
}