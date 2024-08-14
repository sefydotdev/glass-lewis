import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth/auth.service';
import { AuthStateService } from '../services/auth/auth-state.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let authStateService: jasmine.SpyObj<AuthStateService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const authStateServiceSpy = jasmine.createSpyObj('AuthStateService', ['getName', 'clearName']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthStateService, useValue: authStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authStateService = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getGreetings', () => {
    it('should return "Morning, [userName]" if the current hour is less than 12', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(9);
      authStateService.getName.and.returnValue('John Doe');

      expect(component.getGreetings()).toBe('Morning, John Doe');
    });

    it('should return "Afternoon, [userName]" if the current hour is between 12 and 18', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(14);
      authStateService.getName.and.returnValue('John Doe');

      expect(component.getGreetings()).toBe('Afternoon, John Doe');
    });

    it('should return "Evening, [userName]" if the current hour is 18 or later', () => {
      spyOn(Date.prototype, 'getHours').and.returnValue(19);
      authStateService.getName.and.returnValue('John Doe');

      expect(component.getGreetings()).toBe('Evening, John Doe');
    });
  });

  describe('toggleView', () => {
    it('should set currentView to the provided view', () => {
      component.toggleView('settings');
      expect(component.currentView).toBe('settings');
    });
  });

  describe('logout', () => {
    it('should call logout on AuthService and clearName on AuthStateService', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(authStateService.clearName).toHaveBeenCalled();
    });
  });

  describe('emitValueToSearch', () => {
    it('should set searchValue to the provided value', () => {
      component.emitValueToSearch('test value');
      expect(component.searchValue).toBe('test value');
    });
  });
});
