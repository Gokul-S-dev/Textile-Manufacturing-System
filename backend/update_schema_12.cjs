const fs = require('fs');
let txt = fs.readFileSync('prisma/schema.prisma', 'utf8');

const newModels = `

// ============================================================================
// PHASE 12: NOTIFICATIONS, ALERTS & WORKFLOW AUTOMATION
// ============================================================================

model NotificationEvent {
  id              String   @id @default(uuid())
  eventType       String   // e.g. 'inventory.low_stock'
  payload         Json     // Event data
  status          String   @default("PENDING") // PENDING, PROCESSED, FAILED
  errorMsg        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model NotificationRule {
  id              String   @id @default(uuid())
  name            String
  eventType       String
  roles           Json     // Array of role names
  channels        Json     // Array of channels e.g. ["IN_APP", "EMAIL"]
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Notification {
  id              String   @id @default(uuid())
  userId          String
  eventId         String?
  title           String
  body            String
  type            String   // INFO, WARNING, ERROR, SUCCESS
  relatedEntityId String?
  relatedEntityType String?
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  user            User     @relation("UserNotifications", fields: [userId], references: [id])
}

model NotificationDelivery {
  id              String   @id @default(uuid())
  notificationId  String
  channel         String   // EMAIL
  recipient       String   // Email address
  status          String   @default("PENDING") // PENDING, SENT, FAILED
  retryCount      Int      @default(0)
  lastError       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model NotificationPreference {
  id              String   @id @default(uuid())
  userId          String   @unique
  emailEnabled    Boolean  @default(true)
  inAppEnabled    Boolean  @default(true)
  
  user            User     @relation("UserNotificationPreferences", fields: [userId], references: [id])
}
`;

fs.writeFileSync('prisma/schema.prisma', txt + newModels);

// Append back-relations to User
txt = fs.readFileSync('prisma/schema.prisma', 'utf8');
txt = txt.replace(/model User \{[\s\S]*?\}/, (match) => {
  return match.replace('}', '  notifications Notification[] @relation("UserNotifications")\n  notificationPreference NotificationPreference? @relation("UserNotificationPreferences")\n}');
});
fs.writeFileSync('prisma/schema.prisma', txt);

console.log('Schema 12 update complete.');
