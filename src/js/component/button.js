class Button {
    constructor(name, buttonImage, x, y, parent) {
        this.parent = parent;
        this.name = name;

        // check if button image is an array (used for spritesheets
        if(Array.isArray(buttonImage)) {
            // add sprite provided by spritesheet
            parent[name] = parent.add.sprite(x, y, buttonImage[0], buttonImage[1]);
        }else {
            // add provided image
            parent[name] = parent.add.image(x, y, buttonImage);
        }

        // make image/sprite clickable
        parent[name].setInteractive();

        // register functions for button interaction
        parent[name].on('pointerover', this.hoverOn, this);
        parent[name].on('pointerout', this.hoverOff, this);
        parent[name].on('pointerdown', this.buttonDown, this);
        parent[name].on('pointerup', this.buttonUp, this);
    }

    buttonDown() {
        // if the button is pressed, move the button two pixel down
        this.parent[this.name].y = this.parent[this.name].y + 2;
    }

    buttonUp() {
        // if the button is released, move the button back two pixel up
        this.parent[this.name].y = this.parent[this.name].y - 2;
    }

    hoverOff() {
        // check if the button is being pressed when leaving button surface with the mouse
        if (this.parent.input.activePointer.isDown) {
            // release the button (move back up) if the pointer is down and the mouse left the button surface
            this.buttonUp();
        }
    }

    hoverOn() {
        // check if the button is being pressed when entering the button surface with the mouse
        if (this.parent.input.activePointer.isDown) {
            // press the button (move down) if the pointer is down and the mouse entered the button surface
            this.buttonDown();
        }
    }
}