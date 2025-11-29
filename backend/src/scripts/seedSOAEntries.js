/**
 * Seed SOA Entries
 * Creates SOA entries for all Annex A controls that don't have one yet
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSOAEntries() {
  console.log('Starting SOA entries seed...');

  try {
    // Get all Annex A controls
    const controls = await prisma.annexAControl.findMany();
    console.log(`Found ${controls.length} Annex A controls`);

    let created = 0;
    let skipped = 0;

    for (const control of controls) {
      // Check if SOA entry already exists
      const existingEntry = await prisma.sOAEntry.findUnique({
        where: { controlId: control.id }
      });

      if (existingEntry) {
        skipped++;
        continue;
      }

      // Create SOA entry with default values
      await prisma.sOAEntry.create({
        data: {
          controlId: control.id,
          applicability: 'not-determined',
          justification: null,
          implementationStatus: 'not-implemented',
          implementationMethod: null,
          responsibleParty: null,
          targetDate: null
        }
      });

      console.log(`  Created SOA entry for ${control.id}`);
      created++;
    }

    console.log(`\nSeed complete!`);
    console.log(`  Created: ${created} entries`);
    console.log(`  Skipped: ${skipped} entries (already exist)`);

  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedSOAEntries()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
