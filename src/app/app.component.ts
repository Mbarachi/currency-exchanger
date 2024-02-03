import { Component, OnInit } from '@angular/core';
import { CurrencyExchangeServiceService } from 'src/services/currency-exchange-service.service';
import { CurrencyExchangeRates, CurrencySymbols } from 'src/types/currencyExchangeTypes';
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

  displayResult: string = 'XX.XX USD'

  // Nine most popular currency
  popularCurrencies: string[] = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK'];

  ngOnInit(): void {
    this.getLatestRates();
    this.getSymbols();
  }

  currencyTitle :string = 'Currency Exchanger'

  currencies: CurrencyExchangeRates = {}
  currencySymbols: CurrencySymbols = {}

  popularCurrenciesCovertedRates: any[] = []

  moreDetails: boolean = false

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

  onInput(event: any) {
    console.log(event.target.value)
    this.inputAmount = event.target.value
    this.areElementsDisabled = !event.target.value;
  }

  getCurrencyCodes(): string[] {
    return Object.keys(this.currencies)
  }

  getSymbols(){
    this.exchangeService.getSymbols().subscribe((res) => {
      if (res.success) {
        this.currencySymbols = res.symbols;
      }
    },
    (error) => {
      console.log(error);
    })
  }

  onToCurrencyChange(event: any) {
    this.selectedToCurrency = event.target.value;
  }

  onFromCurrencyChange(event: any) {
    this.selectedFromCurrency = event.target.value;
  }

  onSwap() {
    // Swap the selected currencies
    const temp = this.selectedFromCurrency;
    this.selectedFromCurrency = this.selectedToCurrency;
    this.selectedToCurrency = temp;
  }

  onConvert() {
    if (this.currencies[this.selectedFromCurrency] && this.currencies[this.selectedToCurrency]) {
      const fromRate = this.currencies[this.selectedFromCurrency];
      const toRate = this.currencies[this.selectedToCurrency];
      const convertedAmount = (this.inputAmount / fromRate) * toRate;
      this.displayResult = `${Number(convertedAmount.toFixed(2))} ${this.selectedToCurrency}`

      // Perform the conversion for the 9 most popular currencies
      const convertedResults = this.popularCurrencies.map((currency) => {
        const popularToRate = this.currencies[currency];
        const popularConvertedAmount = (this.inputAmount / fromRate) * popularToRate;
        return { currency, convertedAmount: popularConvertedAmount };
      });
      this.popularCurrenciesCovertedRates = convertedResults
    } else {
      console.error('Exchange rates not available for selected currencies.');
    }
  }

  onClickMoreDetails() {
    this.moreDetails = true;
    this.currencyTitle = this.currencySymbols[this.selectedFromCurrency]
  }

  backHome() {
    this.moreDetails = false
    this.currencyTitle = 'Currency Exchanger'
  }

}
