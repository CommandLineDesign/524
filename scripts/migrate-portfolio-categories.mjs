#!/usr/bin/env node

/**
 * Migration script to add service categories to existing portfolio images
 *
 * This script:
 * 1. Fetches all artists with portfolio images
 * 2. For each artist, distributes their portfolio images across their service categories
 * 3. Updates the database with categorized portfolio data
 *
 * Run with: node scripts/migrate-portfolio-categories.mjs
 */

import { eq } from 'drizzle-orm';
import { db } from '../packages/database/src/index.js';
import { artistProfiles } from '../packages/database/src/schema/artistProfiles.js';

/**
 * Distributes images across service categories
 * Since all current data is test data, we distribute randomly
 */
function distributeImagesAcrossCategories(images, specialties) {
  if (!images || images.length === 0) {
    return [];
  }

  if (!specialties || specialties.length === 0) {
    // No specialties - randomly assign to hair or makeup
    return images.map((img) => ({
      ...img,
      serviceCategory: Math.random() > 0.5 ? 'hair' : 'makeup',
    }));
  }

  // Filter out 'combo' as it's not a distinct category
  const distinctSpecialties = specialties.filter((s) => s !== 'combo');

  if (distinctSpecialties.length === 0) {
    // Only combo specialty - randomly assign to hair or makeup
    return images.map((img) => ({
      ...img,
      serviceCategory: Math.random() > 0.5 ? 'hair' : 'makeup',
    }));
  }

  // Distribute images evenly across distinct specialties
  return images.map((img, index) => {
    const categoryIndex = index % distinctSpecialties.length;
    return {
      ...img,
      serviceCategory: distinctSpecialties[categoryIndex],
    };
  });
}

async function migratePortfolioCategories() {
  console.log('Starting portfolio category migration...\n');

  try {
    // Fetch all artists
    const artists = await db.select().from(artistProfiles);
    console.log(`Found ${artists.length} artists to process.\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const artist of artists) {
      try {
        // Skip if no portfolio images
        if (!artist.portfolioImages || artist.portfolioImages.length === 0) {
          skipped++;
          continue;
        }

        // Check if already migrated (has serviceCategory field)
        const alreadyMigrated = artist.portfolioImages.some(
          (img) => img.serviceCategory !== undefined
        );

        if (alreadyMigrated) {
          console.log(
            `  ⏭️  Skipping ${artist.stageName} - already migrated (${artist.portfolioImages.length} images)`
          );
          skipped++;
          continue;
        }

        // Distribute images across categories
        const updatedImages = distributeImagesAcrossCategories(
          artist.portfolioImages,
          artist.specialties
        );

        // Update the artist profile
        await db
          .update(artistProfiles)
          .set({
            portfolioImages: updatedImages,
            updatedAt: new Date(),
          })
          .where(eq(artistProfiles.id, artist.id));

        // Log the migration
        const categoryCount = updatedImages.reduce((acc, img) => {
          acc[img.serviceCategory] = (acc[img.serviceCategory] || 0) + 1;
          return acc;
        }, {});

        console.log(
          `  ✅ Migrated ${artist.stageName} (${updatedImages.length} images):`,
          categoryCount
        );
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating ${artist.stageName}:`, error.message);
        errors++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Migrated:  ${migrated} artists`);
    console.log(`⏭️  Skipped:   ${skipped} artists (no images or already migrated)`);
    console.log(`❌ Errors:    ${errors} artists`);
    console.log(`📊 Total:     ${artists.length} artists processed`);
    console.log('='.repeat(60));

    if (errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migratePortfolioCategories()
  .then(() => {
    console.log('\n✨ Migration completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
