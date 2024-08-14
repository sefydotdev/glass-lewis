import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { catchError, tap, throwError } from 'rxjs';
import { CompanyRecordsService } from '../../services/company-records/company-records.service';
import { Record } from '../../models/company-records.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  companyRecordForm: FormGroup;
  formTitle: string = 'Add new company record.';

  constructor(
    private fb: FormBuilder,
    private recordService: CompanyRecordsService
  ) {
    this.companyRecordForm = this.createForm();
  }

  ngOnInit(): void {}

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      exchange: ['', [Validators.required, Validators.maxLength(50)]],
      ticker: ['', [Validators.required, Validators.maxLength(10)]],
      ISIN: ['', [Validators.required, Validators.maxLength(12), this.isinValidator()]],
      website: ['', this.websiteValidator()]
    });
  }

  get name() { return this.companyRecordForm.get('name'); }
  get exchange() { return this.companyRecordForm.get('exchange'); }
  get ticker() { return this.companyRecordForm.get('ticker'); }
  get ISIN() { return this.companyRecordForm.get('ISIN'); }
  get website() { return this.companyRecordForm.get('website'); }

  onSubmit(): void {
    if (this.companyRecordForm.valid) {
      const formData: Record = this.companyRecordForm.value;

      this.recordService.create(formData).pipe(
        tap(() => this.handleSuccess()),
        catchError((error) => this.handleError(error))
      ).subscribe();
    }
  }

  handleSuccess(): void {
    this.formTitle = 'Company Record Saved';
    this.companyRecordForm.reset();
  }

  handleError(error: any): any {
    if (error.status === 409) {
      this.ISIN?.setErrors({ isinNotUnique: true });
    }
    return throwError(() => error);
  }

  isinValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value as string;
      const pattern = /^[A-Z]{2}[A-Z0-9]{10}$/;
      return pattern.test(value) ? null : { isinInvalid: true };
    };
  }

  websiteValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value as string;

      if (!value) {
        return null;
      }

      const pattern = /^https:\/\/.+\..+/;
      return pattern.test(value) ? null : { websiteInvalid: true };
    };
  }

  getErrorMessage(control: AbstractControl | null, fieldName: string): string {
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return `${fieldName} is required.`;
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `${fieldName} Exceeded ${maxLength} characters.`;
    }

    if (control.hasError('isinInvalid')) {
      return 'ISIN must start with 2 capitalised letters.';
    }

    if (control.hasError('isinNotUnique')) {
      return 'This ISIN already exists.';
    }

    if (control.hasError('websiteInvalid')) {
      return 'Website must be in this format: https://example.com';
    }

    return 'Invalid input';
  }
}
