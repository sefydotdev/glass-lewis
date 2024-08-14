import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthGuardService } from './auth-guard.service';

describe('AuthGuardService', () => {
  let authGuardService: AuthGuardService;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    });

    authGuardService = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(authGuardService).toBeTruthy();
  });

  describe('canLoad', () => {
    it('should return true if the user is authenticated', (done) => {
      authServiceMock.isAuthenticated.and.returnValue(of(true));

      authGuardService.canLoad().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });

      expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to login if the user is not authenticated', (done) => {
      authServiceMock.isAuthenticated.and.returnValue(of(false));

      authGuardService.canLoad().subscribe((result) => {
        expect(result).toBeFalse();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });

      expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('canActivate', () => {
    it('should return true if the user is authenticated', (done) => {
      authServiceMock.isAuthenticated.and.returnValue(of(true));

      authGuardService.canActivate().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });

      expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to login if the user is not authenticated', (done) => {
      authServiceMock.isAuthenticated.and.returnValue(of(false));

      authGuardService.canActivate().subscribe((result) => {
        expect(result).toBeFalse();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });

      expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
    });
  });
});
