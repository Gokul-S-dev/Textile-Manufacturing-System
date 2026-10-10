import { qualityService } from './quality.service.js';

export const getStandards = async (req, res, next) => {
  try {
    const data = await qualityService.getStandards();
    res.json(data);
  } catch (err) { next(err); }
};

export const createStandard = async (req, res, next) => {
  try {
    const data = await qualityService.createStandard(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const getInspectionPlans = async (req, res, next) => {
  try {
    const data = await qualityService.getInspectionPlans();
    res.json(data);
  } catch (err) { next(err); }
};

export const createInspectionPlan = async (req, res, next) => {
  try {
    const data = await qualityService.createInspectionPlan(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const getInspections = async (req, res, next) => {
  try {
    const data = await qualityService.getInspections(req.query);
    res.json(data);
  } catch (err) { next(err); }
};

export const createInspection = async (req, res, next) => {
  try {
    const data = await qualityService.createInspection(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const startInspection = async (req, res, next) => {
  try {
    const data = await qualityService.startInspection(req.params.id, req.user.id);
    res.json(data);
  } catch (err) { next(err); }
};

export const recordResults = async (req, res, next) => {
  try {
    const data = await qualityService.recordResults(req.params.id, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const completeInspection = async (req, res, next) => {
  try {
    const data = await qualityService.completeInspection(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

export const submitDisposition = async (req, res, next) => {
  try {
    const data = await qualityService.submitDisposition(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
};

export const getDefects = async (req, res, next) => {
  try {
    const data = await qualityService.getDefects();
    res.json(data);
  } catch (err) { next(err); }
};

export const createDefect = async (req, res, next) => {
  try {
    const data = await qualityService.createDefect(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const createRework = async (req, res, next) => {
  try {
    const data = await qualityService.createRework(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const updateRework = async (req, res, next) => {
  try {
    const data = await qualityService.updateRework(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
};

export const getCAPA = async (req, res, next) => {
  try {
    const data = await qualityService.getCAPA();
    res.json(data);
  } catch (err) { next(err); }
};

export const createCAPA = async (req, res, next) => {
  try {
    const data = await qualityService.createCAPA(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const getSummary = async (req, res, next) => {
  try {
    const data = await qualityService.getSummary();
    res.json(data);
  } catch (err) { next(err); }
};
