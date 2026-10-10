import { warehouseService } from './warehouse.service.js';

export const getWarehouses = async (req, res, next) => {
  try { res.json(await warehouseService.getWarehouses()); }
  catch (err) { next(err); }
};

export const createWarehouse = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.createWarehouse(req.body)); }
  catch (err) { next(err); }
};

export const getWarehouseLocations = async (req, res, next) => {
  try { res.json(await warehouseService.getLocations(req.params.id)); }
  catch (err) { next(err); }
};

export const createWarehouseLocation = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.createLocation(req.params.id, req.body)); }
  catch (err) { next(err); }
};

export const getFinishedGoods = async (req, res, next) => {
  try { res.json(await warehouseService.getFinishedGoods()); }
  catch (err) { next(err); }
};

export const recordFinishedGoodsReceipt = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.recordReceipt(req.user.id, req.body)); }
  catch (err) { next(err); }
};

export const createReservation = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.createReservation(req.body)); }
  catch (err) { next(err); }
};

export const getReservations = async (req, res, next) => {
  try { res.json(await warehouseService.getReservations()); }
  catch (err) { next(err); }
};

export const releaseReservation = async (req, res, next) => {
  try { res.json(await warehouseService.releaseReservation(req.params.id)); }
  catch (err) { next(err); }
};

export const getTransfers = async (req, res, next) => {
  try { res.json(await warehouseService.getTransfers()); }
  catch (err) { next(err); }
};

export const createTransfer = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.createTransfer(req.user.id, req.body)); }
  catch (err) { next(err); }
};

export const approveTransfer = async (req, res, next) => {
  try { res.json(await warehouseService.approveTransfer(req.params.id)); }
  catch (err) { next(err); }
};

export const dispatchTransfer = async (req, res, next) => {
  try { res.json(await warehouseService.dispatchTransfer(req.params.id, req.body)); }
  catch (err) { next(err); }
};

export const receiveTransfer = async (req, res, next) => {
  try { res.json(await warehouseService.receiveTransfer(req.params.id, req.body)); }
  catch (err) { next(err); }
};

export const createStockCount = async (req, res, next) => {
  try { res.status(201).json(await warehouseService.createStockCount(req.user.id, req.body)); }
  catch (err) { next(err); }
};

export const submitStockCount = async (req, res, next) => {
  try { res.json(await warehouseService.submitStockCount(req.params.id, req.body)); }
  catch (err) { next(err); }
};

export const approveStockCount = async (req, res, next) => {
  try { res.json(await warehouseService.approveStockCount(req.params.id, req.user.id)); }
  catch (err) { next(err); }
};

export const applyStockCount = async (req, res, next) => {
  try { res.json(await warehouseService.applyStockCount(req.params.id, req.user.id)); }
  catch (err) { next(err); }
};

export const holdStock = async (req, res, next) => {
  try { res.json(await warehouseService.holdStock(req.params.id, req.body)); }
  catch (err) { next(err); }
};

export const releaseStockHold = async (req, res, next) => {
  try { res.json(await warehouseService.releaseStockHold(req.params.id)); }
  catch (err) { next(err); }
};

export const getStockHistory = async (req, res, next) => {
  try { res.json(await warehouseService.getStockHistory(req.params.id)); }
  catch (err) { next(err); }
};
