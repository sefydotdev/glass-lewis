import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule, FormBuilder, FormControl, ValidatorFn} from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CreateComponent } from './create.component';
import { CompanyRecordsService } from '../../services/company-records/company-records.service';
import { Record } from '../../models/company-records.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;
  let mockRecordService: jasmine.SpyObj<CompanyRecordsService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockRecordService = jasmine.createSpyObj('CompanyRecordsService', ['create']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [CreateComponent],
      providers: [
        FormBuilder,
        { provide: CompanyRecordsService, useValue: mockRecordService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should create the form with required controls and validators', () => {
      const form = component.companyRecordForm;
      expect(form.contains('name')).toBeTrue();
      expect(form.contains('exchange')).toBeTrue();
      expect(form.contains('ticker')).toBeTrue();
      expect(form.contains('ISIN')).toBeTrue();
      expect(form.contains('website')).toBeTrue();

      const nameControl = form.get('name');
      const exchangeControl = form.get('exchange');
      const tickerControl = form.get('ticker');
      const ISINControl = form.get('ISIN');
      const websiteControl = form.get('website');

      expect(nameControl?.hasError('required')).toBeTrue();
      expect(exchangeControl?.hasError('maxlength')).toBeTrue();
      expect(tickerControl?.hasError('maxlength')).toBeTrue();
      expect(ISINControl?.hasError('isinInvalid')).toBeNull();
      expect(websiteControl?.hasError('websiteInvalid')).toBeNull();
    });
  });

  describe('Form Submission', () => {
    it('should call recordService.create and handle success', () => {
      const mockRecord: Record = {
        id: 1,
        name: 'Test Company',
        exchange: 'NYSE',
        ticker: 'TST',
        isin: 'US1234567890',
        website: 'https://test.com'
      };
      mockRecordService.create.and.returnValue(of(mockRecord));

      component.companyRecordForm.setValue(mockRecord);
      component.onSubmit();
      fixture.detectChanges();

      expect(mockRecordService.create).toHaveBeenCalledWith(mockRecord);
      expect(component.formTitle).toBe('Company Record Saved');
      expect(component.companyRecordForm.value).toEqual({
        name: '',
        exchange: '',
        ticker: '',
        ISIN: '',
        website: ''
      });
    });

    it('should handle error when recordService.create fails', () => {
      const mockRecord: Record = {
        id: 1,
        name: 'Test Company',
        exchange: 'NYSE',
        ticker: 'TST',
        isin: 'US1234567890',
        website: 'https://test.com'
      };
      mockRecordService.create.and.returnValue(throwError(() => ({ status: 409 })));

      component.companyRecordForm.setValue(mockRecord);
      component.onSubmit();
      fixture.detectChanges();

      expect(mockRecordService.create).toHaveBeenCalledWith(mockRecord);
      expect(component.ISIN?.errors).toEqual({ isinNotUnique: true });
    });
  });

  describe('Validators', () => {
    let isinValidator: ValidatorFn;
    let websiteValidator: ValidatorFn;

    beforeEach(() => {
      isinValidator = component.isinValidator();
      websiteValidator = component.websiteValidator();
    });

    it('should validate ISIN format correctly', () => {
      const validControl = new FormControl('US1234567890');
      const invalidControl1 = new FormControl('1234567890');
      const invalidControl2 = new FormControl('US123456789');
      const invalidControl3 = new FormControl('US12345678901');

      expect(isinValidator(validControl)).toBeNull();
      expect(isinValidator(invalidControl1)).toEqual({ isinInvalid: true });
      expect(isinValidator(invalidControl2)).toEqual({ isinInvalid: true });
      expect(isinValidator(invalidControl3)).toEqual({ isinInvalid: true });
    });

    it('should validate website URL format correctly', () => {
      const validControl = new FormControl('https://example.com');
      const invalidControl1 = new FormControl('http://example.com');
      const invalidControl2 = new FormControl('example.com');

      expect(websiteValidator(validControl)).toBeNull();
      expect(websiteValidator(invalidControl1)).toEqual({ websiteInvalid: true });
      expect(websiteValidator(invalidControl2)).toEqual({ websiteInvalid: true });
    });
  });

  describe('Error Messages', () => {
    it('should return correct error messages based on control errors', () => {
      const nameControl = component.name;
      nameControl?.setErrors({ required: true });
      expect(component.getErrorMessage(nameControl, 'Name')).toBe('Name is required.');

      const ISINControl = component.ISIN;
      ISINControl?.setErrors({ isinInvalid: true });
      expect(component.getErrorMessage(ISINControl, 'ISIN')).toBe('ISIN must start with 2 capitalised letters.');

      const websiteControl = component.website;
      websiteControl?.setErrors({ websiteInvalid: true });
      expect(component.getErrorMessage(websiteControl, 'Website')).toBe('Website must be in this format: https://example.com');
    });
  });
});
