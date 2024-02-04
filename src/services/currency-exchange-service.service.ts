import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { Observable, catchError, from, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeServiceService {

  constructor(private httpClient: HttpClient) { }

  accessKey = environment.apiKey;
  baseUrl = environment.baseUrl
  baseCurrency = 'EUR'

  private cacheKey = 'latestExchangeRates';

  private cacheExpiry = 60 * 60 * 1000; // Cache expiry time in milliseconds (1 hour) to work around paid API limitations
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
      return of(cachedData);
    } else {
      // If no cached data or data is expired, fetch from the API
      const apiUrl = `${this.baseUrl}/latest?access_key=${this.accessKey}`;

      return this.httpClient.get(apiUrl).pipe(
        catchError((error) => {
          console.error('Error fetching exchange rates:', error);
          return of(null);
        }),
        tap((data: any) => {
          // Save the fetched data to localStorage only when success is true
          if (data && data.success) {
            this.saveToLocalStorage(data);
          }
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
        tap((symbols: any) => {
          // Save the fetched symbols to local storage
          if (symbols && symbols.success) {
            localStorage.setItem(this.symbolsKey, JSON.stringify(symbols));
          }
        })
      );
    }
  }

  fetchHistoricalRates(toCurrency: string, fromCurrency: string, date: string): Observable<any> {
    const apiUrl = `${this.baseUrl}/${date}?access_key=${this.accessKey}&base=${this.baseCurrency}&symbols=${fromCurrency},${toCurrency}`;
    return this.httpClient.get(apiUrl);
  }
}
