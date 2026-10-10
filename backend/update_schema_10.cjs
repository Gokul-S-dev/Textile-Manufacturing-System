const fs = require('fs');
let txt = fs.readFileSync('prisma/schema.prisma', 'utf8');

txt = txt.replace(/enum COStatus \{[\s\S]*?\}/, `enum COStatus {
  DRAFT
  SUBMITTED
  CONFIRMED
  PROCESSING
  PARTIAL
  PARTIALLY_FULFILLED
  FULFILLED
  ON_HOLD
  CANCELLED
  OPEN
}`);

txt = txt.replace(/model Customer \{[\s\S]*?\}/, `model Customer {
  id              String   @id @default(uuid())
  customerCode    String   @unique @default(cuid())
  name            String
  type            String   @default("STANDARD")
  contactPerson   String?
  email           String?
  phone           String?
  taxRegistration String?
  paymentTerms    String?
  creditLimit     Decimal? @db.Decimal(12, 2)
  isActive        Boolean  @default(true)
  notes           String?
  createdAt       DateTime @default(now())

  addresses CustomerAddress[]
  orders    CustomerOrder[]
}`);

txt = txt.replace(/model CustomerOrder \{[\s\S]*?\}/, `model CustomerOrder {
  id                    String   @id @default(uuid())
  orderNumber           String   @unique
  customerId            String
  status                COStatus @default(DRAFT)
  orderDate             DateTime @default(now())
  requestedDeliveryDate DateTime?
  currency              String   @default("USD")
  subtotal              Decimal  @default(0) @db.Decimal(12, 2)
  discounts             Decimal  @default(0) @db.Decimal(12, 2)
  taxes                 Decimal  @default(0) @db.Decimal(12, 2)
  shippingCharges       Decimal  @default(0) @db.Decimal(12, 2)
  totalAmount           Decimal  @default(0) @db.Decimal(12, 2)
  priority              String   @default("NORMAL")
  paymentTerms          String?
  
  approvalById          String?

  customer            Customer             @relation(fields: [customerId], references: [id], onDelete: Restrict)
  lines               CustomerOrderLine[]
  manufacturingOrders ManufacturingOrder[]
  dispatches          DispatchRecord[]
  shipments           Shipment[]
  pickLists           PickList[]
  packingRecords      PackingRecord[]
}`);

const newModels = `

// ============================================================================
// PHASE 10: SALES ORDERS, FULFILLMENT, DISPATCH
// ============================================================================

model CustomerAddress {
  id          String   @id @default(uuid())
  customerId  String
  type        String   @default("SHIPPING") // BILLING, SHIPPING
  addressLine String
  city        String?
  state       String?
  zipCode     String?
  country     String?
  isDefault   Boolean  @default(false)
  
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}

model CustomerOrderLine {
  id               String   @id @default(uuid())
  orderId          String
  itemId           String
  quantity         Decimal  @db.Decimal(12, 2)
  unitPrice        Decimal  @db.Decimal(12, 2)
  specifications   Json?
  fulfilledQty     Decimal  @default(0) @db.Decimal(12, 2)
  reservedQty      Decimal  @default(0) @db.Decimal(12, 2)
  
  order            CustomerOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  item             Item          @relation(fields: [itemId], references: [id])
}

model PickList {
  id             String   @id @default(uuid())
  pickListNumber String   @unique
  orderId        String
  status         String   @default("CREATED") // CREATED, IN_PROGRESS, COMPLETED
  assignedToId   String?
  remarks        String?
  createdAt      DateTime @default(now())
  
  order          CustomerOrder @relation(fields: [orderId], references: [id])
  assignedTo     User?         @relation("PickListAssignee", fields: [assignedToId], references: [id])
  items          PickListItem[]
}

model PickListItem {
  id          String   @id @default(uuid())
  pickListId  String
  itemId      String
  batchId     String?
  locationId  String?
  requiredQty Decimal  @db.Decimal(12, 2)
  pickedQty   Decimal  @default(0) @db.Decimal(12, 2)
  
  pickList    PickList @relation(fields: [pickListId], references: [id], onDelete: Cascade)
  item        Item     @relation(fields: [itemId], references: [id])
}

model PackingRecord {
  id           String   @id @default(uuid())
  packingRef   String   @unique
  orderId      String
  packageCount Int      @default(1)
  notes        String?
  packedById   String
  createdAt    DateTime @default(now())
  
  order        CustomerOrder @relation(fields: [orderId], references: [id])
  packedBy     User          @relation("PackingOperator", fields: [packedById], references: [id])
}

model Shipment {
  id             String   @id @default(uuid())
  shipmentNumber String   @unique
  orderId        String
  carrier        String?
  trackingNumber String?
  status         String   @default("PREPARED") // PREPARED, READY_FOR_DISPATCH, DISPATCHED, IN_TRANSIT, DELIVERED, EXCEPTION
  dispatchDate   DateTime?
  expectedDelDate DateTime?
  actualDelDate  DateTime?
  operatorId     String?
  notes          String?
  createdAt      DateTime @default(now())

  order          CustomerOrder   @relation(fields: [orderId], references: [id])
  operator       User?           @relation("ShipmentOperator", fields: [operatorId], references: [id])
  events         ShipmentEvent[]
}

model ShipmentEvent {
  id          String   @id @default(uuid())
  shipmentId  String
  eventType   String
  location    String?
  notes       String?
  createdAt   DateTime @default(now())
  
  shipment    Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}
`;

fs.writeFileSync('prisma/schema.prisma', txt + newModels);

// Append back-relations to User model
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model User \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  assignedPickLists PickList[] @relation("PickListAssignee")\n  packings PackingRecord[] @relation("PackingOperator")\n  shipments Shipment[] @relation("ShipmentOperator")\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to Item model
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model Item \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  orderLines CustomerOrderLine[]\n  pickItems PickListItem[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

console.log('Schema update complete.');
