import consumables from './items/consumables.json';
import tools from './items/tools.json';
import keys from './items/keys.json';
import objectLogic from './objectLogic.json';

export const inventoryItems = [...consumables, ...tools, ...keys];

export const gameData = {
  inventoryItems,
  objectLogic
};
