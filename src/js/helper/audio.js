let sounds = {};

function playSound(id) {
    // only play sound
    if(saveObject.profiles[saveObject.currentProfile].sound) {
        if(!sounds.hasOwnProperty(id)) {
            sounds[id] = game.sound.add(id);
        }
        if(sounds[id].loop) {
            sounds[id].resume(config.audio[id]);
        }else {
            sounds[id].play(config.audio[id]);
        }
    }
}

function pauseSound() {
    for(let id in sounds) {
        // pause only looped sounds
        if(sounds[id].loop) {
            sounds[id].pause();
        }
    }

    // make sure ambience sounds are still playing
    if(saveObject.profiles[saveObject.currentProfile].scene == 'dungeon') {
        playSound('cave');
    }
}

function resumeSound() {
    for(let id in sounds) {
        sounds[id].resume();
    }
}