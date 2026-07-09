import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonText
  ]
})
export class CheckoutModalComponent {
  @Input() amount = 0;

  private readonly cardPatterns: { brand: string; pattern: RegExp }[] = [
    { brand: 'Visa', pattern: /^4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?$/ },
    { brand: 'Mastercard', pattern: /^(?:5[1-5][0-9]{14}|2(?:2[2-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)[0-9]{12})$/ },
    { brand: 'American Express', pattern: /^3[47][0-9]{13}$/ },
    { brand: 'Discover', pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/ },
    { brand: 'Maestro', pattern: /^(?:5018|5020|5038|5893|6304|6759|676[1-3])[0-9]{8,15}$/ }
  ];

  form = this.fb.group({
    cardNumber: ['', [Validators.required, this.cardNumberValidator.bind(this)]],
    expiry: ['', [Validators.required, this.expiryValidator]],
    cvv: ['', [Validators.required, this.cvvValidator.bind(this)]]
  });

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) {}

  get formattedAmount(): string {
    return this.amount.toFixed(2);
  }

  get cardBrand(): string {
    const cardNumber = this.clean(this.form.value.cardNumber);
    return this.getCardBrand(cardNumber);
  }

  formatCardNumber(event: any): void {
    const digits = this.clean(event.detail?.value).slice(0, 19);
    const formatted = digits.match(/.{1,4}/g)?.join(' ') ?? '';

    this.form.patchValue({ cardNumber: formatted }, { emitEvent: false });
    this.form.controls.cardNumber.updateValueAndValidity();
    this.form.controls.cvv.updateValueAndValidity();
  }

  formatExpiry(event: any): void {
    const digits = this.clean(event.detail?.value).slice(0, 4);
    const expiry = digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
      : digits;

    this.form.patchValue({ expiry }, { emitEvent: false });
    this.form.controls.expiry.updateValueAndValidity();
  }

  formatCvv(event: any): void {
    const cvv = this.clean(event.detail?.value).slice(0, 4);

    this.form.patchValue({ cvv }, { emitEvent: false });
    this.form.controls.cvv.updateValueAndValidity();
  }

  cancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  pay(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.modalController.dismiss({
      paid: true,
      amount: this.amount,
      cardBrand: this.cardBrand
    }, 'confirm');
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    const cardNumber = this.clean(control.value);
    const brand = this.getCardBrand(cardNumber);

    if (!brand) {
      return { cardBrand: true };
    }

    if (!this.validLuhn(cardNumber)) {
      return { luhn: true };
    }

    return null;
  }

  private expiryValidator(control: AbstractControl): ValidationErrors | null {
    const expiry = String(control.value ?? '');

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      return { expiryFormat: true };
    }

    const [month, year] = expiry.split('/').map(Number);
    const expiryDate = new Date(2000 + year, month, 0, 23, 59, 59);

    return expiryDate >= new Date() ? null : { expiryExpired: true };
  }

  private cvvValidator(control: AbstractControl): ValidationErrors | null {
    const cvv = this.clean(control.value);
    const cardNumber = this.clean(this.form?.value.cardNumber);
    const brand = this.getCardBrand(cardNumber);

    if (brand === 'American Express') {
      return /^[0-9]{4}$/.test(cvv) ? null : { cvv: true };
    }

    return /^[0-9]{3}$/.test(cvv) ? null : { cvv: true };
  }

  private getCardBrand(cardNumber: string): string {
    const card = this.cardPatterns.find(item => item.pattern.test(cardNumber));
    return card?.brand ?? '';
  }

  private clean(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '');
  }

  private validLuhn(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = Number(cardNumber[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum > 0 && sum % 10 === 0;
  }
}