import 'dotenv/config';
import { seedApplicantPermissions } from './permission.seed';
import dataSource from 'db/data_source';

async function runSeed() {
  try {
    await dataSource.initialize();

    console.log('Database Connected');

    await seedApplicantPermissions(dataSource);

    console.log('Seed Finished');
  } catch (error) {
    console.log('Seed Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();