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

export const receiveRawMaterial = async (req, res, next) => {
  try {
    const result = await inventoryService.recordReceipt(req.body, req.user.id);
    res.status(201).json({ message: 'Receipt recorded successfully', data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createMovement = async (req, res, next) => {
  try {
    const result = await inventoryService.processMovement(req.body, req.user.id);
    res.status(201).json({ message: 'Movement processed', data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reserveMaterial = async (req, res, next) => {
  try {
    const result = await inventoryService.createReservation(req.body, req.user.id);
    res.status(201).json({ message: 'Reservation created', data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
