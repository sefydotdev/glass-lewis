import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { AuthStateService } from '../services/auth/auth-state.service';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let authStateService: jasmine.SpyObj<AuthStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['authenticate']);
    const authStateServiceSpy = jasmine.createSpyObj('AuthStateService', ['setName']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthStateService, useValue: authStateServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authStateService = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should focus the first input field after view initialization', () => {
    spyOn(component, 'focusFirstInput').and.callThrough();
    component.ngAfterViewInit();
    expect(component.focusFirstInput).toHaveBeenCalled();
  });

  it('should move focus back on Backspace key press', () => {
    component.focusedIndex = 1;
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });

    spyOn(component, 'moveFocusBack').and.callThrough();
    component.handleKeyDown(event);

    expect(component.moveFocusBack).toHaveBeenCalled();
    expect(component.focusedIndex).toBe(0);
  });

  it('should handle input and move focus to the next field', () => {
    const inputEvent = { target: { value: '1' } };
    component.handleInput(inputEvent, 0);
    expect(component.focusedIndex).toBe(1);
  });

  it('should authenticate the user on entering the last input', () => {
    const passcode = '123456';
    spyOn(component, 'sendAuthRequest').and.callThrough();
    authService.authenticate.and.returnValue(of({ name: 'John Doe' }));

    component.handleInput({ target: { value: '1' } }, 5);

    expect(component.sendAuthRequest).toHaveBeenCalledWith(passcode);
  });

  it('should handle successful authentication', () => {
    const authResponse = { name: 'John Doe' };
    authService.authenticate.and.returnValue(of(authResponse));
    component.sendAuthRequest('123456');

    expect(authStateService.setName).toHaveBeenCalledWith(authResponse.name);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle failed authentication', () => {
    authService.authenticate.and.returnValue(throwError(() => new Error('Invalid passcode')));
    component.sendAuthRequest('123456');

    expect(component.wrongPasscode).toBeTrue();
  });

  it('should focus the previous input field on backspace if current input is empty', () => {
    component.focusedIndex = 1;
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    inputElements[1].nativeElement.value = '';
    component.moveFocusBack();

    expect(component.focusedIndex).toBe(0);
    expect(inputElements[0].nativeElement === document.activeElement).toBeTrue();
  });
});
