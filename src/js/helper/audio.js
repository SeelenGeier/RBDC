let sounds = {};

function playSound(id) {
    // only play sound
    if(saveObject.profiles[saveObject.currentProfile].sound) {
        if(!sounds.hasOwnProperty(id)) {
            sounds[id] = game.sound.add(id);
        }
        sounds[id].play(config.audio[id]);
    }
}

function pauseSound() {
    for(let id in sounds) {
        // pause only looped sounds
        if(sounds[id].loop) {
            sounds[id].pause();
        }
    }
}

function resumeSound() {
    for(let id in sounds) {
        sounds[id].resume();
    }
}