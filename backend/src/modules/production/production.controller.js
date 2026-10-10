import { productionService } from './production.service.js';

export const createManufacturingOrder = async (req, res, next) => {
  try {
    const order = await productionService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getManufacturingOrders = async (req, res, next) => {
  try {
    const orders = await productionService.getOrders(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getManufacturingOrderById = async (req, res, next) => {
  try {
    const order = await productionService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateManufacturingOrder = async (req, res, next) => {
  try {
    const order = await productionService.updateOrder(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const submitManufacturingOrder = async (req, res, next) => {
  try {
    const order = await productionService.updateOrderStatus(req.params.id, 'SUBMITTED');
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const approveManufacturingOrder = async (req, res, next) => {
  try {
    const order = await productionService.updateOrderStatus(req.params.id, 'APPROVED');
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelManufacturingOrder = async (req, res, next) => {
  try {
    const order = await productionService.updateOrderStatus(req.params.id, 'CANCELLED');
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const checkMaterialReadiness = async (req, res, next) => {
  try {
    const readiness = await productionService.checkMaterialReadiness(req.params.id);
    res.json(readiness);
  } catch (error) {
    next(error);
  }
};

export const reserveMaterialsForOrder = async (req, res, next) => {
  try {
    const reservations = await productionService.reserveMaterialsForOrder(req.params.id);
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

export const releaseOrderForProduction = async (req, res, next) => {
  try {
    const order = await productionService.releaseOrderForProduction(req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const generateSchedulePreview = async (req, res, next) => {
  try {
    const schedule = await productionService.generateSchedulePreview(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

export const commitSchedule = async (req, res, next) => {
  try {
    const schedule = await productionService.commitSchedule(req.params.id);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

export const getScheduleConflicts = async (req, res, next) => {
  try {
    const conflicts = await productionService.getScheduleConflicts(req.query);
    res.json(conflicts);
  } catch (error) {
    next(error);
  }
};
