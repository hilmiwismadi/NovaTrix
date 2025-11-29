/**
 * Data Migration Script: Update SOA Implementation Status Values
 *
 * Changes:
 * - not-started → not-implemented
 * - verified → implemented
 * - implemented → partially-implemented
 * - planned → planned (unchanged)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSOAStatus() {
  console.log('Starting SOA status migration...');

  try {
    // Get all SOA entries
    const entries = await prisma.sOAEntry.findMany();
    console.log(`Found ${entries.length} SOA entries to migrate`);

    let updated = 0;

    for (const entry of entries) {
      let newStatus = entry.implementationStatus;

      // Map old values to new values
      if (entry.implementationStatus === 'not-started') {
        newStatus = 'not-implemented';
      } else if (entry.implementationStatus === 'verified') {
        newStatus = 'implemented';
      } else if (entry.implementationStatus === 'implemented') {
        newStatus = 'partially-implemented';
      }
      // 'planned' stays as 'planned'

      // Update if changed
      if (newStatus !== entry.implementationStatus) {
        await prisma.sOAEntry.update({
          where: { id: entry.id },
          data: { implementationStatus: newStatus }
        });
        console.log(`  Updated ${entry.controlId}: ${entry.implementationStatus} → ${newStatus}`);
        updated++;
      }
    }

    console.log(`\nMigration complete! Updated ${updated} entries.`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateSOAStatus()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
