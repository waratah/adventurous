import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../edit/editGroup.component').then((m) => m.EditGroupComponent),
  },
  {
    path: 'user/new',
    loadComponent: () =>
      import('../user/user-new/user-new.component').then((m) => m.UserNewComponent),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('../user/user-settings/user-settings.component').then((m) => m.UserSettingsComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('../user/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: 'pdf/user',
    loadComponent: () =>
      import('../PDF/pdf-user.component').then((m) => m.PdfUserComponent),
  },
  {
    path: 'pdf/water-safe',
    loadComponent: () =>
      import('../PDF/pdf-water-safe.component').then((m) => m.PdfWaterSafeComponent),
  },
  {
    path: 'pdf/vertical-safe',
    loadComponent: () =>
      import('../PDF/pdf-abseil-safe.component').then((m) => m.PdfAbseilSafeComponent),
  },
  {
    path: ':action/:id',
    loadComponent: () =>
      import('../base/scoreCard.component').then((m) => m.ScoreCardComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('../base/groups.component').then((m) => m.GroupsComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../base/scoreCard.component').then((m) => m.ScoreCardComponent),
  },
];
