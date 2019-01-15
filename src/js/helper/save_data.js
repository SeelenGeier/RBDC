function saveData() {
    // save data as json in local storage
    localStorage.setItem(config.default.setting.saveName, JSON.stringify(saveObject));
}

function loadData() {
    // check for existing save data
    if (localStorage.getItem(config.default.setting.saveName) !== null) {
        try {
            saveObject = JSON.parse(localStorage.getItem(config.default.setting.saveName));
        } catch (e) {
            console.log('Save data is no valid JSON.');
        }
    }
    // if validation fails build new saveObject and save it in local storage
    if (saveObject == undefined) {
        resetSave();
    }
}

function initializeSaveObject() {
    // create saveObject with initial values
    saveObject = {
        profiles: {},
        currentProfile: undefined
    };

    // check if save data is already present
    if (localStorage.getItem(config.default.setting.saveName) != undefined) {
        // backup found data before overwriting
        localStorage.setItem(config.default.setting.saveName + '_BACKUP', localStorage.getItem(config.default.setting.saveName));
        console.log('Invalid data saved as _BACKUP.');
    }

    saveData();
}

function resetSave() {
    // reset savegame in local storage
    initializeSaveObject();
    saveData();

    // reload page to prevent errors and bring up profile management
    location.reload();
}