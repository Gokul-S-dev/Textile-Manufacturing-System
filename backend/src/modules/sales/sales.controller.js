import { salesService } from './sales.service.js';

export const getCustomers = async (req, res, next) => {
  try { res.json(await salesService.getCustomers()); } catch (err) { next(err); }
};

export const createCustomer = async (req, res, next) => {
  try { res.status(201).json(await salesService.createCustomer(req.body)); } catch (err) { next(err); }
};

export const getCustomerById = async (req, res, next) => {
  try { res.json(await salesService.getCustomerById(req.params.id)); } catch (err) { next(err); }
};

export const updateCustomer = async (req, res, next) => {
  try { res.json(await salesService.updateCustomer(req.params.id, req.body)); } catch (err) { next(err); }
};

export const addCustomerAddress = async (req, res, next) => {
  try { res.status(201).json(await salesService.addCustomerAddress(req.params.id, req.body)); } catch (err) { next(err); }
};

export const getSalesOrders = async (req, res, next) => {
  try { res.json(await salesService.getSalesOrders()); } catch (err) { next(err); }
};

export const createSalesOrder = async (req, res, next) => {
  try { res.status(201).json(await salesService.createSalesOrder(req.body)); } catch (err) { next(err); }
};

export const getSalesOrderById = async (req, res, next) => {
  try { res.json(await salesService.getSalesOrderById(req.params.id)); } catch (err) { next(err); }
};

export const updateSalesOrder = async (req, res, next) => {
  try { res.json(await salesService.updateSalesOrder(req.params.id, req.body)); } catch (err) { next(err); }
};

export const submitOrder = async (req, res, next) => {
  try { res.json(await salesService.changeOrderStatus(req.params.id, 'SUBMITTED')); } catch (err) { next(err); }
};

export const confirmOrder = async (req, res, next) => {
  try { res.json(await salesService.confirmOrder(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const holdOrder = async (req, res, next) => {
  try { res.json(await salesService.changeOrderStatus(req.params.id, 'ON_HOLD')); } catch (err) { next(err); }
};

export const resumeOrder = async (req, res, next) => {
  try { res.json(await salesService.changeOrderStatus(req.params.id, 'PROCESSING')); } catch (err) { next(err); }
};

export const cancelOrder = async (req, res, next) => {
  try { res.json(await salesService.cancelOrder(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const allocateStock = async (req, res, next) => {
  try { res.json(await salesService.allocateStock(req.params.id)); } catch (err) { next(err); }
};

export const createPickList = async (req, res, next) => {
  try { res.status(201).json(await salesService.createPickList(req.body)); } catch (err) { next(err); }
};

export const startPickList = async (req, res, next) => {
  try { res.json(await salesService.startPickList(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const completePickList = async (req, res, next) => {
  try { res.json(await salesService.completePickList(req.params.id, req.body)); } catch (err) { next(err); }
};

export const createPackingRecord = async (req, res, next) => {
  try { res.status(201).json(await salesService.createPackingRecord(req.user.id, req.body)); } catch (err) { next(err); }
};

export const createShipment = async (req, res, next) => {
  try { res.status(201).json(await salesService.createShipment(req.body)); } catch (err) { next(err); }
};

export const dispatchShipment = async (req, res, next) => {
  try { res.json(await salesService.dispatchShipment(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const deliverShipment = async (req, res, next) => {
  try { res.json(await salesService.deliverShipment(req.params.id)); } catch (err) { next(err); }
};

export const reportShipmentException = async (req, res, next) => {
  try { res.json(await salesService.reportShipmentException(req.params.id, req.body)); } catch (err) { next(err); }
};
