import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CompanyRecordsService } from '../../services/company-records/company-records.service';
import { SearchComponent } from './search.component';
import { Record } from '../../models/company-records.model';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let recordService: jasmine.SpyObj<CompanyRecordsService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    const recordServiceSpy = jasmine.createSpyObj('CompanyRecordsService', [
      'fetch',
      'search',
      'update'
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SearchComponent],
      providers: [
        FormBuilder,
        { provide: CompanyRecordsService, useValue: recordServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    recordService = TestBed.inject(CompanyRecordsService) as jasmine.SpyObj<CompanyRecordsService>;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getAllRecords on initialization', () => {
      spyOn(component, 'getAllRecords').and.callThrough();
      component.ngOnInit();
      expect(component.getAllRecords).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should call getSearchedRecords when searchQuery changes', () => {
      spyOn(component, 'getSearchedRecords').and.callThrough();
      component.searchQuery = 'test';
      component.ngOnChanges({
        searchQuery: {
          currentValue: 'test',
          firstChange: true,
          previousValue: '',
          isFirstChange: () => true
        }
      });
      expect(component.getSearchedRecords).toHaveBeenCalled();
    });
  });

  describe('getAllRecords', () => {
    it('should set searchResults with fetched records', () => {
      const mockRecords: Record[] = [
        { id: 1, name: 'Test', exchange: 'NYSE', ticker: 'TST', isin: 'US1234567890', website: 'https://test.com' }
      ];
      recordService.fetch.and.returnValue(of(mockRecords));

      component.getAllRecords();
      fixture.detectChanges();

      expect(component.searchResults.length).toBe(1);
      expect(component.searchResults[0].form.value.name).toBe('Test');
    });

    it('should handle errors gracefully', () => {
      recordService.fetch.and.returnValue(throwError(() => new Error('Fetch error')));

      component.getAllRecords();
      fixture.detectChanges();

      // Verify the appropriate handling, e.g., setting an empty result or displaying an error message
      expect(component.searchResults.length).toBe(0);
    });
  });

  describe('getSearchedRecords', () => {
    it('should call fetch when searchQuery is "all"', () => {
      spyOn(component, 'getAllRecords').and.callThrough();
      component.searchQuery = 'all';
      component.getSearchedRecords();
      expect(component.getAllRecords).toHaveBeenCalled();
    });

    it('should call search when searchQuery is not "all"', () => {
      const mockRecords: Record[] = [
        { id: 1, name: 'Test', exchange: 'NYSE', ticker: 'TST', isin: 'US1234567890', website: 'https://test.com' }
      ];
      recordService.search.and.returnValue(of(mockRecords));

      component.searchQuery = 'test';
      component.getSearchedRecords();
      fixture.detectChanges();

      expect(recordService.search).toHaveBeenCalledWith('test');
      expect(component.searchResults.length).toBe(1);
    });
  });

  describe('editRow', () => {
    it('should set isEditing to true for the given row', () => {
      const mockRecord: Record = { id: 1, name: 'Test', exchange: 'NYSE', ticker: 'TST', isin: 'US1234567890', website: 'https://test.com' };
      component.searchResults = [{ ...mockRecord, form: formBuilder.group({}), isEditing: false }];
      component.editRow(component.searchResults[0]);

      expect(component.searchResults[0].isEditing).toBeTrue();
    });
  });

  describe('cancelEdit', () => {
    it('should set isEditing to false and reset form for the given row', () => {
      const mockRecord: Record = { id: 1, name: 'Test', exchange: 'NYSE', ticker: 'TST', isin: 'US1234567890', website: 'https://test.com' };
      const form = formBuilder.group({
        name: 'Test',
        exchange: 'NYSE',
        ticker: 'TST',
        ISIN: 'US1234567890',
        website: 'https://test.com'
      });
      component.searchResults = [{ ...mockRecord, form, isEditing: true }];
      component.cancelEdit(component.searchResults[0]);

      expect(component.searchResults[0].isEditing).toBeFalse();
      expect(component.searchResults[0].form.value.name).toBe('Test');
    });
  });

  describe('saveRow', () => {
    let mockRecord: Record;
    let updatedRecord: Record;
    let form: FormGroup;

    beforeEach(() => {
      mockRecord = {
        id: 1,
        name: 'Test',
        exchange: 'NYSE',
        ticker: 'TST',
        isin: 'US1234567890',
        website: 'https://test.com'
      };

      updatedRecord = {
        ...mockRecord,
        name: 'Updated Test'
      };

      form = formBuilder.group({
        name: 'Updated Test',
        exchange: 'NYSE',
        ticker: 'TST',
        ISIN: 'US1234567890',
        website: 'https://test.com'
      });

      component.searchResults = [{ ...mockRecord, form, isEditing: true }];

      spyOn(component, 'handleSuccessfulUpdate').and.callThrough();
      spyOn(component, 'handleError').and.callThrough();
      spyOn(recordService, 'update').and.returnValue(of(updatedRecord));
    });

    it('should call updateRecord and handle successful update', () => {
      component.saveRow(component.searchResults[0]);

      expect(recordService.update).toHaveBeenCalledWith({ ...form.value, id: mockRecord.id });
      expect(component.handleSuccessfulUpdate).toHaveBeenCalledWith(component.searchResults[0], updatedRecord);
    });

    it('should handle error correctly', () => {
      const errorResponse = { status: 409 };
      spyOn(recordService, 'update').and.returnValue(throwError(() => errorResponse));

      component.saveRow(component.searchResults[0]);

      expect(component.handleError).toHaveBeenCalledWith(errorResponse);
    });
  });

  describe('isinValidator', () => {
    it('should validate ISIN format correctly', () => {
      const validator = component.isinValidator();
      const validControl = new FormControl('US1234567890');
      const invalidControl = new FormControl('1234567890');

      expect(validator(validControl)).toBeNull();
      expect(validator(invalidControl)).toEqual({ isinInvalid: true });
    });
  });

  describe('websiteValidator', () => {
    it('should validate website URL format correctly', () => {
      const validator = component.websiteValidator();
      const validControl = new FormControl('https://example.com');
      const invalidControl = new FormControl('example.com');

      expect(validator(validControl)).toBeNull();
      expect(validator(invalidControl)).toEqual({ websiteInvalid: true });
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages for various validation errors', () => {
      const control = formBuilder.control('', Validators.required);
      expect(component.getErrorMessage(control, 'Name')).toBe('Name is required.');

      control.setValue('a');
      control.setValidators([Validators.maxLength(2)]);
      control.updateValueAndValidity();
      expect(component.getErrorMessage(control, 'Name')).toBe('Name Exceeded 2 characters.');
    });
  });
});
