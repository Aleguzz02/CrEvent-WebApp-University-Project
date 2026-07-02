import { AfterViewInit, Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  ModalController
} from '@ionic/angular/standalone';
import { icon, Marker, CircleMarker } from 'leaflet';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-custom-location-map-modal',
  templateUrl: './custom-location-map-modal.component.html',
  styleUrls: ['./custom-location-map-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton
  ]
})
export class CustomLocationMapModalComponent implements AfterViewInit {

  map: any;
  marker: any;
  lat: number | null = null;
  lng: number | null = null;

  constructor(private modalCtrl: ModalController) { }

  markerIcon = icon({
    iconUrl: 'assets/icon/pinMap.png',
    iconSize: [32, 32],
  });

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.userCurrentPosition();
    }, 20);
  }


  initMap() {
    this.map = L.map('customLocationMap').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      this.lat = event.latlng.lat;
      this.lng = event.latlng.lng;

      if (this.marker) {
        this.marker.setLatLng(event.latlng);
      }
      else {
        this.marker = L.marker(event.latlng, {
          icon: this.markerIcon,
          draggable: true
        }).addTo(this.map);
      }
    });

    this.map.invalidateSize();
  }
  
  private async userCurrentPosition() {
    try {
      // Usa l'API del browser se su web
      if (this.isRunningInBrowser()) {
        const position = await this.getBrowserPosition();
        this.updateMapPosition(position.coords.latitude, position.coords.longitude);
      } else {
        // Usa Capacitor per accedere al GPS nativo su mobile
        const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        this.updateMapPosition(coordinates.coords.latitude, coordinates.coords.longitude);
      }
    } catch (error) {
      console.error('Errore GPS:', error);
      // Fallback a una posizione predefinita
      this.updateMapPosition(38.1156, 13.3614, true);
    }
  }

  private isRunningInBrowser(): boolean {
    return !(window as any).Capacitor?.isNative;
  }

  private getBrowserPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation non supportata dal browser');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      }
    });
  }

  private updateMapPosition(lat: number, lng: number, isFallback = false) {
    const userLatLng: L.LatLngExpression = [lat, lng];
  
    if (this.marker) {
      this.map!.removeLayer(this.marker);
    }
  
    this.marker = new L.Marker(userLatLng, {
      icon: this.markerIcon,
      draggable: false
    })
      .addTo(this.map!)
      .bindPopup(isFallback ? 'Posizione di default' : 'Sei qui!')
      .openPopup();
  
    this.map!.setView(userLatLng, 15);
  }

  private addMarkerAtLocation(latlng: L.LatLng) {
    if (this.marker) {
      this.map!.removeLayer(this.marker);
    }  
    this.marker = L.marker([latlng.lat, latlng.lng], {
      icon: this.markerIcon,
      draggable: true
    })
      .addTo(this.map!)
      .bindPopup('Luogo scelto')
      .openPopup();
  }

  conferma() {
    if (this.lat === null || this.lng === null) {
      return;
    }

    this.modalCtrl.dismiss({
      lat: this.lat,
      lng: this.lng
    });
  }

  annulla() {
    this.modalCtrl.dismiss();
  }

}