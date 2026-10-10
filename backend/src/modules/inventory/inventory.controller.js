import * as inventoryService from './inventory.service.js';

export const getAllItems = async (req, res, next) => {
  try {
    const items = await inventoryService.getItems();
    res.status(200).json({ data: items });
  } catch (error) {
    next(error);
  }
};

export const getItemStock = async (req, res, next) => {
  try {
    const stock = await inventoryService.getItemStock(req.params.itemId);
    res.status(200).json({ data: stock });
  } catch (error) {
    next(error);
  }
};

export const editItem = async (req, res, next) => {
  try {
    const updatedItem = await inventoryService.updateItem(req.params.itemId, req.body);
    res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
  } catch (error) {
    next(error);
  }
};
