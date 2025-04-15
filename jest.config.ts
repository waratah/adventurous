import { getJestProjectsAsync } from '@nx/jest';

require('jest-fetch-mock').enableMocks();

export default async () => ({
  projects: await getJestProjectsAsync(),
  testEnvironment: "@happy-dom/jest-environment",
});
