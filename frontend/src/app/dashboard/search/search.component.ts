import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Record } from "../../models/company-records.model";
import { CompanyRecordsService } from "../../services/company-records/company-records.service";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { of, throwError } from "rxjs";
import {catchError, tap} from "rxjs/operators";

interface editRecord extends Record {
  form: FormGroup;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges {
  @Input() searchQuery: string = '';

  searchResults: editRecord[] = [];
  showUpdateNotification: boolean = false;
  updateNotification!: string;

  constructor(
    private fb: FormBuilder,
    private recordService: CompanyRecordsService
  ) {}

  ngOnInit(): void {
    this.getAllRecords();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.getSearchedRecords();
    }
  }

  private createForm(record: Record): FormGroup {
    return this.fb.group({
      name: [record.name, Validators.required],
      exchange: [record.exchange, [Validators.required, Validators.maxLength(10)]],
      ticker: [record.ticker, [Validators.required, Validators.maxLength(10)]],
      ISIN: [record.isin, [Validators.required, Validators.maxLength(12), this.isinValidator()]],
      website: [record.website, this.websiteValidator()]
    });
  }

  setUpForms(results: Record[]): void {
    this.searchResults = results.map(result => ({
      ...result,
      form: this.createForm(result),
      isEditing: false
    }));
  }

  editRow(row: Record): void {
    row.isEditing = true;
  }

  cancelEdit(row: editRecord): void {
    row.isEditing = false;
    row.form.reset(row);
  }

  saveRow(row: editRecord): void {
    if (!row.form.valid) {
      return;
    }

    this.updateRecord({ ...row.form.value, id: row.id })
      .pipe(
        tap(updatedRecord => this.handleSuccessfulUpdate(row, updatedRecord)),
        catchError(error => this.handleError(error))
      )
      .subscribe();
  }

  updateRecord(formData: Record) {
    return this.recordService.update(formData);
  }

  handleSuccessfulUpdate(row: Record, updatedRecord: Record): void {
    Object.assign(row, updatedRecord);
    row.isEditing = false;
    this.displaySaveNotification('Record Updated.');
  }

  displaySaveNotification(notification: string): void {
    this.showUpdateNotification = true;
    this.updateNotification = notification;

    setTimeout(() => {
      this.showUpdateNotification = false;
    }, 2500);
  }


  getAllRecords(): void {
    this.recordService.fetch().pipe(
      tap(records => this.setUpForms(records)),
      catchError(() => {
        return of([]);
      })
    ).subscribe();
  }

  getSearchedRecords(): void {
    if (!this.searchQuery) {
      return;
    } else if (this.searchQuery.toLowerCase() === 'all') {
      return this.getAllRecords();
    }

    this.recordService.search(this.searchQuery).subscribe(res => this.setUpForms(res));
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

  handleError(error: any): any {
    console.log(error.status)
    if (error.status === 409) {
      this.displaySaveNotification('ISIN Already Exists.');
    }
    return throwError(() => error);
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
