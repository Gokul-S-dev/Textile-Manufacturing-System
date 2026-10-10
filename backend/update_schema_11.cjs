const fs = require('fs');
let txt = fs.readFileSync('prisma/schema.prisma', 'utf8');

const newModels = `

// ============================================================================
// PHASE 11: INVOICING, PAYMENTS & FINANCIAL MANAGEMENT
// ============================================================================

model TaxConfiguration {
  id              String   @id @default(uuid())
  category        String   // e.g. GST, VAT
  rate            Decimal  @db.Decimal(5, 2)
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}

model Invoice {
  id              String   @id @default(uuid())
  invoiceNumber   String   @unique
  customerId      String
  orderId         String?
  shipmentId      String?
  issueDate       DateTime?
  dueDate         DateTime?
  currency        String   @default("USD")
  
  subtotal        Decimal  @default(0) @db.Decimal(12, 2)
  taxTotal        Decimal  @default(0) @db.Decimal(12, 2)
  shippingCharges Decimal  @default(0) @db.Decimal(12, 2)
  totalAmount     Decimal  @default(0) @db.Decimal(12, 2)
  amountPaid      Decimal  @default(0) @db.Decimal(12, 2)
  
  status          String   @default("DRAFT") // DRAFT, APPROVED, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, VOID
  
  createdById     String
  approvedById    String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  customer        Customer        @relation(fields: [customerId], references: [id])
  order           CustomerOrder?  @relation(fields: [orderId], references: [id])
  shipment        Shipment?       @relation(fields: [shipmentId], references: [id])
  
  createdBy       User            @relation("InvoiceCreator", fields: [createdById], references: [id])
  approvedBy      User?           @relation("InvoiceApprover", fields: [approvedById], references: [id])
  
  lines           InvoiceLine[]
  allocations     PaymentAllocation[]
  creditNotes     CreditNote[]
}

model InvoiceLine {
  id              String   @id @default(uuid())
  invoiceId       String
  itemId          String
  quantity        Decimal  @db.Decimal(12, 2)
  unitPrice       Decimal  @db.Decimal(12, 2)
  taxAmount       Decimal  @default(0) @db.Decimal(12, 2)
  lineTotal       Decimal  @db.Decimal(12, 2)

  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  item            Item     @relation(fields: [itemId], references: [id])
}

model Payment {
  id                String   @id @default(uuid())
  paymentReference  String   @unique
  customerId        String
  amount            Decimal  @db.Decimal(12, 2)
  unallocatedAmount Decimal  @db.Decimal(12, 2)
  currency          String   @default("USD")
  method            String   // BANK, CARD, CASH
  transactionRef    String?
  status            String   @default("RECORDED") // RECORDED, ALLOCATED, REVERSED
  paymentDate       DateTime @default(now())
  
  recordedById      String
  notes             String?

  customer          Customer @relation(fields: [customerId], references: [id])
  recordedBy        User     @relation("PaymentRecorder", fields: [recordedById], references: [id])
  
  allocations       PaymentAllocation[]
}

model PaymentAllocation {
  id              String   @id @default(uuid())
  paymentId       String
  invoiceId       String
  allocatedAmount Decimal  @db.Decimal(12, 2)
  createdAt       DateTime @default(now())

  payment         Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Restrict)
}

model CreditNote {
  id               String   @id @default(uuid())
  creditNoteNumber String   @unique
  invoiceId        String
  customerId       String
  amount           Decimal  @db.Decimal(12, 2)
  reason           String
  status           String   @default("DRAFT") // DRAFT, APPROVED, ISSUED
  
  createdById      String
  approvedById     String?
  createdAt        DateTime @default(now())

  invoice          Invoice  @relation(fields: [invoiceId], references: [id])
  customer         Customer @relation(fields: [customerId], references: [id])
  createdBy        User     @relation("CreditCreator", fields: [createdById], references: [id])
  approvedBy       User?    @relation("CreditApprover", fields: [approvedById], references: [id])
}

model SupplierInvoice {
  id            String   @id @default(uuid())
  invoiceNumber String   @unique
  supplierId    String
  poId          String?
  amount        Decimal  @db.Decimal(12, 2)
  taxAmount     Decimal  @default(0) @db.Decimal(12, 2)
  status        String   @default("PENDING") // PENDING, APPROVED, PAID
  dueDate       DateTime?
  
  supplier      Supplier       @relation(fields: [supplierId], references: [id])
  purchaseOrder PurchaseOrder? @relation(fields: [poId], references: [id])
}
`;

fs.writeFileSync('prisma/schema.prisma', txt + newModels);

// Append back-relations to Customer
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model Customer \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoices Invoice[]\n  payments Payment[]\n  creditNotes CreditNote[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to User
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model User \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  createdInvoices Invoice[] @relation("InvoiceCreator")\n  approvedInvoices Invoice[] @relation("InvoiceApprover")\n  recordedPayments Payment[] @relation("PaymentRecorder")\n  createdCreditNotes CreditNote[] @relation("CreditCreator")\n  approvedCreditNotes CreditNote[] @relation("CreditApprover")\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to CustomerOrder
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model CustomerOrder \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoices Invoice[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to Shipment
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model Shipment \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoices Invoice[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to Item
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model Item \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoiceLines InvoiceLine[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to Supplier
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model Supplier \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoices SupplierInvoice[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

// Append back-relations to PurchaseOrder
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model PurchaseOrder \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  invoices SupplierInvoice[]\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

console.log('Schema 11 update complete.');
