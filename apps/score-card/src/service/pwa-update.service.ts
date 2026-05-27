import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { filter, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  constructor(appRef: ApplicationRef, updates: SwUpdate) {
    if (!updates.isEnabled) {
      return;
    }

    updates.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(async () => {
        await updates.activateUpdate();
        document.location.reload();
      });

    updates.unrecoverable.subscribe(() => document.location.reload());

    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable));
    concat(appIsStable$, interval(6 * 60 * 60 * 1000)).subscribe(() => updates.checkForUpdate());
  }
}
