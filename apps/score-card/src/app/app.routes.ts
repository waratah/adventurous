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
    path: 'user/settings',
    loadComponent: () =>
      import('../user/user-settings/user-settings.component').then((m) => m.UserSettingsComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('../user/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
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
