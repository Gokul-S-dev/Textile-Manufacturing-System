import prisma from '../../config/db.js';

export const getItems = async () => {
  return await prisma.item.findMany({
    include: {
      balances: true,
      supplier: true
    }
  });
};

export const getItemStock = async (itemId) => {
  return await prisma.inventoryBalance.findMany({
    where: { itemId },
    include: { warehouse: true }
  });
};

export const updateItem = async (itemId, data) => {
  return await prisma.item.update({
    where: { id: itemId },
    data,
  });
};
