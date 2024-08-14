import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompanyRecordsService } from './company-records.service';
import { CookieService } from 'ngx-cookie-service';
import { Record } from '../../models/company-records.model';

describe('CompanyRecordsService', () => {
  let service: CompanyRecordsService;
  let httpMock: HttpTestingController;
  let cookieServiceMock: jasmine.SpyObj<CookieService>;

  const dummyRecord: Record = {
    exchange: "NASDAQ",
    id: 0,
    isin: "US0378331005",
    name: "Apple Inc",
    ticker: "AAPL"
  }
  const dummyRecords: Record[] = [dummyRecord];
  const authToken = 'dummyAuthToken';

  beforeEach(() => {
    cookieServiceMock = jasmine.createSpyObj('CookieService', ['get']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CompanyRecordsService,
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    });

    service = TestBed.inject(CompanyRecordsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch records', () => {
    cookieServiceMock.get.and.returnValue(authToken);

    service.fetch().subscribe(records => {
      expect(records).toEqual(dummyRecords);
    });

    const req = httpMock.expectOne(service['fetchRecordsEndpoint']);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authToken}`);
    req.flush(dummyRecords);
  });

  it('should create a record', () => {
    cookieServiceMock.get.and.returnValue(authToken);

    service.create(dummyRecord).subscribe(record => {
      expect(record).toEqual(dummyRecord);
    });

    const req = httpMock.expectOne(service['createEndpoint']);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authToken}`);
    req.flush(dummyRecord);
  });

  it('should search records', () => {
    cookieServiceMock.get.and.returnValue(authToken);
    const query = 'searchTerm';

    service.search(query).subscribe(records => {
      expect(records).toEqual(dummyRecords);
    });

    const req = httpMock.expectOne(service['searchRecordsEndpoint']);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authToken}`);
    expect(req.request.body.query).toBe(query);
    req.flush(dummyRecords);
  });

  it('should update a record', () => {
    cookieServiceMock.get.and.returnValue(authToken);

    service.update(dummyRecord).subscribe(record => {
      expect(record).toEqual(dummyRecord);
    });

    const req = httpMock.expectOne(service['updateEndpoint']);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authToken}`);
    req.flush(dummyRecord);
  });

  it('should throw an error if no auth token is found', () => {
    cookieServiceMock.get.and.returnValue('');

    expect(() => service.getAuthToken()).toThrowError('No authentication token found');
  });
});
