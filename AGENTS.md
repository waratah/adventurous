# AGENTS.md instructions for Scouts Adventurous Activities Application

Project uses angular version 21 and prefers to use signals for most work.

It uses css with variables and prefer bleeding edge type layouts.

The applications should be PWA so they load up with any network available. They automatically upgrade.

## Unit testing

When running Nx commands in this workspace, set `NX_DAEMON=false`. The Nx daemon can fail in the Codex sandbox when it tries to create its local socket, so commands such as tests should be run like:

```sh
NX_DAEMON=false npx nx test score-card
```

## Purpose

The Scouts Adventurous Activities application is a mobile-first tool for recording, checking, and verifying practical adventurous activity competencies.

The application is intended to support Scouts Australia adventurous activities. The initial activity focus is abseiling, but the system should grow to cover the broader set of adventurous activities used by Scouts Australia.

## Core Principle

This is a maker/checker application.

The trainee records that they have completed a required activity, task, or competency. A guide-level user then verifies that the trainee actually completed the activity to the required standard.

The application must support this process in the field, where phone signal and internet access may be unavailable.

## Mobile First And Offline First

The application is mobile first. It should be comfortable to use on a phone during an activity session, at a campsite, at a cliff, on the water, or in other outdoor environments.

The application must store working data locally and continue to work offline. Trainees and guide-level users should be able to answer questions, record completed tasks, and capture verification work even when there is no phone signal.

When an internet connection becomes available again, local changes should upload automatically. The user should not have to remember to manually sync normal work.

The system should make it clear when data is waiting to sync, when sync is in progress, and when the device is fully up to date.

Since the data can overwrite one another there are some important sync rules.

1. A trainee can check and change their sign off.   However every action should be logged to say who checked it done and when.
2. A sign off by a verifier may sync after the user has checked offline. Also multiple verifiers may sync.
3. Since the idea is to check that the trainee really knows the status.  It would be good to report multiple verifiers for the same question.

## User Roles

### Trainee

The trainee records their own progress.

They can:

- Select an adventurous activity.
- Work through the relevant questions, tasks, or competencies.
- Record that they have completed a task.
- Add supporting notes or evidence where required.
- Keep working while offline.
- Have their local changes uploaded once the internet reconnects.

#### Trainee levels

There are different levels of trainee.   They are deliberately align to nsw scouts colours for cubs,  scouts,  venturers and rovers.  So safe participant aligns to cubs,   trained participant aligns to scouts,  assistant guide aligns to venturers,  and a full guide aligns to rovers colours.  There is also an assessor level that is above guide.

### verifying in general

IN this space you have to be at least one level above the approval in order to be able to verify. A trained participant can verify safe participant.  A trained participant can approve a safe participant standing.

A trained participant (TP) can verify certain activities of other trained participants.  The exact mechanism of this is subject to further thought.   However if the verification is a trained participant at the time of the sign off the record will be clearly marked as verified by TP.   The assistant guide or Guide can overwrite the sign off at any time to remove ambiguity that they observed the TP doing the harder skills.

A trained participant can check a safe participant has done an activity and also verify it.  Often the safe participant will attend a weekend and not even know they have done a certain element of the training.

An assistant guide can check off a trained participants activities.   The trained participant will sometimes not know that they have completed the required activity.



### Guide Or Verifier

The guide-level user checks and verifies trainee activity records.

They can:

- Review trainee-completed tasks.
- Confirm that a trainee actually participated in, performed, or completed the activity.
- Verify tasks that meet the required standard.
- Leave tasks unverified when they have not been observed or do not meet the requirement.
- Work offline during activity delivery and sync verification decisions later.

## Assessor level

An assessor is above guide.  They are allowed to make the transition from assistant guide to a formal guide.  They consider not just paperwork but the informal elements of the approval.

Any guide can request assessor status through the app.  They can only request once every 3 months.

Any assessor of this group will have a list of assessor requests,  they can decline or accept with a comment as to why.   They can also check the list of guides for the group and initiate the move from guide to assessor.   Any move to assessor will generate a message to the administrator.

Assessors can modify any question.  Any modification will create a new questions.

Assessors can add questions.

Questions are often matched across groupings.  For example First aid is a very common question.  Two questions may be created on two groups separately.  There will be a way to merge the two questions into one.

## Activity Model

The application should support multiple adventurous activities.

Initial focus:

- Abseiling

Future scope:

- All relevant Scouts Australia adventurous activities.

Activities should be represented in a way that allows each activity to define its own groups of questions, tasks, competencies, evidence requirements, and verification requirements.

## Logging Framework Direction

Over time, the application should become a broader logging framework for adventurous activity participation and competency evidence.

The future system should be able to record:

- What activity a person signed up for.
- What activity a person attended.
- What tasks, competencies, or experiences were completed.
- Who verified the completion or participation.
- When the verification occurred.

Where possible, the application should reference existing online Scouts systems so that activity sign-up or participation data can be linked instead of re-entered manually.

Ultimately, the application should support a verifier confirming that a person actually participated in an activity, not only that they self-recorded completion.

## Data And Sync Expectations

The application should treat local data as the working source while offline.

Expected sync behaviour:

- Record trainee changes locally immediately.
- Record verifier changes locally immediately.
- Queue unsynced changes.
- Automatically upload queued changes when connectivity returns.
- Avoid losing work if the app is closed, the device loses power, or the network drops during a session.
- Handle conflicts carefully, especially where a verifier has already checked a trainee record.

The sync process should protect the integrity of verifier decisions. A trainee should not be able to overwrite or remove verification records without an explicit permission model.

## Product Direction

The product should remain practical and field-oriented.

Important qualities:

- Fast on mobile devices.
- Reliable without phone signal.
- Clear about what has been completed, what has been verified, and what is still outstanding.
- Simple enough to use during real activity delivery.
- Structured enough to support official records and later reporting.

This reference should guide future feature decisions and architecture changes.
