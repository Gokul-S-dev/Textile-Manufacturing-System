import { mesService } from './mes.service.js';

export const getMesOrders = async (req, res, next) => {
  try {
    const orders = await mesService.getMesOrders(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getMesOrderProgress = async (req, res, next) => {
  try {
    const progress = await mesService.getOrderProgress(req.params.orderId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const startProductionOrder = async (req, res, next) => {
  try {
    const result = await mesService.startOrder(req.params.orderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const startStage = async (req, res, next) => {
  try {
    const result = await mesService.startStage(req.params.stageId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const pauseStage = async (req, res, next) => {
  try {
    const result = await mesService.pauseStage(req.params.stageId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resumeStage = async (req, res, next) => {
  try {
    const result = await mesService.resumeStage(req.params.stageId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const completeStage = async (req, res, next) => {
  try {
    const result = await mesService.completeStage(req.params.stageId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const recordProductionRun = async (req, res, next) => {
  try {
    const result = await mesService.recordRun({
      stageId: req.params.stageId,
      ...req.body,
      operatorId: req.user.id
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const recordMaterialConsumption = async (req, res, next) => {
  try {
    const result = await mesService.recordConsumption(req.params.runId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const recordProductionOutput = async (req, res, next) => {
  try {
    const result = await mesService.recordOutput(req.params.runId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const reportDelay = async (req, res, next) => {
  try {
    const result = await mesService.reportDelay({
      orderId: req.params.orderId,
      reportedById: req.user.id,
      ...req.body
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const resolveDelay = async (req, res, next) => {
  try {
    const result = await mesService.resolveDelay(req.params.delayId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
