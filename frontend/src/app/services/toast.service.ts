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
      color: this.getColor(type)
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

  private getColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'medium';
    }
  }
}