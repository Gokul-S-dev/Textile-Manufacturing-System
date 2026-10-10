import { financeService } from './finance.service.js';

export const getInvoices = async (req, res, next) => {
  try { res.json(await financeService.getInvoices()); } catch (err) { next(err); }
};

export const createInvoice = async (req, res, next) => {
  try { res.status(201).json(await financeService.createInvoice(req.body, req.user.id)); } catch (err) { next(err); }
};

export const getInvoiceById = async (req, res, next) => {
  try { res.json(await financeService.getInvoiceById(req.params.id)); } catch (err) { next(err); }
};

export const updateInvoice = async (req, res, next) => {
  try { res.json(await financeService.updateInvoice(req.params.id, req.body)); } catch (err) { next(err); }
};

export const submitInvoice = async (req, res, next) => {
  try { res.json(await financeService.changeInvoiceStatus(req.params.id, 'APPROVED')); } catch (err) { next(err); }
};

export const approveInvoice = async (req, res, next) => {
  try { res.json(await financeService.approveInvoice(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const issueInvoice = async (req, res, next) => {
  try { res.json(await financeService.changeInvoiceStatus(req.params.id, 'ISSUED')); } catch (err) { next(err); }
};

export const voidInvoice = async (req, res, next) => {
  try { res.json(await financeService.changeInvoiceStatus(req.params.id, 'VOID')); } catch (err) { next(err); }
};

export const getPayments = async (req, res, next) => {
  try { res.json(await financeService.getPayments()); } catch (err) { next(err); }
};

export const recordPayment = async (req, res, next) => {
  try { res.status(201).json(await financeService.recordPayment(req.body, req.user.id)); } catch (err) { next(err); }
};

export const getPaymentById = async (req, res, next) => {
  try { res.json(await financeService.getPaymentById(req.params.id)); } catch (err) { next(err); }
};

export const allocatePayment = async (req, res, next) => {
  try { res.json(await financeService.allocatePayment(req.params.id, req.body)); } catch (err) { next(err); }
};

export const reversePayment = async (req, res, next) => {
  try { res.json(await financeService.reversePayment(req.params.id)); } catch (err) { next(err); }
};

export const getCreditNotes = async (req, res, next) => {
  try { res.json(await financeService.getCreditNotes()); } catch (err) { next(err); }
};

export const createCreditNote = async (req, res, next) => {
  try { res.status(201).json(await financeService.createCreditNote(req.body, req.user.id)); } catch (err) { next(err); }
};

export const approveCreditNote = async (req, res, next) => {
  try { res.json(await financeService.approveCreditNote(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const getAccountStatement = async (req, res, next) => {
  try { res.json(await financeService.getAccountStatement(req.params.id)); } catch (err) { next(err); }
};
