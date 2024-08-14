import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { catchError, single, tap } from 'rxjs/operators';
import { of } from "rxjs";
import { AuthStateService } from "../services/auth/auth-state.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  focusedIndex: number = 0;
  wrongPasscode: boolean = false;
  digits: number[] = Array(6).fill(0);

  constructor(
    private auth: AuthService,
    private authState: AuthStateService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusFirstInput();
  }

  focusFirstInput() {
    if (this.inputFields && this.inputFields.length > 0) {
      this.inputFields.first.nativeElement.focus();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.moveFocusBack();
    }
  }

  moveFocusBack() {
    const currentInput = this.inputFields.toArray()[this.focusedIndex].nativeElement;

    if (currentInput.value.trim() === '' && this.focusedIndex > 0) {
      this.focusedIndex--;
      this.inputFields.toArray()[this.focusedIndex].nativeElement.focus();
    }
  }

  handleInput(event: any, index: number) {
    const inputValue = event.target.value;
    if (inputValue.length === 1) {
      if (index < this.inputFields.length - 1) {
        this.inputFields.toArray()[index + 1].nativeElement.focus();
        this.focusedIndex = index + 1;
      }
    }

    if(index < 5){
      this.wrongPasscode = false;
    }

    if(index === 5){
      let passcode = this.inputFields.toArray().map(el => el.nativeElement.value).join('');

      this.sendAuthRequest(passcode);
    }
  }

  sendAuthRequest(passcode: string): void {
    this.auth.authenticate(passcode)
      .pipe(
        single(),
        tap(response => this.handleAuthSuccess(response.name)),
        catchError(() => {
          this.wrongPasscode = true;
          return of();
        })
      )
      .subscribe();
  }

  handleAuthSuccess(name: string): void {
    this.authState.setName(name);
    this.router.navigate(['/dashboard']);
  }
}
