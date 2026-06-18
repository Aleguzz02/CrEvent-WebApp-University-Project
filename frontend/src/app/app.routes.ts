import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'resource-detail',
    loadComponent: () => import('./resource-detail/resource-detail.page').then( m => m.ResourceDetailPage)
  },
  {
    path: 'create-event',
    loadComponent: () => import('./create-event/create-event.page').then( m => m.CreateEventPage)
  },

];
