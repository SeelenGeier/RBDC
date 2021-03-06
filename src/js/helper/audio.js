let sounds = {};

function playSound(id) {
    // only play sounds/music if active
    if ((!config.audio[id].isBackground && saveObject.profiles[saveObject.currentProfile].sound) || (config.audio[id].isBackground && saveObject.profiles[saveObject.currentProfile].music)) {
        if (!sounds.hasOwnProperty(id)) {
            sounds[id] = game.sound.add(id);
        }

        // resume audio that loops instead of play to prevent restarting
        if (sounds[id].loop) {
            sounds[id].resume(config.audio[id]);
        } else {
            sounds[id].play(config.audio[id]);
        }
    }
}

function pauseSound() {
    for (let id in sounds) {
        // pause only looped sounds
        if (sounds[id].loop) {
            sounds[id].pause();
        }
    }

    if (typeof saveObject.currentProfile != 'undefined') {
        // make sure ambience sounds are still playing
        if (saveObject.profiles[saveObject.currentProfile].scene == 'dungeon') {
            playSound('cave');
        }
        if (saveObject.profiles[saveObject.currentProfile].scene == 'profileOverview') {
            playSound('forest');
        }
        if (saveObject.profiles[saveObject.currentProfile].scene == 'shop') {
            playSound('forge');
        }
    }
}

function resumeSound() {
    // resume all sounds that have been paused
    for (let id in sounds) {
        sounds[id].resume();
    }
}