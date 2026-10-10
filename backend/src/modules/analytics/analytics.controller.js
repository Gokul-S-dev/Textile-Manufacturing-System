import { analyticsService } from './analytics.service.js';

export const getExecutiveDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getExecutiveMetrics(req.query)); } catch (err) { next(err); }
};

export const getProductionDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getProductionMetrics(req.query)); } catch (err) { next(err); }
};

export const getQualityDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getQualityMetrics(req.query)); } catch (err) { next(err); }
};

export const getInventoryDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getInventoryMetrics(req.query)); } catch (err) { next(err); }
};

export const getSalesDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getSalesMetrics(req.query)); } catch (err) { next(err); }
};

export const getFinanceDashboard = async (req, res, next) => {
  try { res.json(await analyticsService.getFinanceMetrics(req.query)); } catch (err) { next(err); }
};

export const exportReport = async (req, res, next) => {
  try {
    const csvData = await analyticsService.generateExport(req.params.type, req.query);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${req.params.type}-report.csv`);
    res.send(csvData);
  } catch (err) { next(err); }
};
