import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  submitInvoice,
  approveInvoice,
  issueInvoice,
  voidInvoice,
  getPayments,
  recordPayment,
  getPaymentById,
  allocatePayment,
  reversePayment,
  getCreditNotes,
  createCreditNote,
  approveCreditNote,
  getAccountStatement
} from './finance.controller.js';

const router = Router();

// Invoices
router.get('/invoices', authenticate, authorize('finance.read'), getInvoices);
router.post('/invoices', authenticate, authorize('finance.manage'), createInvoice);
router.get('/invoices/:id', authenticate, authorize('finance.read'), getInvoiceById);
router.patch('/invoices/:id', authenticate, authorize('finance.manage'), updateInvoice);

router.post('/invoices/:id/submit', authenticate, authorize('finance.manage'), submitInvoice);
router.post('/invoices/:id/approve', authenticate, authorize('finance.approve'), approveInvoice);
router.post('/invoices/:id/issue', authenticate, authorize('finance.approve'), issueInvoice);
router.post('/invoices/:id/void', authenticate, authorize('finance.approve'), voidInvoice);

// Payments
router.get('/payments', authenticate, authorize('finance.read'), getPayments);
router.post('/payments', authenticate, authorize('finance.manage'), recordPayment);
router.get('/payments/:id', authenticate, authorize('finance.read'), getPaymentById);
router.post('/payments/:id/allocations', authenticate, authorize('finance.manage'), allocatePayment);
router.post('/payments/:id/reverse', authenticate, authorize('finance.approve'), reversePayment);

// Credit Notes
router.get('/credit-notes', authenticate, authorize('finance.read'), getCreditNotes);
router.post('/credit-notes', authenticate, authorize('finance.manage'), createCreditNote);
router.post('/credit-notes/:id/approve', authenticate, authorize('finance.approve'), approveCreditNote);

// Reporting
router.get('/customers/:id/account-statement', authenticate, authorize('finance.read'), getAccountStatement);

export default router;
