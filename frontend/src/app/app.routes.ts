import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pag1/pag1.page').then( m => m.Pag1Page)
    // loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'pag1',
    loadComponent: () => import('./pag1/pag1.page').then( m => m.Pag1Page)
  },
    {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes)
  },
];
