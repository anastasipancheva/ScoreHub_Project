import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Курсы' },
      },
      {
        path: 'scores',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Баллы' },
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Уведомления' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Профиль' },
      },
      {
        path: 'homework',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Домашняя работа' },
      },
      {
        path: 'lecture/:id',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Лекция' },
      },
      {
        path: 'kt/:id',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Контрольная' },
      },
      {
        path: 'assistant',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Ассистент' },
      },
      {
        path: 'assistant/session/:id',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Сессия' },
      },
      {
        path: 'assistant/kt/:id',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'КТ' },
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/page-stub/page-stub.component').then(m => m.PageStubComponent),
        data: { title: 'Управление' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
