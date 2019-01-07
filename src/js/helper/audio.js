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

function stopSound() {
    for(let id in sounds) {
        sounds[id].stop();
    }
}

function pauseSound() {
    for(let id in sounds) {
        sounds[id].pause();
    }
}

function resumeSound() {
    for(let id in sounds) {
        sounds[id].resume();
    }
}