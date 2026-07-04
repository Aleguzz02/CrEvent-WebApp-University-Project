import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  async show(
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      cssClass: `app-toast app-toast-${type}`
    });

    await toast.present();
  }

  success(message: string) {
    return this.show(message, 'success');
  }

  error(message: string) {
    return this.show(message, 'error');
  }

  warning(message: string) {
    return this.show(message, 'warning');
  }

  info(message: string) {
    return this.show(message, 'info');
  }
}