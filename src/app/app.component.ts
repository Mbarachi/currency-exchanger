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

  displayResult: string = `XX.XX ${this.selectedToCurrency}`
  convertedRate: string = ''

  // Nine most popular currency
  popularCurrencies: string[] = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK'];

  currencyTitle: string = 'Currency Exchanger'

  currencies: CurrencyExchangeRates = {}
  currencySymbols: CurrencySymbols = {}

  popularCurrenciesCovertedRates: any[] = []

  moreDetails: boolean = false

  showCards:boolean = false

  ngOnInit(): void {
    this.getLatestRates();
    this.getSymbols();
    this.performConversion();
  }

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
    this.inputAmount = event.target.value
    this.areElementsDisabled = !event.target.value;
  }

  getCurrencyCodes(): string[] {
    return Object.keys(this.currencies)
  }

  getSymbols() {
    this.exchangeService.getSymbols().subscribe((res) => {
      if (res.success) {
        this.currencySymbols = res.symbols;
      }
    },
      (error) => {
        console.log(error);
      })
  }

  goToMoreDetails(event: Event): void {
    const buttonText = (event.target as HTMLButtonElement).textContent;

    if (buttonText) {
      // Split the button text using the hyphen
      const currencyCodes = buttonText.split('-');

      if (currencyCodes.length === 2) {
        const fromCurrency = currencyCodes[0]
        const toCurrency = currencyCodes[1].split(' ')
        this.selectedFromCurrency = fromCurrency
        this.selectedToCurrency = toCurrency[0]
        this.performConversion();
      }
      
      this.onClickMoreDetails();

    }
  }
  onToCurrencyChange(event: any) {
    this.selectedToCurrency = event.target.value;
    this.performConversion();
  }

  onFromCurrencyChange(event: any) {
    this.selectedFromCurrency = event.target.value;
    this.performConversion();
  }

  onSwap() {
    // Swap the selected currencies
    const temp = this.selectedFromCurrency;
    this.selectedFromCurrency = this.selectedToCurrency;
    this.selectedToCurrency = temp;
    this.performConversion()
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
      this.showCards = true
    } else {
      console.error('Exchange rates not available for selected currencies.');
    }
  }


  performConversion() {
    if (this.currencies[this.selectedFromCurrency] && this.currencies[this.selectedToCurrency]) {
      const fromRate = this.currencies[this.selectedFromCurrency];
      const toRate = this.currencies[this.selectedToCurrency];
      const convertedAmount = (1 / fromRate) * toRate;

      // Display the result for 1 unit of the selected currency against the "To" currency
      this.convertedRate = `1 ${this.selectedFromCurrency} = ${Number(convertedAmount.toFixed(6))} ${this.selectedToCurrency}`;
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
    this.showCards = false
    this.currencyTitle = 'Currency Exchanger'
    this.selectedFromCurrency = 'EUR';
    this.selectedToCurrency = 'USD';
    this.displayResult = 'XX.XX USD';
    this.inputAmount = 0
  }

}
