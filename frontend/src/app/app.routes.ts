import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guards';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pag1/pag1.page').then( m => m.Pag1Page)
    // loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'pag1',
    loadComponent: () => import('./pag1/pag1.page').then( m => m.Pag1Page),
  },
    {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
];
