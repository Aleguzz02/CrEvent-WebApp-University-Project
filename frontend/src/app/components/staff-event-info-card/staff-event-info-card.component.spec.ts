import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { StaffEventInfo } from '../../interfaces/event.interface';
import { EventService } from '../../services/event.service';
import { StaffEventInfoCardComponent } from './staff-event-info-card.component';

describe('StaffEventInfoCardComponent', () => {
  let component: StaffEventInfoCardComponent;
  let fixture: ComponentFixture<StaffEventInfoCardComponent>;
  let eventService: jasmine.SpyObj<EventService>;
  let responseData: StaffEventInfo[];

  const createEvent = (overrides: Partial<StaffEventInfo> = {}): StaffEventInfo => ({
    id: 1,
    nome: 'Evento di prova',
    data: '2026-09-12',
    invitati: 80,
    emailUtente: 'cliente@example.com',
    svolto: 0,
    nomeCliente: 'Mario',
    cognomeCliente: 'Rossi',
    telefonoCliente: '3331234567',
    emailCliente: 'cliente@example.com',
    urlFotoProfiloCliente: null,
    ...overrides
  });

  beforeEach(waitForAsync(() => {
    responseData = [];
    eventService = jasmine.createSpyObj<EventService>('EventService', ['getStaffEvents']);
    eventService.getStaffEvents.and.callFake(() => of({ success: true, data: responseData }));

    TestBed.configureTestingModule({
      imports: [StaffEventInfoCardComponent],
      providers: [{ provide: EventService, useValue: eventService }]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffEventInfoCardComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('does not render empty client contacts', () => {
    responseData = [createEvent({ emailCliente: ' ', telefonoCliente: '' })];

    fixture.detectChanges();

    const clientCopy: HTMLElement = fixture.nativeElement.querySelector('.client-copy');
    expect(clientCopy.querySelectorAll('span').length).toBe(0);
  });

  it('keeps non-empty client contacts visible', () => {
    responseData = [createEvent()];

    fixture.detectChanges();

    const clientCopy: HTMLElement = fixture.nativeElement.querySelector('.client-copy');
    expect(clientCopy.textContent).toContain('cliente@example.com');
    expect(clientCopy.textContent).toContain('3331234567');
  });

  it('groups staff from the same event', () => {
    responseData = [
      createEvent({ idStaff: 10, nomeStaff: 'Anna', cognomeStaff: 'Verdi', tipoStaff: 'fotografo' }),
      createEvent({ idStaff: 11, nomeStaff: 'Luca', cognomeStaff: 'Blu', tipoStaff: 'intrattenimento' })
    ];

    fixture.detectChanges();

    expect(component.eventCards.length).toBe(1);
    expect(component.eventCards[0].staff.length).toBe(2);
  });

  it('omits location data made only of whitespace', () => {
    responseData = [createEvent({
      nomeLocation: ' ',
      cittaLocation: '',
      indirizzoLocation: '   '
    })];

    fixture.detectChanges();

    expect(component.eventCards[0].locationLabel).toBeNull();
    expect(component.eventCards[0].locationDetails).toBeNull();
  });
});
