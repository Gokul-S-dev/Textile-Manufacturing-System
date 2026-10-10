import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding extensive dummy inventory data...');

  // 1. Create Suppliers
  const supYarn = await prisma.supplier.upsert({
    where: { id: 'sup-yarn' },
    update: {},
    create: { id: 'sup-yarn', name: 'Global Yarn Co', email: 'yarn@textile.local' }
  });
  
  const supFiber = await prisma.supplier.upsert({
    where: { id: 'sup-fiber' },
    update: {},
    create: { id: 'sup-fiber', name: 'FiberTech Industries', email: 'fiber@textile.local' }
  });

  const supChem = await prisma.supplier.upsert({
    where: { id: 'sup-chem' },
    update: {},
    create: { id: 'sup-chem', name: 'ChemDye Solutions', email: 'chem@textile.local' }
  });
  
  const supPack = await prisma.supplier.upsert({
    where: { id: 'sup-pack' },
    update: {},
    create: { id: 'sup-pack', name: 'PackMaster Supplies', email: 'pack@textile.local' }
  });

  // 2. Create Warehouses
  const whMain = await prisma.warehouse.upsert({
    where: { id: 'wh-main' },
    update: {},
    create: { id: 'wh-main', name: 'Main Raw Material Storage', location: 'Zone A' }
  });

  const whChem = await prisma.warehouse.upsert({
    where: { id: 'wh-chem' },
    update: {},
    create: { id: 'wh-chem', name: 'Chemical & Dye Storage', location: 'Zone B (Hazmat)' }
  });

  // 3. Define the Items
  const itemsToCreate = [
    // Yarn
    { sku: 'YRN-COT-01', name: 'Cotton Yarn', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 500, supplierId: supYarn.id },
    { sku: 'YRN-POLY-01', name: 'Polyester Yarn', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 300, supplierId: supYarn.id },
    { sku: 'YRN-VIS-01', name: 'Viscose Yarn', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 200, supplierId: supYarn.id },
    { sku: 'YRN-COTPOL-01', name: 'Cotton-Polyester Blended Yarn', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 400, supplierId: supYarn.id },
    { sku: 'YRN-WOOL-01', name: 'Wool Yarn', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 100, supplierId: supYarn.id },
    
    // Fibers
    { sku: 'FIB-COT-01', name: 'Raw Cotton Fiber', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 1000, supplierId: supFiber.id },
    { sku: 'FIB-POLY-01', name: 'Polyester Staple Fiber', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 800, supplierId: supFiber.id },
    { sku: 'FIB-VIS-01', name: 'Viscose Staple Fiber', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 600, supplierId: supFiber.id },
    { sku: 'FIB-WOOL-01', name: 'Wool Fiber', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 300, supplierId: supFiber.id },
    { sku: 'FIB-LIN-01', name: 'Linen Fiber', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 200, supplierId: supFiber.id },

    // Dyes
    { sku: 'DYE-BLU-01', name: 'Reactive Blue Dye', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 50, supplierId: supChem.id },
    { sku: 'DYE-RED-01', name: 'Reactive Red Dye', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 50, supplierId: supChem.id },
    { sku: 'DYE-DIS-01', name: 'Disperse Dye', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 40, supplierId: supChem.id },
    { sku: 'DYE-VAT-01', name: 'Vat Dye', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 40, supplierId: supChem.id },
    { sku: 'DYE-DIR-01', name: 'Direct Dye', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 30, supplierId: supChem.id },

    // Chemicals
    { sku: 'CHM-SODA-01', name: 'Soda Ash', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 200, supplierId: supChem.id },
    { sku: 'CHM-SALT-01', name: 'Textile Salt', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 500, supplierId: supChem.id },
    { sku: 'CHM-CAUS-01', name: 'Caustic Soda', type: 'RAW_MATERIAL', unitOfMeasure: 'kg', minStock: 200, supplierId: supChem.id },
    { sku: 'CHM-BLE-01', name: 'Bleaching Agent', type: 'RAW_MATERIAL', unitOfMeasure: 'L', minStock: 100, supplierId: supChem.id },
    { sku: 'CHM-WET-01', name: 'Wetting Agent', type: 'RAW_MATERIAL', unitOfMeasure: 'L', minStock: 50, supplierId: supChem.id },

    // Weaving Consumables
    { sku: 'CON-STA-01', name: 'Starch Sizing Agent', type: 'CONSUMABLE', unitOfMeasure: 'kg', minStock: 100, supplierId: supChem.id },
    { sku: 'CON-PVA-01', name: 'PVA Sizing Agent', type: 'CONSUMABLE', unitOfMeasure: 'kg', minStock: 80, supplierId: supChem.id },
    { sku: 'CON-LUB-01', name: 'Weaving Lubricant', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 50, supplierId: supChem.id },
    { sku: 'CON-WAR-01', name: 'Warp Sizing Compound', type: 'CONSUMABLE', unitOfMeasure: 'kg', minStock: 100, supplierId: supChem.id },
    { sku: 'CON-WAX-01', name: 'Yarn Wax', type: 'CONSUMABLE', unitOfMeasure: 'kg', minStock: 30, supplierId: supChem.id },

    // Finishing Materials
    { sku: 'FIN-SOF-01', name: 'Textile Softener', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 100, supplierId: supChem.id },
    { sku: 'FIN-RES-01', name: 'Finishing Resin', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 80, supplierId: supChem.id },
    { sku: 'FIN-WAT-01', name: 'Water-Repellent Agent', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 50, supplierId: supChem.id },
    { sku: 'FIN-ANT-01', name: 'Anti-Static Agent', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 40, supplierId: supChem.id },
    { sku: 'FIN-WRI-01', name: 'Wrinkle-Resistant Agent', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 50, supplierId: supChem.id },

    // Packaging Materials
    { sku: 'PKG-COR-01', name: 'Paper Roll Cores', type: 'CONSUMABLE', unitOfMeasure: 'pieces', minStock: 1000, supplierId: supPack.id },
    { sku: 'PKG-FIL-01', name: 'Fabric Wrapping Film', type: 'CONSUMABLE', unitOfMeasure: 'meters', minStock: 5000, supplierId: supPack.id },
    { sku: 'PKG-LAB-01', name: 'Fabric Labels', type: 'CONSUMABLE', unitOfMeasure: 'pieces', minStock: 10000, supplierId: supPack.id },
    { sku: 'PKG-CAR-01', name: 'Packing Cartons', type: 'CONSUMABLE', unitOfMeasure: 'pieces', minStock: 500, supplierId: supPack.id },
    { sku: 'PKG-STR-01', name: 'Packing Straps', type: 'CONSUMABLE', unitOfMeasure: 'meters', minStock: 2000, supplierId: supPack.id },
  ];

  for (const itemData of itemsToCreate) {
    const item = await prisma.item.upsert({
      where: { sku: itemData.sku },
      update: {
        name: itemData.name,
        type: itemData.type,
        minStock: itemData.minStock,
        unitOfMeasure: itemData.unitOfMeasure,
        supplierId: itemData.supplierId,
      },
      create: itemData
    });

    // Create an initial stock balance
    const warehouseId = (item.sku.startsWith('DYE') || item.sku.startsWith('CHM')) ? whChem.id : whMain.id;
    
    // Give some initial stock
    const initialQty = item.minStock * 2; 

    // Find if balance exists
    const balance = await prisma.inventoryBalance.findFirst({
      where: { itemId: item.id, warehouseId }
    });

    if (!balance) {
      await prisma.inventoryBalance.create({
        data: {
          itemId: item.id,
          warehouseId,
          quantity: initialQty,
          reservedQuantity: 0,
        }
      });
    }
  }

  console.log('Extensive dummy inventory seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
