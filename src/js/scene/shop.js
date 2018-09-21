class shopScene extends Phaser.Scene {

    constructor() {
        super({key: 'shop'});
    }

    preload() {

    }

    create() {
        this.maxItemsDisplayed = 7;
        this.itemsOffset = 0;
        this.itemsDisplayed = {};
        this.selectedItems = {};

        // always start in buy mode
        this.currentMode = 'buy';

        // add background image
        this.addBackground();

        // add button to exit the shop
        this.addNavigationExit(this.sys.game.config.width * 0.9, this.sys.game.config.height * 0.5);

        // show buy/sell button at the top
        this.addTabNavigation(this.sys.game.config.width * 0.4, this.sys.game.config.height * 0.1);

        // add background image for tabs to use as orientation for tab content
        this.addTabBackground(this.sys.game.config.width * 0.07, this.sys.game.config.height * 0.2);

        // add up button to navigate list
        this.addUpButton(this.sys.game.config.width * 0.45, this.sys.game.config.height * 0.2);

        // add up button to navigate list
        this.addDownButton(this.sys.game.config.width * 0.45, this.sys.game.config.height * 0.95);

        // add buy/sell button to buy/sell selected items
        this.addBuySellSelectedButton(this.sys.game.config.width * 0.75, this.sys.game.config.height * 0.07);

        // add buy/sell button to buy/sell selected items
        this.addUnselectButton(this.sys.game.config.width * 0.85, this.sys.game.config.height * 0.08);

        // display buy tab
        this.displayTab();
    }

    addBackground() {
        // add background image in the center of the screen
        this.backgroundImage = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.5, 'backgroundBeige');

        // scale background to screen size and add a few more pixels to prevent flickering
        this.backgroundImage.setScale((this.sys.game.config.width + 10) / this.backgroundImage.width, (this.sys.game.config.height + 10) / this.backgroundImage.height);
    }

    addTabBackground(x, y) {
        // add background image for tabs
        this.backgroundTabImage = this.add.sprite(x, y, 'backgroundTab');
        this.backgroundTabImage.setOrigin(0, 0);

        // scale tab background to fit tab content
        this.backgroundTabImage.setScale(this.sys.game.config.width * 0.75 / this.backgroundTabImage.width, this.sys.game.config.height * 0.75 / this.backgroundTabImage.height);
    }

    addNavigationExit(x, y) {
        // add navigation button to return to profile overview and register corresponding function
        new Button('buttonExit', ['gameicons', 'door.png'], x, y, this);
        this.buttonExit.on('pointerup', this.exitShop, this);
        this.buttonExit.setTint(0x996666);
    }

    exitShop() {
        // hide current scene and start config scene
        this.scene.sleep();
        this.scene.start('profileOverview');
    }

    addTabNavigation(x, y) {
        // add button to switch to sell tab
        this.addSellTabButton(x - 50, y);

        // add text for sell button
        this.addSellTabText(x - 50, y + 40);

        // add button to switch to buy tab
        this.addBuyTabButton(x + 50, y);

        // add text for buy button
        this.addBuyTabText(x + 50, y + 40);
    }

    displayTab() {
        let processedItemsCounter = 0;
        let that;
        let items;
        let mode;

        // check if context is within a button press or function has been called individually
        if (this[0] == undefined) {
            // if function has been called individually, take items and mode from 'this' context and write context for later use in 'that'
            that = this;
            if (this.currentMode == 'sell') {
                items = saveObject.profiles[saveObject.currentProfile].inventory.items;
            } else if (this.currentMode == 'buy') {
                items = this.getBuyableItems();
            }
            mode = this.currentMode;
        } else {
            // if button has been pressed, take items and mode from button input (this = array) and write context for later use in 'that'
            that = this[0];
            items = this[1];
            mode = this[2];

            // reset item offset to always start on the top
            that.itemsOffset = 0;

            // clear list of selected items
            that.selectedItems = {};

            // hide buy/sell and unselect button since no items are selected
            that.buttonUnselectAll.alpha = 0;
            that.buttonBuySellSelected.alpha = 0;

            // reset button tint on up and down buttons
            that.buttonUp.setTint(0xffffff);
            that.buttonDown.setTint(0xffffff);

            // update display of currency and total value of selected items
            that.updateCurrency();
        }

        // check if tab is for selling or buying and change background accordingly
        if (mode == 'sell') {
            // color tab background slightly red to indicate sell mode
            that.backgroundTabImage.setTint(0xff6666);
            that.currentMode = 'sell';
        } else if (mode == 'buy') {
            // color tab background slightly green to indicate buy mode
            that.backgroundTabImage.setTint(0x99ff99);
            that.currentMode = 'buy';
        }

        // clear all items that are currently displayed on the tab
        that.clearDisplayedItems();

        // go through all items in inventory
        for (let itemId in items) {
            // check if max amount of items are already displayed
            if (Object.keys(that.itemsDisplayed).length >= that.maxItemsDisplayed) {
                // abort the loop
                break;
            }

            // check if the offset has been reached (position to start when scrolled down or up)
            if (processedItemsCounter >= that.itemsOffset) {
                // display the item in a new row depending on the item position
                that.displayItemRow(items[itemId]);
            }

            // increment the counter of processed Items and continue loop
            processedItemsCounter++;
        }
    }

    displayItemRow(item) {
        // define item id based on current amount of items displayed
        let itemId = Object.keys(this.itemsDisplayed).length;

        // add new item to displayed items
        this.itemsDisplayed[itemId] = {};

        // display image of item on the left side
        this.itemsDisplayed[itemId].image = this.add.sprite(this.backgroundTabImage.x + 50, this.backgroundTabImage.y - 10 + (64 * Object.keys(this.itemsDisplayed).length), config[item.itemType][item.itemName].image);

        // display item name
        this.itemsDisplayed[itemId].headlineText = this.add.text(this.itemsDisplayed[itemId].image.x + this.itemsDisplayed[itemId].image.width * 0.5,
            this.itemsDisplayed[itemId].image.y - this.itemsDisplayed[itemId].image.height * 0.5 + 5, config[item.itemType][item.itemName].name, {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 20,
                color: '#99ffff'
            });

        // display item durability
        this.itemsDisplayed[itemId].durabilityText = this.add.text(this.itemsDisplayed[itemId].image.x + this.itemsDisplayed[itemId].image.width * 0.5,
            this.itemsDisplayed[itemId].image.y - this.itemsDisplayed[itemId].image.height * 0.5 + 25, 'Durability: ' + item.durability, {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 16,
                color: '#ffffff'
            });

        // display value
        this.itemsDisplayed[itemId].valueText = this.add.text(this.itemsDisplayed[itemId].image.x + this.itemsDisplayed[itemId].image.width * 0.5,
            this.itemsDisplayed[itemId].image.y - this.itemsDisplayed[itemId].image.height * 0.5 + 41, 'Value: ' + config[item.itemType][item.itemName].value, {
                fontFamily: config.default.setting.fontFamily,
                fontSize: 16,
                color: '#ffffff'
            });

        // TODO: display damage/mitigation values

        // add overlay to select list entry
        this.itemsDisplayed[itemId].overlay = this.add.sprite(this.backgroundTabImage.getTopLeft().x + 15, this.backgroundTabImage.getTopLeft().y - 10 + (64 * Object.keys(this.itemsDisplayed).length), 'backgroundTab');
        this.itemsDisplayed[itemId].overlay.setScale((this.backgroundTabImage.width - 10) * this.backgroundTabImage.scaleX / this.itemsDisplayed[itemId].overlay.width, 58 / this.itemsDisplayed[itemId].overlay.height);
        this.itemsDisplayed[itemId].overlay.alpha = 0.001;
        this.itemsDisplayed[itemId].overlay.setOrigin(0, 0.5);

        // check if clicked item has already been selected
        if (this.selectedItems.hasOwnProperty(itemId + this.itemsOffset)) {
            // color item slightly yellow to indicate selection
            this.itemsDisplayed[itemId].overlay.alpha = 0.5;
        }

        // make overlay clickable to select the entry
        this.itemsDisplayed[itemId].overlay.setInteractive();
        this.itemsDisplayed[itemId].overlay.on('pointerup', this.selectItem, [this, itemId]);
    }

    selectItem() {
        let that = this[0];
        let clickedItem = this[1];

        // check if clicked item has already been selected
        if (that.selectedItems.hasOwnProperty(clickedItem + that.itemsOffset)) {
            // remove item from selected items
            delete that.selectedItems[clickedItem + that.itemsOffset];

            // color item slightly yellow to indicate selection
            that.itemsDisplayed[clickedItem].overlay.alpha = 0.001;
        } else {
            // add item to selected items
            that.selectedItems[clickedItem + that.itemsOffset] = 'selected';

            // remove selection color from item overlay
            that.itemsDisplayed[clickedItem].overlay.alpha = 0.5;
        }

        // update display of currency and total value of selected items
        that.updateCurrency();

        if (Object.keys(that.selectedItems).length > 0) {
            // hide buy/sell and unselect button since no items are selected
            that.buttonUnselectAll.alpha = 1;
            that.buttonBuySellSelected.alpha = 1;
        } else {
            // hide buy/sell and unselect button since no items are selected
            that.buttonUnselectAll.alpha = 0;
            that.buttonBuySellSelected.alpha = 0;
        }
    }

    updateCurrency() {
        let allItems;
        let totalText = '';

        // get item list depending on current mode
        if (this.currentMode == 'buy') {
            // get all buyable shop items
            allItems = this.getBuyableItems();
        } else if (this.currentMode == 'sell') {
            // use inventory items
            allItems = saveObject.profiles[saveObject.currentProfile].inventory.items;
        }

        // get total value of all selected items
        let totalValue = 0;
        for (let selectedItem in this.selectedItems) {
            totalValue += config[allItems[selectedItem].itemType][allItems[selectedItem].itemName].value;
        }

        // update text under buy/sell button to display current currency and value of selected items
        if (totalValue > 0) {
            totalText = ' (' + totalValue + ')';
        }
        this.textBuySellSelected.setText(saveObject.profiles[saveObject.currentProfile].inventory.currency + totalText);
    }

    clearDisplayedItems() {
        for (let itemId in this.itemsDisplayed) {
            // remove all text or sprites currently displayed
            for (let spriteOrTextId in this.itemsDisplayed[itemId]) {
                this.itemsDisplayed[itemId][spriteOrTextId].destroy();
            }
            // remove item from displayed items list
            delete this.itemsDisplayed[itemId];
        }
    }

    addSellTabButton(x, y) {
        // add sell button
        new Button('buttonSellTab', ['gameicons', 'export.png'], x, y, this);
        this.buttonSellTab.on('pointerup', this.displayTab, [this, saveObject.profiles[saveObject.currentProfile].inventory.items, 'sell']);
        this.buttonSellTab.setTint(0xcc0000);
    }

    addSellTabText(x, y) {
        // add text 'sell' below sell button
        this.textSellTab = this.add.text(x, y, 'SELL', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#cc0000'
        });
        this.textSellTab.setOrigin(0.5, 0.5);

        // enable text to be clickable as well
        this.textSellTab.setInteractive();
        this.textSellTab.on('pointerup', this.displayTab, [this, saveObject.profiles[saveObject.currentProfile].inventory.items, 'sell']);
    }

    addBuyTabButton(x, y) {
        // add buy button
        new Button('buttonBuyTab', ['gameicons', 'import.png'], x, y, this);
        this.buttonBuyTab.on('pointerup', this.displayTab, [this, this.getBuyableItems(), 'buy']);
        this.buttonBuyTab.setTint(0x00cc00);
    }

    addBuyTabText(x, y) {
        // add text 'buy' below buy button
        this.textBuyTab = this.add.text(x, y, 'BUY', {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 24,
            color: '#00cc00'
        });
        this.textBuyTab.setOrigin(0.5, 0.5);

        // enable text to be clickable as well
        this.textBuyTab.setInteractive();
        this.textBuyTab.on('pointerup', this.displayTab, [this, this.getBuyableItems(), 'buy']);
    }

    getBuyableItems() {
        let buyableItems = {};

        // add always available items
        buyableItems = this.addCommonShopItems(buyableItems);

        // add rare items that change after each run
        buyableItems = this.addRareShopItems(buyableItems);

        return buyableItems;
    }

    addCommonShopItems(items) {
        // TODO: use config to get common items
        items[0] = {itemName: 'sword', itemType: 'weapon', durability: 100};
        items[1] = {itemName: 'axe', itemType: 'weapon', durability: 70};
        items[2] = {itemName: 'light_leather', itemType: 'armor', durability: 150};
        items[3] = {itemName: 'sword', itemType: 'weapon', durability: 234};
        items[4] = {itemName: 'iron', itemType: 'armor', durability: 400};
        items[5] = {itemName: 'axe', itemType: 'weapon', durability: 352};
        items[6] = {itemName: 'sword', itemType: 'weapon', durability: 2};
        items[7] = {itemName: 'axe', itemType: 'weapon', durability: 5};
        items[8] = {itemName: 'helmet', itemType: 'armor', durability: 300};
        items[9] = {itemName: 'light_leather', itemType: 'armor', durability: 160};

        return items;
    }

    addRareShopItems(items) {
        // TODO: use saved rare items that have been generated after a run
        items[10] = {itemName: 'lamp', itemType: 'trinket', durability: 1};
        items[11] = {itemName: 'torch', itemType: 'offhand', durability: 2};

        return items;
    }

    addUpButton(x, y) {
        // add button to scroll up on the item list
        new Button('buttonUp', ['gameicons', 'up.png'], x, y, this);
        this.buttonUp.on('pointerup', this.scrollUp, this);
    }

    addDownButton(x, y) {
        // add button to scroll down on the item list
        new Button('buttonDown', ['gameicons', 'down.png'], x, y, this);
        this.buttonDown.on('pointerup', this.scrollDown, this);
    }

    scrollDown() {
        // increase offset which makes the list go up when generated next time
        this.itemsOffset++;

        // check if tab is currently in sell mode and the offset would be higher than the amount of items in the inventory (minus the displayed item count)
        if (this.currentMode == 'sell' && this.itemsOffset > Object.keys(saveObject.profiles[saveObject.currentProfile].inventory.items).length - this.maxItemsDisplayed) {
            // make offset stop at highest value to show only up the last entry and not further (which would be empty entries afterwards)
            this.itemsOffset = Object.keys(saveObject.profiles[saveObject.currentProfile].inventory.items).length - this.maxItemsDisplayed;

            // color button slightly red to indicate no further scrolling possible
            this.buttonDown.setTint(0xff4444);
        }

        // check if tab is currently in buy mode and the offset would be higher than the amount of buyable items in the shop (minus the displayed item count)
        if (this.currentMode == 'buy' && this.itemsOffset > Object.keys(this.getBuyableItems()).length - this.maxItemsDisplayed) {
            // make offset stop at highest value to show only up the last entry and not further (which would be empty entries afterwards)
            this.itemsOffset = Object.keys(this.getBuyableItems()).length - this.maxItemsDisplayed;

            // color button slightly red to indicate no further scrolling possible
            this.buttonDown.setTint(0xff4444);
        }

        // reset up button to show that scrolling up could be possible again
        this.buttonUp.setTint(0xffffff);

        // redraw tab items with new offset
        this.displayTab();
    }

    scrollUp() {
        // decrease offset which makes the list go down when generated next time
        this.itemsOffset--;

        // check if offset is already at the highest point in the list
        if (this.itemsOffset < 0) {
            // make sure to not go higher in the list to prevent showing empty entries
            this.itemsOffset = 0;

            // color button slightly red to indicate no further scrolling possible
            this.buttonUp.setTint(0xff9999);
        }

        // reset down button to show that scrolling down could be possible again
        this.buttonDown.setTint(0xffffff);

        // redraw tab items with new offset
        this.displayTab();
    }

    addBuySellSelectedButton(x, y) {
        // add dollar sign as button for buying/selling selected items
        this.buttonBuySellSelected = this.add.text(x, y, '$', {
            fontFamily: 'Arial',
            fontSize: 42,
            fontStyle: 'bold',
            color: '#dddd00'
        });
        this.buttonBuySellSelected.setStroke('#444444', 4);
        this.buttonBuySellSelected.setInteractive();
        this.buttonBuySellSelected.on('pointerup', this.confirmBuySell, this);

        // hide buy/sell and unselect button since no items are selected
        this.buttonBuySellSelected.alpha = 0;

        // display current amount of currency
        this.textBuySellSelected = this.add.text(x, y + 50, saveObject.profiles[saveObject.currentProfile].inventory.currency, {
            fontFamily: config.default.setting.fontFamily,
            fontSize: 20,
            color: '#dddd00'
        });
        this.textBuySellSelected.setStroke('#444444', 4);

        // add icon next to currency
        this.imageBuySellSelected = this.add.sprite(x - 20, y + 65, 'currency');
        this.imageBuySellSelected.setScale(0.75);
    }

    confirmBuySell() {
        // get all items depending on the current selected mode
        if (this.currentMode == 'buy') {
            // show confirmation dialog for buying selected items
            new Dialog('Buy selected Items', 'Do you want to buy these ' + Object.keys(this.selectedItems).length + ' selected items?', this.scene, true);

            // only delete profile if the YES button has been pressed
            this.dialogButtonYES.on('pointerup', this.buySelected, this);
        } else if (this.currentMode == 'sell') {
            new Dialog('Sell selected Items', 'Do you want to sell these ' + Object.keys(this.selectedItems).length + ' selected items?', this.scene, true);

            // only delete profile if the YES button has been pressed
            this.dialogButtonYES.on('pointerup', this.sellSelected, this);
        }
    }

    sellSelected() {
        // get inventory items
        let soldItems = 0;

        // loop through all selected items
        for (let selectedItem in this.selectedItems) {
            // subtract amount of sold items to compensate for key offset after selling an item
            let currentItem = selectedItem - soldItems;

            // get infos on current item including the value
            let currentItemInfo = config[saveObject.profiles[saveObject.currentProfile].inventory.items[currentItem].itemType][saveObject.profiles[saveObject.currentProfile].inventory.items[currentItem].itemName];

            // add value to currency
            saveObject.profiles[saveObject.currentProfile].inventory.currency += currentItemInfo.value;

            // remove item from inventory
            removeItem(currentItem);

            // increment the amount of sold items to compensate for key offset later
            soldItems++;

            for (let itemId in saveObject.profiles[saveObject.currentProfile].inventory.items) {
                if (itemId > currentItem) {
                    // move item id one up
                    saveObject.profiles[saveObject.currentProfile].inventory.items[itemId - 1] = saveObject.profiles[saveObject.currentProfile].inventory.items[itemId];

                    // check if moved item is currently equipped
                    if (saveObject.profiles[saveObject.currentProfile].character[getItem(itemId).itemType] == itemId) {
                        // equip same item with new id
                        equipItem(itemId - 1);
                    }

                    // remove item with old id
                    removeItem(itemId);
                }
            }
        }

        // save changes to profile
        saveData();

        // clear list of selected items
        this.selectedItems = {};

        // hide buy/sell and unselect button since no items are selected
        this.buttonUnselectAll.alpha = 0;
        this.buttonBuySellSelected.alpha = 0;

        // reset item offset
        this.itemsOffset = 0;

        // redraw tab items with items
        this.displayTab();

        // update display of currency and total value of selected items
        this.updateCurrency();
    }

    buySelected() {
        // get all buyable shop items
        let allItems = this.getBuyableItems();

        // get total value of all selected items
        let totalValue = 0;
        for (let selectedItem in this.selectedItems) {
            totalValue += config[allItems[selectedItem].itemType][allItems[selectedItem].itemName].value;
        }

        // check if player has enough currency to buy all selected items
        if (totalValue > saveObject.profiles[saveObject.currentProfile].inventory.currency) {
            // show error message
            new Dialog('Not enough currency', 'You do not have enough currency\nto buy all selected items!', this.scene);

            // cancel buy process
            return false;
        }

        // loop through all selected items
        for (let selectedItem in this.selectedItems) {
            // add item to inventory
            giveItem(allItems[selectedItem].itemType, allItems[selectedItem].itemName, allItems[selectedItem].durability);

            // remove value from currency
            saveObject.profiles[saveObject.currentProfile].inventory.currency -= config[allItems[selectedItem].itemType][allItems[selectedItem].itemName].value;
        }

        // save changes to profile
        saveData();

        // clear list of selected items
        this.selectedItems = {};

        // hide buy/sell and unselect button since no items are selected
        this.buttonUnselectAll.alpha = 0;
        this.buttonBuySellSelected.alpha = 0;

        // reset item offset
        this.itemsOffset = 0;

        // redraw tab items with items
        this.displayTab();

        // update display of currency and total value of selected items
        this.updateCurrency();
    }

    addUnselectButton(x, y) {
        // add dollar sign as button for buying/selling selected items
        this.buttonUnselectAll = this.add.text(x, y, 'X', {
            fontFamily: 'Arial',
            fontSize: 32,
            fontStyle: 'bold',
            color: '#dd4444'
        });
        this.buttonUnselectAll.setStroke('#444444', 4);
        this.buttonUnselectAll.setInteractive();
        this.buttonUnselectAll.on('pointerup', this.unselectAll, this);

        // hide unselect button at first when no item is selected
        this.buttonUnselectAll.alpha = 0;
    }

    unselectAll() {
        // clear list of selected items
        this.selectedItems = {};

        // reset item offset
        this.itemsOffset = 0;

        // hide buy/sell and unselect button since no items are selected
        this.buttonUnselectAll.alpha = 0;
        this.buttonBuySellSelected.alpha = 0;

        // redraw tab items with items
        this.displayTab();

        // update display of currency and total value of selected items
        this.updateCurrency();
    }
}