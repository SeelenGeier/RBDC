function giveItem(type, name, durability, profile = saveObject.currentProfile) {
    // check if a correct profile has been selected
    if (profile == null || !saveObject.profiles.hasOwnProperty(profile)) {
        console.log('Invalid profile to give Item to');
        return false;
    }
    // check if inventory is not full
    if (Object.keys(saveObject.profiles[profile].inventory.items).length >= config.default.status.inventorySize) {
        console.log('Inventory full, maximum of ' + config.default.status.inventorySize + ' reached');
        return false;
    }
    // check if durability is a number
    if (durability != null && typeof durability != 'number') {
        console.log('Item durability is not a number');
        return false;
    }
    // check if item type exists
    if (!config.hasOwnProperty(type)) {
        console.log('Item type does not exist');
        return false;
    }
    // check if item exists in item type
    if (!config[type].hasOwnProperty(name)) {
        console.log('Item does not exist in item type');
        return false;
    }

    // generate new item ID for item to use
    let newId = this.generateItemId(profile);

    // add item to profile inventory
    saveObject.profiles[profile].inventory.items[newId] = {
        type: type,
        name: name,
        durability: durability
    };

    saveData();

    // return newly generated ID for further usage
    return newId;
}

function removeItem(id, profile = saveObject.currentProfile) {
    // check if the given item ID is even present in profile inventory
    if (!saveObject.profiles[profile].inventory.items.hasOwnProperty(id)) {
        return false;
    }

    if(saveObject.profiles[profile].character[getItem(id, profile).type] == id) {
        // unequip item if equipped
        unequiptype(getItem(id, profile).type);
    }

    // remove item from inventory
    delete saveObject.profiles[profile].inventory.items[id];

    // return true if removal was successful
    return saveObject.profiles[profile].inventory.items.hasOwnProperty(id);
}

function generateItemId(profile = saveObject.currentProfile) {
    let id = 0;

    // check every id starting at 0 if the id is already used
    while (saveObject.profiles[profile].inventory.items.hasOwnProperty(id)) {
        id++;
    }

    // return the first found id that is unused
    return id;
}

function equipItem(id, profile = saveObject.currentProfile) {

    // check if the item is a valuable which can not be equipped
    if (getItem(id, profile).type != 'valuable') {
        // set the equipped item to the selected item for the corresponding item type
        saveObject.profiles[profile].character[getItem(id, profile).type] = id;
    }
}

function unequiptype(type, profile = saveObject.currentProfile) {
    // check if the item type is 'valuable' which can not be (un)equipped
    if (type != 'valuable') {
        // unset the equipped item for the selected item type
        saveObject.profiles[profile].character[type] = null;
    }
}

function getItem(id, profile = saveObject.currentProfile) {
    // get the item for the given ID (saves typing the entire saveObject... line)
    return saveObject.profiles[profile].inventory.items[id];
}