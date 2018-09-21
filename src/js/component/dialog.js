class Dialog {
    constructor(title, text, parent, confirm = false) {
        this.parent = parent;
        this.confirm = confirm;

        // add grey transparent background to block input outside of dialog box
        this.greyBackground = parent.scene.add.sprite(parent.scene.sys.game.config.width * 0.5, parent.scene.sys.game.config.height * 0.5, 'backgroundBlack');
        this.greyBackground.setScale(parent.scene.sys.game.config.width / this.greyBackground.width, parent.scene.sys.game.config.height / this.greyBackground.height);
        this.greyBackground.alpha = 0.7;

        // make grey transparent background interactive to block all input from going through
        this.greyBackground.setInteractive();

        // add dialog box in center of screen
        this.dialogBackground = parent.scene.add.sprite(parent.scene.sys.game.config.width * 0.5, parent.scene.sys.game.config.height * 0.5 + 15, 'backgroundParchment');

        // add title to the top of the message box
        this.dialogTitle = parent.scene.add.text(parent.scene.sys.game.config.width * 0.5, parent.scene.sys.game.config.height * 0.5 - 30, title, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 16,
            color: '#ffffff'
        });

        // center title dialog
        this.dialogTitle.setOrigin(0.5, 0.5);

        // add text to dialog box
        this.dialogText = parent.scene.add.text(parent.scene.sys.game.config.width * 0.5, parent.scene.sys.game.config.height * 0.5, text, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 16,
            color: '#ffffff'
        });

        // fix positions of title and message
        this.dialogText.x = parent.scene.sys.game.config.width * 0.5 - this.dialogText.width * 0.5;
        this.dialogText.y = parent.scene.sys.game.config.height * 0.5 - this.dialogText.height * 0.5;
        this.dialogTitle.y = parent.scene.sys.game.config.height * 0.5 - this.dialogText.height * 0.5 - 10;

        // scale dialog box to fit title and message
        let backgroundScaleWidth = (this.dialogText.width + 50) / this.dialogBackground.width;
        if (((this.dialogTitle.width + 40) / this.dialogBackground.width) > backgroundScaleWidth) {
            backgroundScaleWidth = (this.dialogTitle.width + 50) / this.dialogBackground.width;
        }
        let backgroundScaleHeight = (this.dialogText.height + this.dialogTitle.height + 100) / this.dialogBackground.height;
        this.dialogBackground.setScale(backgroundScaleWidth, backgroundScaleHeight);

        // check if the dialog is a confirmation dialog
        if (confirm) {
            // add YES Button
            new Button('dialogButtonYES', ['uipack_green', 'green_boxCheckmark.png'], parent.scene.sys.game.config.width * 0.5 + 30, parent.scene.sys.game.config.height * 0.5 + this.dialogText.height * 0.5 + 35, parent.scene);
            parent.scene.dialogButtonYES.on('pointerup', this.stopDialog, this);

            // add NO Button
            new Button('dialogButtonNO', ['uipack_red', 'red_boxCross.png'], parent.scene.sys.game.config.width * 0.5 - 30, parent.scene.sys.game.config.height * 0.5 + this.dialogText.height * 0.5 + 35, parent.scene);
            parent.scene.dialogButtonNO.on('pointerup', this.stopDialog, this);
        } else {
            // add OK Button
            new Button('dialogButtonOK', ['uipack_blue', 'blue_boxTick.png'], parent.scene.sys.game.config.width * 0.5, parent.scene.sys.game.config.height * 0.5 + this.dialogText.height * 0.5 + 35, parent.scene);
            parent.scene.dialogButtonOK.on('pointerup', this.stopDialog, this);
        }
    }

    stopDialog() {
        // check if the dialog is a confirmation dialog
        if (this.confirm) {
            // remove buttons YES and NO
            this.parent.scene.dialogButtonYES.destroy();
            this.parent.scene.dialogButtonNO.destroy();
        } else {
            // remove button OK
            this.parent.scene.dialogButtonOK.destroy();
        }

        // remove message from the dialog
        this.dialogText.destroy();

        // remove title from the dialog
        this.dialogTitle.destroy();

        // remove dialog background
        this.dialogBackground.destroy();

        // remove grey transparent background
        this.greyBackground.destroy();
    }
}