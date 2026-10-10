import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy inventory data...');

  // 1. Create a Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Global Textiles Ltd',
      email: 'contact@globaltextiles.local',
      phone: '123-456-7890',
    }
  });

  // 2. Create a Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Storage A',
      location: 'Block 1, First Floor',
    }
  });

  // 3. Create Raw Materials (Items)
  const cotton = await prisma.item.create({
    data: {
      sku: 'RAW-COT-001',
      name: 'Premium Cotton Thread',
      type: 'RAW_MATERIAL',
      unitOfMeasure: 'kg',
      minStock: 50.00,
      supplierId: supplier.id,
    }
  });

  const silk = await prisma.item.create({
    data: {
      sku: 'RAW-SILK-002',
      name: 'Raw Silk Yarn',
      type: 'RAW_MATERIAL',
      unitOfMeasure: 'kg',
      minStock: 10.00,
      supplierId: supplier.id,
    }
  });

  // 4. Create Initial Balances
  await prisma.inventoryBalance.create({
    data: {
      itemId: cotton.id,
      warehouseId: warehouse.id,
      quantity: 150.50,
    }
  });

  await prisma.inventoryBalance.create({
    data: {
      itemId: silk.id,
      warehouseId: warehouse.id,
      quantity: 25.00,
    }
  });
  
  // 5. Add initial stock movements
  const admin = await prisma.user.findFirst();

  if (admin) {
    await prisma.stockMovement.createMany({
      data: [
        {
          itemId: cotton.id,
          type: 'RECEIPT',
          quantity: 150.50,
          previousBalance: 0,
          newBalance: 150.50,
          reason: 'Initial Dummy Stock',
          createdBy: admin.id
        },
        {
          itemId: silk.id,
          type: 'RECEIPT',
          quantity: 25.00,
          previousBalance: 0,
          newBalance: 25.00,
          reason: 'Initial Dummy Stock',
          createdBy: admin.id
        }
      ]
    });
  }

  console.log('Dummy inventory seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
