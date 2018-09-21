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
    }
}