# Adventurous Activities User Guide

## Overview

The Adventurous Activities app (AA) is mobile-first for recording and verifying practical adventurous activity tasks.

It is designed for field use where internet access may be unreliable. The AA app stores working data on the device and uploads changes automatically when the internet connection returns.

The app has two main roles:

- The Trainee records that they have completed tasks.
- Guides or verifiers check completed trainee tasks and verify the ones they have observed or accepted.  All tracked and logged.

This framework will support all Scouts Australia adventurous activities.  Initially we have created the Abseiling skills to enable us to track these first as a proving ground for the technology.

## Getting Started

Open the app on your phone, tablet, or computer.

If you already have an account:

1. Select `Login`.
2. Enter your Scouts email address and password.
3. After successful login, the app returns to the activity/home screen.

If you are new:

1. Select `Create a new user`.
2. Enter your user details.
3. Save the user record.
4. Login with your new account.

There is also a guest login for demonstration or testing.

If you are a guide please contact the administrator currently ken.foskey@nsw.scouts.com.au

## Sync Status

The top toolbar shows the current sync state.

- `Synced` means the device is online and there are no known pending writes.
- `Syncing` means changes are being uploaded.
- `Offline` means the device is offline.
- `waiting` means changes have been recorded locally and are waiting for internet access.

Normal trainee and verifier changes should be made in the app even when offline. The app uploads them automatically when the device reconnects.

## Selecting An Activity

The home screen lists the available adventurous activity groups.

To open an activity:

1. Select the activity button on the home screen, or use the menu in the top toolbar.
2. The scorecard opens for that activity.
3. Sections are colour-coded by level:
   - Safe Participant
   - Trained Participant
   - Assistant Guide
   - Guide

Each section shows how many tasks have been completed.

## Recording Trainee Progress

Trainees use the scorecard to record their own work.

For checkbox tasks:

1. Read the task statement.
2. Tick `Done` when you have completed it.
3. The app records who marked it done and when.

For text-answer tasks:

1. Enter the required note or answer.
2. Leave the field or move to another item.
3. The app marks the item done when text is present.

For evidence or attachment tasks:

1. Use the attachment button.
2. Upload the required proof.
3. The item is marked done when the proof is attached.

If a guide has already verified a task, the trainee cannot change that completed record from the normal scorecard.

## Guide Verification

Guides verify completed trainee tasks.

The guide should only verify tasks they have observed, checked, or accepted as meeting the required standard.

To verify a task:

1. Open the activity in verify mode.
2. Review the trainee's completed tasks.
3. Tick `Verify` for tasks that meet the requirement.
4. Leave tasks unticked if they have not been observed or do not meet the requirement.

The app records who verified the task and when.

Verification is only available for tasks the trainee has already marked done. A guide cannot verify a task before the trainee record exists.

## Verifying Another Participant

A guide-level user can open the user list and select a participant to verify for the currently selected activity.

General flow:

1. Select the activity first.
2. Open `Users` from the menu.
3. Find the participant.
4. Select `Verify`.
5. The scorecard shows `Verifying participant <scout number>`.
6. Tick verification only for completed tasks that meet the standard.

## PDF And Logbook

The app can produce PDF workbook output for the selected activity.

Use the menu option for PDF workbooks when available.

The home screen also links to the Adventurous Activities logbook template. The scorecard helps collect evidence and answers, but it does not replace all official Scouts submission requirements.

Completed and verified tasks may still need to be submitted through the required Scouts NSW or Scouts Australia process.

## Working Offline

The app is intended to be usable without phone signal.

When offline:

- Open the app before going into the field if possible.
- Keep the browser tab/app available on the device.
- Record trainee completions as usual.
- Record guide verification as usual.
- Watch the sync status for pending changes.

When the connection returns, the app uploads queued changes automatically.

Avoid clearing browser storage or signing out before pending changes have synced.

## Admin And Editing

Admin users may have access to edit activity groups, questions, and scorecard structure.

Use editing carefully. Activity structure changes can affect what trainees and guides see in scorecards and PDFs.

For normal field use, trainees and guides should not need admin editing.

## User Verification And Access Management

User access is managed through the Firebase `security` collection and Firebase Authentication custom claims.

Each account can have a verification status:

- `verified-safe`: verified safe participant.
- `trained-participant`: trained participant.
- `assistant-guide`: assistant guide.
- `guide`: guide.
- `assessor`: assessor.

The current application uses the `isVerify` claim to allow access to guide verification screens. Accounts at `trained-participant`, `assistant-guide`, `guide`, or `assessor` are treated as verifier-capable by the management script. `verified-safe` confirms participant status but does not grant verifier access.

Administrator access is separate from verification status. An administrator is still subject to the same verification process as every other participant or guide, but can see all users, use administrative screens, and change another user from one status to another. Treat administrator as a root-level operational role, not as proof that the person is a guide or assessor.

The initial administrator account is Scouts membership number `174424`. From the repository root, set that account as administrator with:

```sh
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 174424 --admin
```

When changing another account, first confirm the person has a user record and that their email address in `users/<scout-number>` matches their Firebase Authentication account. Then run one of these commands:

```sh
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --status verified-safe
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --status trained-participant
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --status assistant-guide
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --status guide
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --status assessor
```

To make another administrator, use:

```sh
npm run firebase:security -- --credential /Users/ken/source/firebase/adventurousscorecard.json --scout-number 123456 --admin
```

Administrator promotion should use a two-person process: one existing administrator requests the change, another administrator or assessor confirms the need, and a Firestore backup is taken before the change. Keep at least two administrator accounts active so the system can be recovered if one administrator loses access. Remove administrator access when the operational need ends.

After role changes, the affected user should log out and back in so their refreshed Firebase custom claims are used by the app.

## Good Practice

- Record completions as close as possible to when the task is done.
- Verify only what has actually been observed or properly checked.
- Leave uncertain items unverified.
- Check sync status before closing the app at the end of an activity session.
- Use the PDF and logbook output as supporting records, not as a substitute for required official submission steps.

## Troubleshooting

If login succeeds but the app stays on the login page, reload the app and try again.

If data does not appear immediately, check the sync status and internet connection.

If the app shows offline, keep using it and let it sync when the connection returns.

If a verified item needs correction, treat it as an admin or permission-controlled correction rather than a normal trainee edit.
