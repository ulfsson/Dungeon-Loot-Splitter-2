// Global references that will be accessed frequently.
const partyNumberInput = document.getElementById('partyNumber');
const lootTable = document.getElementById('lootTable');

// Global variables.
let lootList = []; // Set up the loot list array.
let partySize = 1; // Global variable for the party size.
let totalLootPartyValue = 0.0; // For use when splitting value in the party.
let totalLootQuantity = 0;


// Class for creating individual items of loot, and provides a couple of nice features.
class LootItem {
    constructor(name, value = 0.0, quantity = 1, rarity = 1) {
        this.name = name;
        this.quantity = Number(quantity);
        this.value = Number(value);

        // Default rarity value to the standard "common" just in case an invalid value gets snuck in.
        this.rarity = Number(rarity);
        if (isNaN(this.rarity)) this.rarity = 1;
    }

    // Returns an item's base value modified by an amount congruent with higher "tiers" of rarity/quality.
    // This "rarity" setup is more inspired by MMORPG quality tiers.
    get rarityValue() {
        switch(this.rarity) {
            case 0: return this.value * 0.75; // Poor
            case 1: return this.value; // Common
            case 2: return this.value * 1.25; // Uncommon
            case 3: return this.value * 1.50; // Rare
            case 4: return this.value * 1.75; // Epic
            default: return this.value;
        }
    }

    // Returns the string name of the rarity numerical value on the object.
    get rarityName() {
        switch(this.rarity) {
            case 0: return "Poor";
            case 1: return "Common";
            case 2: return "Uncommon";
            case 3: return "Rare";
            case 4: return "Epic";
            default: return "Common"; // Just in case some other value sneaks in.
        }
    }
}


// A simple class for storing the loot given to player-characters.7
class PlayerCharacter {
    constructor(playerNumber, loot = []) {
        this.playerNumber = playerNumber;
        this.loot = loot;
    }

    // The loot parameter MUST be of type LootItem!
    giveLoot(loot) {
        // Only if the object is LootItem type will it be added.
        if (loot instanceof LootItem) {
            this.loot.push(loot);
        }
    }
}


// This function looks at how many pieces of loot are available, looks at how many players have been defined,
// then does a simple division for loot distribution. Of course, if there are more players than loot then
// some players may not get any (will be a float less than 1.0).
function splitLoot() {
    // With the way the code logic is written this should NEVER happen, but in the world of
    // HTML and JavaScript anything is possible, so better safe than sorry. Don't want a divide by zero.
    // Also, why does JavaScript return Infinity in a 1/0 situation? In proper math It's UNDEFINED.
    // As you approach zero, it goes toward infinity, but it is NOT actually infinity!
    // Furthermore 0/0 results in NaN?? JavaScript, why??!!
    if (partySize < 1) return;

    document.getElementById('totalLoot').innerText = totalLootQuantity;
    document.getElementById('lootPerPlayer').innerText = (totalLootQuantity / partySize).toFixed(2);
    document.getElementById('lootValueTotal').innerText = (totalLootPartyValue).toFixed(2);
    document.getElementById('lootValuePerPlayer').innerText = (totalLootPartyValue / partySize).toFixed(2);

    if (lootList.length === 0) {
        document.getElementById('lootSplitOutput').style.display = "none";
    } else {
        document.getElementById('lootSplitOutput').style.display = "block";
    }
}


// Creates the table rows for the loot list table and unhides/hides it based on available data.
// I realize this is a little ugly and could be accomplished with divs, but I largely wanted to
// see if I could apply the assignment concepts to my existing table structure. I may refactor
// this in the next assignment.
function renderLoot() {
    lootTable.innerHTML = "";
    totalLootPartyValue = 0.0;
    totalLootQuantity = 0;

    // When updating the loot table, if the length is zero we just blank it out, hide it, and bail.
    if (lootList.length === 0) {
        lootTable.style.display = "none";
        lootTable.innerHTML = "";
        document.getElementById('no-loot-message').style.display = "block";
        updateUI();
        return;
    }

    let lootTableHeader = `
        <tr>
            <th>
                Item Name
            </th>

            <th>
                Quantity
            </th>

            <th>
                Quality
            </th>
            
            <th>
                Base Value
            </th>
            
            <th>
                Quality Value
            </th>

            <th>
                Total Value
            </th>

            <th>
                Remove
            </th>
        </tr>
        `;

    lootTable.insertAdjacentHTML("afterbegin", lootTableHeader);

    // For adding up the totals in the loop below.
    let totalLootBaseValue = 0.0;
    let totalLootRarityValue = 0.0;

    // Loop through each loot item in lootList, total up values, and build a new row for it in the loot table.
    for (const [index, item] of lootList.entries()) {
        totalLootQuantity += item.quantity;
        totalLootBaseValue += item.value;
        totalLootRarityValue += item.rarityValue;
        totalLootPartyValue += (item.rarityValue * item.quantity);
        let lootTableRow = document.createElement("tr");
        let lootRowData = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.rarityName}</td>
            <td>${item.value.toFixed(2)}</td>
            <td>${item.rarityValue.toFixed(2)}</td>
            <td>${(item.rarityValue * item.quantity).toFixed(2)}</td>
            `

        lootTableRow.innerHTML = lootRowData;
        
        // Build the remove button. This used to be a div, but now it's an actual button because why not.
        let removeCell = document.createElement("td");
        let removeButton = document.createElement("button");
        removeButton.innerText = "❌";
        removeButton.className = "removeFromLootButton";
        
        removeCell.appendChild(removeButton);
        lootTableRow.appendChild(removeCell);
        lootTable.appendChild(lootTableRow);
        
        removeButton.addEventListener("click", function() { removeLoot(index) });
    }

    // The spacer line between the last item and the totals line.
    lootTable.insertAdjacentHTML("beforeend", `<tr><td colspan="9">&nbsp;</td></tr>`);

    // Create the new row that will be the totals line and load it up with data.
    let lootTotalRow = document.createElement("tr");
    lootTotalRow.innerHTML = `
        <td><b>Totals:</b></td>
        <td>${totalLootQuantity}</td>
        <td></td>
        <td></td>
        <td></td>
        <td>${totalLootPartyValue.toFixed(2)}</td>
        <td></td>
        `;

    lootTable.appendChild(lootTotalRow);
    
    document.getElementById('no-loot-message').style.display = "none"; // Hide the "no loot to display" message.

    lootTable.style.display = "table";

    updateUI();
}


// This adds loot to the lootList global array, using the name, quantity, value, and quality/rarity selector.
// This makes use of a custom class to construct the loot object.
function addLoot() {
    const lootForm = document.querySelector('#lootForm'); // Get a reference to the loot form itself.
    let itemName = lootForm.elements['lootname'].value.trim(); // Make sure we trim whitespace from the name.
    
    // No adding loot with a blank name or just numbers.
    if (itemName === "") return;
    if (!isNaN(Number(itemName))) return;
    
    // Quantities less than 1 will default to at least 1.
    let [itemQuantity, wasInputValid] = forcePositiveNonZeroInteger(lootForm.elements['lootquantity'].value);
    if (!wasInputValid) lootForm.elements['lootquantity'].value = itemQuantity;

    // These variables declared later as there's no sense in doing so early if the above checks return.
    let itemValue = lootForm.elements['lootvalue'].value;
    let itemRarity = lootForm.elements['lootquality'].value;

    // Do a bit of sanity check. In the event the loot value isn't a number, default to zero.
    // If it's a negative number, will do the absolute value instead. No negative value allowed!
    itemValue = Number(Math.abs(itemValue))
    if (isNaN(itemValue)) {
        itemValue = 0.0;
        lootForm.elements['lootvalue'].value = itemValue;
    }
    
    // Construct the new loot item using our custom class using the name, value, and rarity, and push it onto the array.
    let newLoot = new LootItem(itemName, itemValue, itemQuantity, itemRarity);
    lootList.push(newLoot);

    renderLoot();
}


function removeLoot(index) {
    if (isNaN(Number(index)) || index === null) return; // Bail out in the event of a bad index value. This shouldn't happen but with JavaScript you never know.
    lootList.splice(index, 1); // Splices out the index of the loot passed into it, therefore removing it from the array.
    renderLoot();
}


function removeAllLoot() {
    lootList = [];
    renderLoot();
    updateUI();
}


// For certain validation where the minimum value must be 1 or greater.
// Returns an array. First element is validated value, second element is if the passed in value was valid.
function forcePositiveNonZeroInteger(numberToMakeValid) {
    const validNumber = Number(numberToMakeValid.trim());

    // If it's not a number or equal to zero, snap to 1.
    if (isNaN(validNumber) || validNumber === 0 ) return [1, false];

    // No negative values. Sets the input to the absolute value of what was entered.
    if (validNumber < 0) return [Math.abs(validNumber), false];

    // Is the value entered an integer? If not, truncate it.
    if (!Number.isInteger(validNumber)) return [Math.trunc(validNumber), false];

    return [validNumber, true];
}


// Validation method for the party size input box. Is called every time the input is updated.
// Handles the user entering non-numbers, negative numbers, or floats into the input.
function validatePartySize() {
    let wasInputValid = true;
    [partySize, wasInputValid] = forcePositiveNonZeroInteger(partyNumberInput.value);

    if (!wasInputValid) {
        document.getElementById('partyNumber').value = partySize;
        document.getElementById('invalid-party-size-message').style.display = "inline";
    } else {
        document.getElementById('invalid-party-size-message').style.display = "none";
    }
}


// A debug function for quickly adding a random set of loot to the loot table without needing to enter things manually.
// Also assigns a random value and rarity.
function debugRandomLoot() {
    const itemNames = ["Helmet", "Hood", "Shoulderpads", "Pauldrons", "Cloak", "Shawl", "Shirt", "Chestguard", "Hauberk", "Bracers", "Armguards", "Gloves", "Gauntlets", "Belt", "Sash", "Leggings", "Greaves", "Pantaloons", "Fishnet Stockings", "Shoes", "Sabatons", "Boots", "Hupodema", "Flip-Flops", "Silver Necklace", "Locket", "Pendant", "Ring", "Signet", "Class Ring", "Dagger", "Battleaxe", "Hatchet", "Short Sword", "Longsword", "Rusty Sword", "Empty Scabbard", "Coin", "Torch", "Rope", "Satchel", "Flask", "Map", "Compass", "Key", "Scroll", "Lantern", "Hammer", "Chisel", "Bowl", "Cup", "Pouch", "Quill", "Book", "Mirror", "Packet of Bird Flu", "Jar of Ear Wax", "Jar of Bees", "Beehive", "Stick", "Eugene", "Book of Terrible JavaScript", "Hot Cup of Coffee", "Warm Cup of Coffee", "Cold Cup of Coffee", "Moldy Cup of Coffee", "Fermented Cup of Coffee", "Pringle", "Squirrel", "Itsy Bitsy Teenie Weenie Yellow Polkadot Bikini"]
    
    let randomNumberOfItems = Math.floor(Math.random() * 5) + 6;

    lootList = [];

    for (let i = 0; i < randomNumberOfItems; i++) {
        let randomLootName = itemNames[Math.floor(Math.random() * itemNames.length)];
        let randomQuantity = Math.floor(Math.random() * 5) + 1;
        let randomValue = Number((Math.random() * 10).toFixed(2));
        let randomRarity = Math.floor(Math.random() * 5);
        let newLoot = new LootItem(randomLootName, randomValue, randomQuantity, randomRarity);
        lootList.push(newLoot);
    }

    renderLoot();
}


function updateUI() {
    validatePartySize();
    splitLoot();

    if (lootList.length === 0) {
        document.getElementById('splitLootButton').setAttribute("disabled", "true");
    } else {
        document.getElementById('splitLootButton').removeAttribute("disabled");
    }
}


// For some added fun.
function closePartySetup() {
    document.getElementById('partySetupPanel').style.display = "none";
    document.getElementById('party-setup-close').style.display = "block";
}


// Set up the event listeners for the existing buttons on the page.
document.getElementById('addLootButton').addEventListener('click', addLoot);
document.getElementById('splitLootButton').addEventListener('click', updateUI);
document.getElementById('partyNumber').addEventListener('change', updateUI);
document.getElementById('debugRandomLoot').addEventListener('click', debugRandomLoot);
document.getElementById('loot-list-close-button').addEventListener("click", removeAllLoot);
document.getElementById('party-setup-close-button').addEventListener('click', closePartySetup);