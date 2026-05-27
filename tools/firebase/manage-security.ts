import * as admin from 'firebase-admin';
import * as fs from 'node:fs';

type VerificationStatus = 'verified-safe' | 'trained-participant' | 'assistant-guide' | 'guide' | 'assessor';

interface CliOptions {
  admin?: boolean;
  credential?: string;
  isVerify?: boolean;
  scoutNumber?: string;
  status?: VerificationStatus;
}

const verifierStatuses = new Set<VerificationStatus>(['trained-participant', 'assistant-guide', 'guide', 'assessor']);

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case '--admin':
        options.admin = true;
        break;
      case '--credential':
        options.credential = next;
        i++;
        break;
      case '--is-verify':
        options.isVerify = true;
        break;
      case '--scout-number':
        options.scoutNumber = next;
        i++;
        break;
      case '--status':
        options.status = parseStatus(next);
        i++;
        break;
      case '--help':
      case '-h':
        usage(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function parseStatus(value: string | undefined): VerificationStatus {
  const statuses: VerificationStatus[] = ['verified-safe', 'trained-participant', 'assistant-guide', 'guide', 'assessor'];
  if (statuses.includes(value as VerificationStatus)) {
    return value as VerificationStatus;
  }

  throw new Error(`--status must be one of: ${statuses.join(', ')}`);
}

function usage(exitCode = 1): never {
  console.log(`
Usage:
  npm run firebase:security -- --credential /path/service-account.json --scout-number 174424 --admin
  npm run firebase:security -- --credential /path/service-account.json --scout-number 123456 --status guide

Options:
  --credential      Service account JSON path. Defaults to GOOGLE_APPLICATION_CREDENTIALS.
  --scout-number    Scouts membership number matching users/{scout-number}.
  --status          verified-safe, trained-participant, assistant-guide, guide, or assessor.
  --admin           Grant administrator access. Admin is independent of verification status.
  --is-verify       Force verifier access for exceptional cases.
`);
  process.exit(exitCode);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const credentialPath = options.credential || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialPath) {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or pass --credential /path/service-account.json');
  }

  if (!options.scoutNumber) {
    throw new Error('Pass --scout-number');
  }

  const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  const userSnapshot = await db.collection('users').doc(options.scoutNumber).get();
  const user = userSnapshot.data();

  if (!user) {
    throw new Error(`No user found at users/${options.scoutNumber}`);
  }

  const email = user.email;
  if (!email || typeof email !== 'string') {
    throw new Error(`users/${options.scoutNumber} does not have an email address`);
  }

  const authUser = await admin.auth().getUserByEmail(email);
  const existingSnapshot = await db.collection('security').doc(authUser.uid).get();
  const existing = existingSnapshot.data() || {};
  const verificationStatus = options.status || parseExistingStatus(existing.verificationStatus);
  const isAdmin = options.admin || existing.isAdmin === true;
  const isVerify = options.isVerify || (verificationStatus ? verifierStatuses.has(verificationStatus) : existing.isVerify === true);
  const security = removeUndefined({
    isAdmin: isAdmin || undefined,
    isVerify: isVerify || undefined,
    scoutNumber: options.scoutNumber,
    uid: authUser.uid,
    verificationStatus,
  });

  await db.collection('security').doc(authUser.uid).set(security, { merge: true });

  const claims = removeUndefined({
    isAdmin: isAdmin || undefined,
    isVerify: isVerify || undefined,
    scoutNumber: options.scoutNumber,
    verificationStatus,
  });

  await admin.auth().setCustomUserClaims(authUser.uid, claims);

  console.log(`Updated security/${authUser.uid} for scout ${options.scoutNumber}`);
  console.log(JSON.stringify(claims, null, 2));
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function parseExistingStatus(value: unknown): VerificationStatus | undefined {
  if (!value) {
    return undefined;
  }

  return parseStatus(String(value));
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => admin.apps[0]?.delete().catch(() => undefined));
