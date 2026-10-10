const fs = require('fs');
let txt = fs.readFileSync('prisma/schema.prisma', 'utf8');

txt = txt.replace(/model InventoryBalance \{[\s\S]*?\}/, `model InventoryBalance {
  id          String  @id @default(uuid())
  itemId      String
  warehouseId String
  locationId  String?
  batchId     String?

  quantity         Decimal @default(0.00) @db.Decimal(12, 2)
  reservedQuantity Decimal @default(0.00) @db.Decimal(12, 2)

  status      String  @default("AVAILABLE") // AVAILABLE, QUALITY_HOLD, DAMAGED, QUARANTINED, IN_TRANSIT, DISPATCHED

  item      Item            @relation(fields: [itemId], references: [id], onDelete: Restrict)
  warehouse Warehouse       @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  location  WarehouseLocation? @relation(fields: [locationId], references: [id], onDelete: Restrict)
  batch     InventoryBatch? @relation(fields: [batchId], references: [id], onDelete: Restrict)

  updatedAt DateTime @updatedAt
}`);

txt = txt.replace(/enum MovementType \{[\s\S]*?\}/, `enum MovementType {
  RECEIPT
  CONSUMPTION
  TRANSFER_IN
  TRANSFER_OUT
  ADJUSTMENT_IN
  ADJUSTMENT_OUT
  ISSUE
  ADJUSTMENT
  RECEIPT_FG
}`);

txt = txt.replace(/model StockMovement \{[\s\S]*?\}/, `model StockMovement {
  id          String       @id @default(uuid())
  itemId      String
  warehouseId String?
  locationId  String?
  batchId     String?
  type        MovementType

  quantity        Decimal @db.Decimal(12, 2)
  previousBalance Decimal @db.Decimal(12, 2)
  newBalance      Decimal @db.Decimal(12, 2)

  referenceId String?
  reason      String?

  item      Item            @relation(fields: [itemId], references: [id], onDelete: Restrict)
  warehouse Warehouse?      @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  location  WarehouseLocation? @relation(fields: [locationId], references: [id], onDelete: Restrict)
  batch     InventoryBatch? @relation(fields: [batchId], references: [id], onDelete: Restrict)

  createdBy String
  createdAt DateTime @default(now())
}`);

fs.writeFileSync('prisma/schema.prisma', txt);
