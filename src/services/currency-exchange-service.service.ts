import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeServiceService {

  constructor(private httpClient: HttpClient) { }

  accessKey = environment.apiKey;
  baseUrl = environment.baseUrl

  private cacheKey = 'latestExchangeRates';

  private cacheExpiry = 60 * 60 * 1000; // Cache expiry time in milliseconds (1 hour)
  private symbolsKey = 'exchangeSymbols';


  private getFromLocalStorage(): any {
    const cachedData = localStorage.getItem(this.cacheKey);

    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);

      // Check if the data is still valid based on the expiry time
      if (Date.now() - timestamp < this.cacheExpiry) {
        return data;
      }
    }

    // If the data is not present or expired, return null
    return null;
  }

  private saveToLocalStorage(data: any): void {
    const cacheObject = {
      timestamp: Date.now(),
      data: data,
    };

    localStorage.setItem(this.cacheKey, JSON.stringify(cacheObject));
  }


  getLatestExchangeRates(): Observable<any> {
    // Check if cached data is available in localStorage
    const cachedData = this.getFromLocalStorage();

    if (cachedData) {
      // If cached data is available, return it as an observable
      return of(cachedData);
    } else {
      // If no cached data or data is expired, fetch from the API
      const apiUrl = `${this.baseUrl}/latest?access_key=${this.accessKey}`;

      return this.httpClient.get(apiUrl).pipe(
        catchError((error) => {
          console.error('Error fetching exchange rates:', error);
          return of(null);
        }),
        tap((data) => {
          // Save the fetched data to localStorage
          this.saveToLocalStorage(data);
        })
      );
    }
  }

  getSymbols(): Observable<any> {
    const cachedSymbols = localStorage.getItem(this.symbolsKey);

    if (cachedSymbols) {
      // Symbols are available in local storage, return them as an observable
      return of(JSON.parse(cachedSymbols));
    } else {
      // Symbols not available in local storage, fetch from the API
      const symbolsUrl = `${this.baseUrl}/symbols?access_key=${this.accessKey}`;
      
      return this.httpClient.get(symbolsUrl).pipe(
        catchError((error) => {
          console.error('Error fetching symbols:', error);
          return of(null);
        }),
        tap((symbols) => {
          // Save the fetched symbols to local storage
          if (symbols) {
            localStorage.setItem(this.symbolsKey, JSON.stringify(symbols));
          }
        })
      );
    }
  }
}
