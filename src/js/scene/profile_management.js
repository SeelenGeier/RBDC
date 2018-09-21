class profileManagementScene extends Phaser.Scene {

    constructor() {
        super({key: 'profileManagement'});
    }

    preload() {
    }

    create() {
        // add background image
        this.addBackground();

        // add headline for profile management
        this.addProfileHeadline(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.05);

        // add new profile button, label and input field
        this.addNewProfileForm(this.sys.game.config.width * 0.65, this.sys.game.config.height * 0.17);

        // show all profiles in a list
        this.showAllProfiles(this.sys.game.config.width * 0.2, this.sys.game.config.height * 0.25);
    }

    addProfileHeadline(x, y) {
        // add headline text
        this.profileHeadline = this.add.text(x, y, 'Select a Profile', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 32,
            color: '#000000'
        });
        this.profileHeadline.setOrigin(0.5, 0.5);
    }

    addNewProfileNameLabel(x, y) {
        // add label for new profile text field
        this.add.text(x, y, 'New Profile:', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 16,
            color: '#000000'
        });
    }

    addNewProfileNameField(x, y) {
        // check if input field already exists
        if (document.getElementById('newProfileName') !== null) {
            this.showProfileNameField();
        } else {
            // create input field
            let input = document.createElement('input');
            input.type = 'text';
            input.id = 'newProfileName';
            input.style = 'position: relative; left: ' + x + 'px; bottom: ' + y + 'px; width: 155px;';

            // stick input field to game canvas
            document.getElementById(gameConfig.parent).appendChild(input);
        }
    }

    hideProfileNameField() {
        // hide new profile text field via css since it is a DOM element
        document.getElementById('newProfileName').style.visibility = "hidden";
    }

    showProfileNameField() {
        // show new profile text field via css since it is a DOM element
        document.getElementById('newProfileName').style.visibility = "";
    }

    showAllProfiles(x = 0, y = 0) {
        if(this.profileListPosition == undefined) {
            this.profileListPosition = {};
            this.profileListPosition.x = x;
            this.profileListPosition.y = y;
        }
        // remove all profiles currently present
        this.clearProfileList();

        // generate a new list for profile names and backgrounds
        this.profileText = {};
        this.profileNameBackground = {};

        // add each profile individually to the lists
        let counter = 0;
        for (let profile in saveObject.profiles) {
            // add profile name
            this.addProfileNameList(this.profileListPosition.x, this.profileListPosition.y, counter, profile);

            // add delete profile button
            this.addProfileDeleteButtonList(this.profileListPosition.x, this.profileListPosition.y, counter, profile);

            // increment counter for next row
            counter++;
        }
    }

    addNewProfileForm(x, y) {
        this.addNewProfileButton(x, y);
        this.addNewProfileNameLabel(this.buttonNewProfile.x - 190, this.buttonNewProfile.y - 30);
        this.addNewProfileNameField(this.buttonNewProfile.x - 190, this.sys.game.config.height - this.buttonNewProfile.y + 13);
    }

    createNewProfile() {
        // get profile name from DOM input
        let newProfileName = document.getElementById('newProfileName').value;
        document.getElementById('newProfileName').value = '';

        // check for input
        if (newProfileName !== '') {
            // check if profile already exists
            if (saveObject.profiles[newProfileName] == undefined) {
                // create new profile
                saveObject.profiles[newProfileName] = {
                    scene: 'profileOverview', // always start new profiles in overview scene
                    sound: true,
                    music: true,
                    inventory: {
                        currency: config.default.status.currency,
                        items: {}
                    },
                    character: {
                        weapon: null,
                        armor: null,
                        offhand: null,
                        trinket: null
                    }
                };

                // hand out initial equipment to profile
                this.setInitialEquipment(newProfileName);

                saveData();

                // update list of profiles
                this.showAllProfiles();
            } else {
                // if profile with the same name already exists, show info dialog
                new Dialog('Name Invalid', 'Profile \'' + newProfileName + '\' already exists.', this.scene);
            }
        }
    }

    confirmDeleteProfile() {
        // show confirmation dialog for deleting a profile
        new Dialog('Delete Profile', 'Do you want to delete \'' + this.profile + '\'?', this, true);

        // only delete profile if the YES button has been pressed
        this.scene.dialogButtonYES.on('pointerup', this.scene.deleteProfile, this);
    }

    deleteProfile() {
        // delete profile from saveObject
        delete saveObject.profiles[this.profile];

        // unset the current profile if it got deleted
        if(saveObject.currentProfile == this.profile) {
            saveObject.currentProfile = null;
        }

        saveData();

        // update profile list
        this.scene.showAllProfiles();
    }

    selectProfile() {
        // set selected profile as current profile
        saveObject.currentProfile = this.profile;
        saveData();

        // hide input field and load profile overview
        this.scene.hideProfileNameField();
        this.scene.scene.sleep();
        this.scene.scene.start(saveObject.profiles[saveObject.currentProfile].scene);
    }

    addProfileNameList(x, y, counter, profile) {
        // add background for profile to given position based on counter
        this.profileNameBackground[counter] = this.add.sprite(x, y, 'uipack_rpg', 'buttonLong_grey_pressed.png');
        this.profileNameBackground[counter].setOrigin(0,0);

        // make profile background also clickable
        this.profileNameBackground[counter].setInteractive();
        this.profileNameBackground[counter].profile = profile;
        this.profileNameBackground[counter].on('pointerup', this.selectProfile, this.profileText[counter]);

        // add profile name to given position based on counter
        this.profileText[counter] = this.add.text(x, y + 52 * counter + 6, profile, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#000000'
        });

        // make profile name able to select profile (like a button
        this.profileText[counter].setInteractive();
        this.profileText[counter].profile = profile;
        this.profileText[counter].on('pointerup', this.selectProfile, this.profileText[counter]);

        // adjust position and scale of profile background depending on profile name
        this.profileNameBackground[counter].setX(this.profileText[counter].x-10);
        this.profileNameBackground[counter].setY(this.profileText[counter].y-10);
        this.profileNameBackground[counter].setScale((this.profileText[counter].width+20)/this.profileNameBackground[counter].width, (this.profileText[counter].height+20)/this.profileNameBackground[counter].height);
    }

    addProfileDeleteButtonList(x, y, counter, profile) {
        // add delete button for given profile
        new Button('profile' + counter + '_delete', ['uipack_red', 'red_boxCross.png'], x - 40, y + 52 * counter + 18, this);
        this['profile' + counter + '_delete'].profile = profile;
        this['profile' + counter + '_delete'].on('pointerup', this.confirmDeleteProfile, this['profile' + counter + '_delete']);
    }

    clearProfileList() {
        // remove all currently shown profiles
        let counter = 0;
        for (let profile in this.profileText) {
            this.profileText[counter].destroy();
            this.profileNameBackground[counter].destroy();
            this['profile' + counter + '_delete'].destroy();
            counter++;
        }
    }

    addBackground() {
        // add background image in the center of the screen
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundBeige');

        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
    }

    addNewProfileButton(x, y) {
        // add button to confirm new profile name given in input field
        new Button('buttonNewProfile', ['uipack_green', 'green_boxCheckmark.png'], x, y, this);
        this.buttonNewProfile.on('pointerup', this.createNewProfile, this);

        // enable ENTER key to be used as well
        this.input.keyboard.on('keydown_ENTER', this.createNewProfile, this);
    }

    setInitialEquipment(profile) {
        // go through default equipment in configuration
        for (let itemType in config.default.equipment) {
            // check if any equipment is set
            if(config.default.equipment[itemType] != null) {
                // give item to profile
                let id = giveItem(itemType, config.default.equipment[itemType], null, profile);

                // equip initial items immediately
                equipItem(id, profile);
            }
        }

        // TODO: replace starter items with config
        // give some additional items to player (TEMPORARY)
        giveItem('weapon', 'sword', 100, profile);
        giveItem('weapon', 'axe', 30, profile);
        giveItem('armor', 'helmet', 50, profile);
    }
}