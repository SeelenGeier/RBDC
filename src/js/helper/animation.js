let loadedAnimations = [];

function addCharacterAnimations(unit) {
    // check if animations for selected character have already been loaded
    if(loadedAnimations.includes(unit)) {
        // skip loading animations to prevent loading them a second time
        return true;
    }

    // load animations depending on selected unit
    switch (unit){
        case 'character':
            loadAnimationCharacter();
            break;
        default:
            break;
    }

    // add unit to loaded animations to prevent loading them a second time
    loadedAnimations.push(unit);
}

function loadAnimationCharacter() {
    // register all animations used for the character
    game.anims.create({
        key: 'characterRun',
        frames: game.anims.generateFrameNumbers('character', { start: 8, end: 13 }),
        frameRate: 8,
        repeat: -1
    });
    game.anims.create({
        key: 'characterIdleWithSword',
        frames: game.anims.generateFrameNumbers('character', { start: 38, end: 41 }),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'characterIdleNoSword',
        frames: game.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'characterDrawSword',
        frames: game.anims.generateFrameNumbers('character', { start: 69, end: 72 }),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterSheatheSword',
        frames: game.anims.generateFrameNumbers('character', { start: 73, end: 76 }),
        frameRate: 6
    });
    game.anims.create({
        key: 'characterAttack1',
        frames: game.anims.generateFrameNumbers('character', { start: 41, end: 45 }),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterAttack2',
        frames: game.anims.generateFrameNumbers('character', { start: 46, end: 51 }),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterAttack3',
        frames: game.anims.generateFrameNumbers('character', { start: 52, end: 58 }),
        frameRate: 12
    });
}