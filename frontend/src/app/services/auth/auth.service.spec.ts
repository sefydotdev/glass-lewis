import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { user } from '../../models/users.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let cookieServiceMock: jasmine.SpyObj<CookieService>;
  let routerMock: jasmine.SpyObj<Router>;

  const authToken = 'dummyAuthToken';
  const dummyUser: user = { name: 'admin' };

  beforeEach(() => {
    cookieServiceMock = jasmine.createSpyObj('CookieService', ['get', 'delete']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: CookieService, useValue: cookieServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authenticate', () => {
    it('should authenticate and return user data', () => {
      cookieServiceMock.get.and.returnValue(authToken);

      service.authenticate('validKey').subscribe(user => {
        expect(user).toEqual(dummyUser);
      });

      const req = httpMock.expectOne(service['authEndpoint']);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ key: 'validKey' });
      expect(req.request.withCredentials).toBeTrue();
      req.flush(dummyUser);
    });

    it('should handle authentication error', () => {
      cookieServiceMock.get.and.returnValue(authToken);

      service.authenticate('invalidKey').subscribe(user => {
        expect(user).toBeUndefined();
      });

      const req = httpMock.expectOne(service['authEndpoint']);
      expect(req.request.method).toBe('POST');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token is valid', () => {
      cookieServiceMock.get.and.returnValue(authToken);

      service.isAuthenticated().subscribe(isAuthenticated => {
        expect(isAuthenticated).toBeTrue();
      });

      const req = httpMock.expectOne(service['autoLoginEndpoint']);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authToken}`);
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ message: 'Token is valid' });
    });

    it('should return false if token is invalid', () => {
      cookieServiceMock.get.and.returnValue(authToken);

      service.isAuthenticated().subscribe(isAuthenticated => {
        expect(isAuthenticated).toBeFalse();
      });

      const req = httpMock.expectOne(service['autoLoginEndpoint']);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Token is invalid' });
    });

    it('should return false if token is not present', () => {
      cookieServiceMock.get.and.returnValue('');

      service.isAuthenticated().subscribe(isAuthenticated => {
        expect(isAuthenticated).toBeFalse();
      });

      const req = httpMock.expectOne(service['autoLoginEndpoint']);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle errors and return false', () => {
      cookieServiceMock.get.and.returnValue(authToken);

      service.isAuthenticated().subscribe(isAuthenticated => {
        expect(isAuthenticated).toBeFalse();
      });

      const req = httpMock.expectOne(service['autoLoginEndpoint']);
      expect(req.request.method).toBe('GET');
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('logout', () => {
    it('should delete token and navigate to login', () => {
      service.logout();

      expect(cookieServiceMock.delete).toHaveBeenCalledWith('authToken');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
