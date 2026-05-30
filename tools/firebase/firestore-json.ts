import * as admin from 'firebase-admin';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface FirestoreJson {
  format: 'adventurous-firestore-json';
  version: 1;
  exportedAt: string;
  projectId: string;
  collections: FirestoreCollection[];
}

interface FirestoreCollection {
  path: string;
  documents: FirestoreDocument[];
}

interface FirestoreDocument {
  id: string;
  path: string;
  data: Record<string, JsonValue>;
  collections: FirestoreCollection[];
}

interface CliOptions {
  command: string;
  credential?: string;
  output?: string;
  input?: string;
  project?: string;
  targetProject?: string;
  deleteMissing?: boolean;
  includeSubcollections?: boolean;
  discoverCollections?: boolean;
  collections?: string[];
}

const defaultCollections = ['answers', 'auditLogs', 'groups', 'questions', 'security', 'users'];

function parseArgs(argv: string[]): CliOptions {
  const [command = 'help', ...rest] = argv;
  const options: CliOptions = { command };

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        options.command = 'help';
        break;
      case '--credential':
        options.credential = next;
        i++;
        break;
      case '--output':
        options.output = next;
        i++;
        break;
      case '--input':
        options.input = next;
        i++;
        break;
      case '--project':
        options.project = next;
        i++;
        break;
      case '--target-project':
        options.targetProject = next;
        i++;
        break;
      case '--delete-missing':
        options.deleteMissing = true;
        break;
      case '--include-subcollections':
        options.includeSubcollections = true;
        break;
      case '--discover-collections':
        options.discoverCollections = true;
        break;
      case '--collections':
        options.collections = next.split(',').map(name => name.trim()).filter(Boolean);
        i++;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function usage(exitCode = 1): never {
  console.log(`
Usage:
  npm run firebase:backup -- --credential /path/service-account.json
  npm run firebase:export -- --credential /path/service-account.json --output backups/manual.json
  npm run firebase:import -- --credential /path/test-service-account.json --input backups/manual.json --target-project test-project-id

Options:
  --credential       Service account JSON path. Defaults to GOOGLE_APPLICATION_CREDENTIALS.
  --project          Source project id override for export/backup.
  --target-project   Target project id override for import.
  --output           Export JSON path.
  --input            Import JSON path.
  --delete-missing   Import only: delete target docs missing from the JSON export.
  --include-subcollections
                     Export nested subcollections as well as root collections.
  --collections      Comma-separated root collection names. Defaults to the app collections.
  --discover-collections
                     Discover all root collections instead of using --collections/defaults.
`);
  process.exit(exitCode);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === 'help' || options.command === '--help') {
    usage(0);
  }

  const app = await initializeFirebase(options);
  const db = admin.firestore(app);

  if (options.command === 'backup') {
    const backup = await exportDatabase(db, app.options.projectId || options.project || 'unknown-project', options);
    const output = options.output || defaultBackupPath(backup.projectId);
    await writeJson(output, backup);
    console.log(`Backed up ${countDocuments(backup)} documents to ${output}`);
    return;
  }

  if (options.command === 'export') {
    if (!options.output) {
      throw new Error('export requires --output');
    }
    const backup = await exportDatabase(db, app.options.projectId || options.project || 'unknown-project', options);
    await writeJson(options.output, backup);
    console.log(`Exported ${countDocuments(backup)} documents to ${options.output}`);
    return;
  }

  if (options.command === 'import') {
    if (!options.input) {
      throw new Error('import requires --input');
    }
    const backup = JSON.parse(await fs.readFile(options.input, 'utf8')) as FirestoreJson;
    validateBackup(backup);
    await importDatabase(db, backup, Boolean(options.deleteMissing));
    console.log(`Imported ${countDocuments(backup)} documents from ${options.input}`);
    return;
  }

  usage();
}

async function initializeFirebase(options: CliOptions): Promise<admin.app.App> {
  const credentialPath = options.credential || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath) {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or pass --credential /path/service-account.json');
  }

  const serviceAccount = JSON.parse(await fs.readFile(credentialPath, 'utf8'));
  const projectId = options.targetProject || options.project || serviceAccount.project_id;

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

async function exportDatabase(
  db: FirebaseFirestore.Firestore,
  projectId: string,
  options: CliOptions
): Promise<FirestoreJson> {
  const collectionRefs = options.discoverCollections
    ? await db.listCollections()
    : (options.collections || defaultCollections).map(collectionName => db.collection(collectionName));

  const exportedCollections = [];

  for (const collectionRef of collectionRefs) {
    exportedCollections.push(await exportCollection(collectionRef, Boolean(options.includeSubcollections)));
  }

  return {
    format: 'adventurous-firestore-json',
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId,
    collections: exportedCollections,
  };
}

async function exportCollection(
  collectionRef: FirebaseFirestore.CollectionReference,
  includeSubcollections: boolean
): Promise<FirestoreCollection> {
  const snapshot = await collectionRef.get();
  const documents = [];

  for (const doc of snapshot.docs) {
    const collections = [];

    if (includeSubcollections) {
      const childCollections = await doc.ref.listCollections();

      for (const childCollection of childCollections) {
        collections.push(await exportCollection(childCollection, includeSubcollections));
      }
    }

    documents.push({
      id: doc.id,
      path: doc.ref.path,
      data: encodeValue(doc.data()) as Record<string, JsonValue>,
      collections,
    });
  }

  return {
    path: collectionRef.path,
    documents,
  };
}

async function importDatabase(
  db: FirebaseFirestore.Firestore,
  backup: FirestoreJson,
  deleteMissing: boolean
): Promise<void> {
  for (const collection of backup.collections) {
    await importCollection(db, collection, deleteMissing);
  }
}

async function importCollection(
  db: FirebaseFirestore.Firestore,
  collection: FirestoreCollection,
  deleteMissing: boolean
): Promise<void> {
  const collectionRef = db.collection(collection.path);
  const incomingIds = new Set(collection.documents.map(document => document.id));

  if (deleteMissing) {
    const existing = await collectionRef.get();
    await commitBatches(
      db,
      existing.docs.filter(document => !incomingIds.has(document.id)).map(document => batch => batch.delete(document.ref))
    );
  }

  await commitBatches(
    db,
    collection.documents.map(document => batch => {
      const ref = db.doc(document.path);
      batch.set(ref, decodeValue(document.data));
    })
  );

  for (const document of collection.documents) {
    for (const childCollection of document.collections) {
      await importCollection(db, childCollection, deleteMissing);
    }
  }
}

async function commitBatches(
  db: FirebaseFirestore.Firestore,
  writes: Array<(batch: FirebaseFirestore.WriteBatch) => void>
): Promise<void> {
  for (let i = 0; i < writes.length; i += 450) {
    const batch = db.batch();
    writes.slice(i, i + 450).forEach(write => write(batch));
    await batch.commit();
  }
}

function encodeValue(value: unknown): JsonValue {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as JsonValue;
  }

  if (value instanceof Date) {
    return { __type: 'date', value: value.toISOString() };
  }

  if (value instanceof admin.firestore.Timestamp) {
    return { __type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds };
  }

  if (value instanceof admin.firestore.GeoPoint) {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  }

  if (value instanceof admin.firestore.DocumentReference) {
    return { __type: 'reference', path: value.path };
  }

  if (value instanceof Buffer) {
    return { __type: 'bytes', base64: value.toString('base64') };
  }

  if (Array.isArray(value)) {
    return value.map(item => encodeValue(item));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)]));
  }

  throw new Error(`Unsupported Firestore value type: ${typeof value}`);
}

function decodeValue(value: JsonValue): FirebaseFirestore.DocumentData {
  if (value === null || typeof value !== 'object') {
    return value as FirebaseFirestore.DocumentData;
  }

  if (Array.isArray(value)) {
    return value.map(item => decodeValue(item));
  }

  if (value.__type === 'date' && typeof value.value === 'string') {
    return new Date(value.value);
  }

  if (value.__type === 'timestamp' && typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
    return new admin.firestore.Timestamp(value.seconds, value.nanoseconds);
  }

  if (value.__type === 'geopoint' && typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return new admin.firestore.GeoPoint(value.latitude, value.longitude);
  }

  if (value.__type === 'reference' && typeof value.path === 'string') {
    return admin.firestore().doc(value.path);
  }

  if (value.__type === 'bytes' && typeof value.base64 === 'string') {
    return Buffer.from(value.base64, 'base64');
  }

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeValue(item)]));
}

function validateBackup(backup: FirestoreJson): void {
  if (backup.format !== 'adventurous-firestore-json' || backup.version !== 1 || !Array.isArray(backup.collections)) {
    throw new Error('Input is not an adventurous Firestore JSON export');
  }
}

function countDocuments(backup: FirestoreJson): number {
  return backup.collections.reduce((total, collection) => total + countCollectionDocuments(collection), 0);
}

function countCollectionDocuments(collection: FirestoreCollection): number {
  return collection.documents.reduce(
    (total, document) => total + 1 + document.collections.reduce((childTotal, child) => childTotal + countCollectionDocuments(child), 0),
    0
  );
}

function defaultBackupPath(projectId: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join('backups', 'firestore', projectId, `${stamp}.json`);
}

async function writeJson(output: string, data: FirestoreJson): Promise<void> {
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    const app = admin.apps[0];
    return app?.delete().catch(() => undefined);
  });
