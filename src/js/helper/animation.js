let loadedAnimations = [];

function addCharacterAnimations(unit) {
    // check if animations for selected character have already been loaded
    if (loadedAnimations.includes(unit)) {
        // skip loading animations to prevent loading them a second time
        return true;
    }

    // load animations depending on selected unit
    window['loadAnimation' + (unit.charAt(0).toUpperCase() + unit.slice(1))]();

    // add unit to loaded animations to prevent loading them a second time
    loadedAnimations.push(unit);
}

function loadAnimationCharacter() {
    game.anims.create({
        key: 'characterRun',
        frames: game.anims.generateFrameNumbers('character', {start: 8, end: 13}),
        frameRate: 9,
        repeat: -1
    });
    game.anims.create({
        key: 'characterIdleWithSword',
        frames: game.anims.generateFrameNumbers('character', {start: 38, end: 41}),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'characterIdleNoSword',
        frames: game.anims.generateFrameNumbers('character', {start: 0, end: 3}),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'characterDrawSword',
        frames: game.anims.generateFrameNumbers('character', {start: 69, end: 72}),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterSheatheSword',
        frames: game.anims.generateFrameNumbers('character', {start: 73, end: 76}),
        frameRate: 6
    });
    game.anims.create({
        key: 'characterAttack1',
        frames: game.anims.generateFrameNumbers('character', {start: 41, end: 45}),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterAttack2',
        frames: game.anims.generateFrameNumbers('character', {start: 46, end: 51}),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterAttack3',
        frames: game.anims.generateFrameNumbers('character', {start: 52, end: 58}),
        frameRate: 12
    });
    game.anims.create({
        key: 'characterDie',
        frames: game.anims.generateFrameNumbers('character', {start: 59, end: 68}),
        frameRate: 6
    });
}

function loadAnimationSlime() {
    game.anims.create({
        key: 'slimeIdle',
        frames: game.anims.generateFrameNumbers('slime', {start: 0, end: 3}),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'slimeAttack',
        frames: game.anims.generateFrameNumbers('slime', {start: 8, end: 11}),
        frameRate: 12
    });
    game.anims.create({
        key: 'slimeDie',
        frames: game.anims.generateFrameNumbers('slime', {start: 16, end: 20}),
        frameRate: 12
    });
}

function loadAnimationSkeleton_1() {
    game.anims.create({
        key: 'skeleton_1Idle',
        frames: game.anims.generateFrameNumbers('skeleton_1Idle', {start: 0, end: 10}),
        frameRate: 9,
        repeat: -1
    });
    game.anims.create({
        key: 'skeleton_1Attack',
        frames: game.anims.generateFrameNumbers('skeleton_1Attack', {start: 0, end: 17}),
        frameRate: 16
    });
    game.anims.create({
        key: 'skeleton_1Die',
        frames: game.anims.generateFrameNumbers('skeleton_1Die', {start: 0, end: 14}),
        frameRate: 16
    });
}

function loadAnimationSkeleton_2() {
    game.anims.create({
        key: 'skeleton_2Idle',
        frames: game.anims.generateFrameNumbers('skeleton_2Idle', {start: 0, end: 17}),
        frameRate: 16,
        repeat: -1
    });
    game.anims.create({
        key: 'skeleton_2Attack',
        frames: game.anims.generateFrameNumbers('skeleton_2Attack', {start: 0, end: 19}),
        frameRate: 24
    });
    game.anims.create({
        key: 'skeleton_2Die',
        frames: game.anims.generateFrameNumbers('skeleton_2Die', {start: 0, end: 12}),
        frameRate: 16
    });
}

function loadAnimationSnake() {
    game.anims.create({
        key: 'snakeIdle',
        frames: game.anims.generateFrameNumbers('snake', {start: 0, end: 9}),
        frameRate: 9,
        repeat: -1
    });
    game.anims.create({
        key: 'snakeAttack',
        frames: game.anims.generateFrameNumbers('snake', {start: 30, end: 39}),
        frameRate: 16
    });
    game.anims.create({
        key: 'snakeDie',
        frames: game.anims.generateFrameNumbers('snake', {start: 40, end: 49}),
        frameRate: 16
    });
}

function loadAnimationMinotaur() {
    game.anims.create({
        key: 'minotaurIdle',
        frames: game.anims.generateFrameNumbers('minotaur', {start: 100, end: 104}),
        frameRate: 6,
        repeat: -1
    });
    game.anims.create({
        key: 'minotaurAttack',
        frames: game.anims.generateFrameNumbers('minotaur', {start: 130, end: 137}),
        frameRate: 9
    });
    game.anims.create({
        key: 'minotaurDie',
        frames: game.anims.generateFrameNumbers('minotaur', {start: 190, end: 195}),
        frameRate: 9
    });
}

function loadAnimationTrap() {
    game.anims.create({
        key: 'trapTrigger',
        frames: game.anims.generateFrameNumbers('trap', {start: 0, end: 4}),
        frameRate: 24
    });
}

function loadAnimationRat() {
    game.anims.create({
        key: 'ratIdle',
        frames: game.anims.generateFrameNumbers('rat', {start: 0, end: 9}),
        frameRate: 16,
        repeat: -1
    });
    game.anims.create({
        key: 'ratAttack',
        frames: game.anims.generateFrameNumbers('rat', {start: 30, end: 39}),
        frameRate: 16
    });
    game.anims.create({
        key: 'ratDie',
        frames: game.anims.generateFrameNumbers('rat', {start: 40, end: 49}),
        frameRate: 16
    });
}

function loadAnimationBat() {
    game.anims.create({
        key: 'batIdle',
        frames: game.anims.generateFrameNumbers('bat', {start: 50, end: 59}),
        frameRate: 16,
        repeat: -1
    });
    game.anims.create({
        key: 'batAttack',
        frames: game.anims.generateFrameNumbers('bat', {start: 80, end: 89}),
        frameRate: 16
    });
    game.anims.create({
        key: 'batDie',
        frames: game.anims.generateFrameNumbers('bat', {start: 90, end: 99}),
        frameRate: 16
    });
}