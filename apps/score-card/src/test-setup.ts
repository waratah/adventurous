import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

require('jest-fetch-mock').enableMocks();


setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
