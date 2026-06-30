import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Se user autenticato, navigazione procede
    if (authService.isAuthenticated) {
        return true;
    }

    // Se user non autenticato, redirect a tabs -> tab2 (Homepage)
    const urlTree = router.parseUrl('/tabs');
    return new RedirectCommand(urlTree, { replaceUrl: true });
};