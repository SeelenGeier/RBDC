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
    let newId = generateItemId(profile);

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

function removeItem(id, profile = saveObject.currentProfile, trackItemLoss = true) {
    // check if the given item ID is even present in profile inventory
    if (!saveObject.profiles[profile].inventory.items.hasOwnProperty(id)) {
        return false;
    }

    if(saveObject.profiles[profile].character[getItem(id, profile).type] == id) {
        // unequip item if equipped
        unequiptype(getItem(id, profile).type);
    }

    // add item to acquired items list
    if(trackItemLoss) {
        saveObject.profiles[saveObject.currentProfile].itemsLost[Object.keys(saveObject.profiles[saveObject.currentProfile].itemsLost).length] = getItem(id, profile);
    }

    // remove item from inventory
    delete saveObject.profiles[profile].inventory.items[id];

    // fix keys for all items after the sold item
    for (let itemId in saveObject.profiles[saveObject.currentProfile].inventory.items) {
        if (itemId > id) {
            // move item id one up
            saveObject.profiles[saveObject.currentProfile].inventory.items[itemId - 1] = saveObject.profiles[saveObject.currentProfile].inventory.items[itemId];

            // check if moved item is currently equipped
            if (saveObject.profiles[saveObject.currentProfile].character[getItem(itemId).type] == itemId) {
                // equip same item with new id
                equipItem(itemId - 1);
            }

            // remove item with old id
            removeItem(itemId, profile, false);
        }
    }

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

function getItemValue(item) {
    let currentValue;

    itemInfo = config[item.type][item.name];
    currentValue = Math.trunc(itemInfo.value * item.durability / saveObject.profiles[saveObject.currentProfile].highscoreRoomsCleared);
    return currentValue;
}

function getRandomItem(quality = 1, category = null, logItem = true) {
    let type;
    let durability;
    let keys = [];

    if(category == null) {
        let chance = Math.random();
        if (chance < 0.25) {
            category = 'weapon';
        } else if (chance < 0.50) {
            category = 'armor';
        } else if (chance < 0.75) {
            category = 'offhand';
        } else if (chance < 0.95) {
            category = 'trinket';
        } else {
            category = 'valuable';
        }
    }

    for (let prop in config[category]) {
        if (config[category].hasOwnProperty(prop)) {
            keys.push(prop);
        }
    }
    type = keys[keys.length * Math.random() << 0];

    // calculate durability based on quality and current rooms cleared
    durability = config.default.setting.defaultItemDurability + Math.trunc(Math.random() * saveObject.profiles[saveObject.currentProfile].roomsCleared * quality);

    let item = {
        type: category,
        name: type,
        durability: durability
    };

    if(logItem == true) {
        // add item to acquired items list
        saveObject.profiles[saveObject.currentProfile].itemsAcquired[Object.keys(saveObject.profiles[saveObject.currentProfile].itemsAcquired).length] = item;
    }

    return item;
}

function generateRareShopItems() {
    // get next numerical ID for shop items depending on configuration
    let nextItemId = Object.keys(config.default.commonShopItems).length;

    // empty current rare items list
    saveObject.profiles[saveObject.currentProfile].rareShopItems = {};

    // generate some items for each equipment type
    let equipmentTypes = {'weapon': null, 'offhand': null, 'armor': null, 'trinket': null};
    for (let equipmentType in equipmentTypes) {
        // generate 0-3 items for each category
        let i;
        for(i = 1; i < (Math.random()*4);i++) {
            let randomItem = getRandomItem(null, equipmentType, false);
            saveObject.profiles[saveObject.currentProfile].rareShopItems[nextItemId] = randomItem;
            nextItemId++;
        }
    }

    // save rare items
    saveData();
}