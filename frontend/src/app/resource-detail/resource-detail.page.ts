import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.page.html',
  styleUrls: ['./resource-detail.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class ResourceDetailPage implements OnInit{
  @Input() resource: any;
  @Input() testoPrezzo: string = '';

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  ngOnInit() {
  console.log('RESOURCE DETTAGLIO:', this.resource);
}

}
