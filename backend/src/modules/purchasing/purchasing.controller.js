import * as service from './purchasing.service.js';

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await service.createSupplier(req.body, req.user.id);
    res.status(201).json(supplier);
  } catch (error) { next(error); }
};

export const listSuppliers = async (req, res, next) => {
  try {
    res.status(200).json(await service.listSuppliers());
  } catch (error) { next(error); }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplierId, items } = req.body;
    const po = await service.createPurchaseOrder(supplierId, items, req.user.id);
    res.status(201).json(po);
  } catch (error) { next(error); }
};

export const listPurchaseOrders = async (req, res, next) => {
  try {
    res.status(200).json(await service.listPurchaseOrders());
  } catch (error) { next(error); }
};

export const confirmReceipt = async (req, res, next) => {
  try {
    const { items, invoiceRef } = req.body;
    const receipt = await service.confirmGoodsReceipt(req.params.id, items, invoiceRef, req.user.id);
    res.status(201).json(receipt);
  } catch (error) { next(error); }
};
