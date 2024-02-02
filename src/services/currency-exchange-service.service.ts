import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeServiceService {

  constructor(private httpClient: HttpClient) { }

   accessKey = environment.apiKey;
   baseUrl = environment.baseUrl

  getLatestExchangeRates(){
    const url = `${this.baseUrl}/latest?access_key=${this.accessKey}`;
    return this.httpClient.get(url);
  }
}