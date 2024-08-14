import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad, CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canLoad(): Observable<boolean> {
    return this.checkAuthentication();
  }

  canActivate(): Observable<boolean> {
    return this.checkAuthentication();
  }

  checkAuthentication(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      tap(isAuthenticated => {

        if (!isAuthenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
