import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('../login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'groups',
    loadComponent: () => import('../base/groups.component').then(m => m.GroupsComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('../edit/editGroup.component').then(m => m.EditGroupComponent),
  },
  {
    path: 'user/new',
    loadComponent: () => import('../user/user-new/user-new.component').then(m => m.UserNewComponent),
  },
  {
    path: 'user',
    loadComponent: () => import('../user/user-settings/user-settings.component').then(m => m.UserSettingsComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('../user/user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () => import('../user/user-detail/user-detail.component').then(m => m.UserDetailComponent),
  },
  {
    path: 'pdf/:level/:id',
    loadComponent: () => import('../PDF/pdf-workbook.component').then(m => m.PdfWorkbookComponent),
  },
 {
    path: 'pdf/:id',
    loadComponent: () => import('../PDF/pdf-workbook.component').then(m => m.PdfWorkbookComponent),
  },
  {
    path: 'help',
    loadComponent: () => import('../base/help-page/help-page.component').then(m => m.HelpPageComponent),
  },
  {
    path: ':action/:id',
    loadComponent: () => import('../base/scoreCard.component').then(m => m.ScoreCardComponent),
  },
  {
    path: '',
    loadComponent: () => import('../base/groups.component').then(m => m.GroupsComponent),
  },
];
