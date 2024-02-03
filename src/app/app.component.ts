import { Component, OnInit } from '@angular/core';
import { CurrencyExchangeServiceService } from 'src/services/currency-exchange-service.service';
import { CurrencyExchangeRates } from 'src/types/currencyExchangeTypes';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(private exchangeService: CurrencyExchangeServiceService) { }

  inputAmount: number = 0

  areElementsDisabled: boolean = true

  selectedFromCurrency = 'EUR';
  selectedToCurrency = 'USD';

  ngOnInit(): void {
    this.getLatestRates();
  }

  title = 'currency-coverter';

  cards = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  currencies: CurrencyExchangeRates = {}

  getLatestRates() {
    this.exchangeService.getLatestExchangeRates().subscribe(
      (res) => {
        if (res.success) {
          this.currencies = res.rates;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onInput(value: any) {
    console.log(value.target.value)
    let amount = value.target.value
    this.areElementsDisabled = !value.target.value;
  }

  getCurrencyCodes(): string[] {
    return Object.keys(this.currencies)
  }

  onToCurrencyChange(event: any) {
    this.selectedToCurrency = event.target.value;
  }

  onFromCurrencyChange(event: any) {
    this.selectedFromCurrency = event.target.value;
  }

}
