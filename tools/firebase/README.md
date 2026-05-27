# Firestore JSON Backups

These scripts use the Firebase Admin SDK to export Firestore into portable JSON and import that JSON into another Firebase project.

The same tool area also includes security role management. See [User Verification And Access Management](../../docs/user-guide.md#user-verification-and-access-management) for the account status and administrator process.

## Credentials

Create a Firebase service account key for the source project and store it outside the repo, for example:

```sh
/Users/ken/source/firebase/adventurousscorecard.json
```

Then either pass it to each command:

```sh
npm run firebase:backup -- --credential /Users/ken/source/firebase/adventurousscorecard.json
```

or set:

```sh
export GOOGLE_APPLICATION_CREDENTIALS=/Users/ken/source/firebase/adventurousscorecard.json
```

## Regular Backup

Run this from the repository root:

```sh
npm run firebase:backup -- --credential /Users/ken/source/firebase/adventurousscorecard.json
```

It writes timestamped files under:

```text
backups/firestore/<project-id>/<timestamp>.json
```

`backups/` is ignored by git because these files can contain private participant data.

By default the export reads root collections only, which matches the current app data model. If nested subcollections are added later, include them with:

```sh
--include-subcollections
```

By default the export reads these root collections:

```text
answers, groups, questions, security, users
```

To export a different set:

```sh
--collections answers,groups,questions,security,users,logs
```

To discover every root collection in the project:

```sh
--discover-collections
```

## Manual JSON Export

Use this when you want a named JSON file to archive or import elsewhere:

```sh
npm run firebase:export -- --credential /Users/ken/source/firebase/adventurousscorecard.json --output backups/manual/adventurousscorecard.json
```

## Import Into A Test Project

Create a separate service account key for the test Firebase project, then run:

```sh
npm run firebase:import -- --credential /Users/ken/source/firebase/adventurousscorecard-test.json --input backups/manual/adventurousscorecard.json --target-project adventurousscorecard-test
```

The import overwrites documents found in the JSON export. It does not delete documents that exist only in the target project unless you add:

```sh
--delete-missing
```

Use `--delete-missing` carefully on test projects only.

## Scheduling

On macOS, schedule the regular backup with cron or launchd. A simple daily cron entry is:

```cron
15 2 * * * cd /Users/ken/source/adventurous && /usr/bin/env GOOGLE_APPLICATION_CREDENTIALS=/Users/ken/source/firebase/adventurousscorecard.json npm run firebase:backup >> /Users/ken/source/adventurous/backups/firestore.log 2>&1
```

This runs at 2:15am each day.
