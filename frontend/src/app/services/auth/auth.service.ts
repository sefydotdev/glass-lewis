import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from "@angular/router";
import { user } from "../../models/users.model";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authEndpoint = 'http://localhost:3000/authenticate/auth';
  private autoLoginEndpoint = 'http://localhost:3000/authenticate/autoLogin';
  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  authenticate(key: string): Observable<user> {
    return this.http.post<user>(this.authEndpoint, { key }, { withCredentials: true });
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.cookieService.get(this.TOKEN_KEY);

    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ message: string }>(this.autoLoginEndpoint, {
      headers,
      withCredentials: true
    })
      .pipe(
        map(response => response.message === 'Token is valid'),
        catchError(() => of(false))
      );
  }

  logout(): void {
    this.cookieService.delete(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
