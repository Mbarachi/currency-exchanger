import { Component, OnInit } from '@angular/core';
import { CurrencyExchangeServiceService } from 'src/services/currency-exchange-service.service';
import { CurrencyExchangeRates, CurrencySymbols } from 'src/types/currencyExchangeTypes';
import { Chart } from 'chart.js/auto';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(private exchangeService: CurrencyExchangeServiceService) { }

  chart: Chart | undefined;

  monthlyData: any[] = [];

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

  showCards: boolean = false

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
      }
    );
  }

  onInput(event: any) {
    const enteredValue = event.target.value
    this.areElementsDisabled = !event.target.value;

    // /Check if the entered value is negative
    if (enteredValue < 0) {
      this.inputAmount = 0;
    } else {
      // Allow positive values
      this.inputAmount = enteredValue;
    }
  }

  getCurrencyCodes(): string[] {
    return Object.keys(this.currencies)
  }

  getSymbols() {
    this.exchangeService.getSymbols().subscribe((res) => {
      if (res.success) {
        this.currencySymbols = res.symbols;
      }else{
        console.log(res.error)
      }
    })
  }

  goToMoreDetails(event: Event): void {
    const buttonText = (event.target as HTMLButtonElement).textContent;

    if (buttonText) {
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
    if (this.moreDetails) {
      this.getHistoricalRate();
    }
  }

  onFromCurrencyChange(event: any) {
    this.selectedFromCurrency = event.target.value;
    this.performConversion();
  }

  // Swap the selected currencies
  onSwap() {
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
        return { currency, convertedAmount: popularConvertedAmount.toFixed(2) };
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
    this.showCards = false
    this.currencyTitle = this.currencySymbols[this.selectedFromCurrency]
    this.getHistoricalRate()
  }

  backHome() {
    this.moreDetails = false
    this.showCards = false
    this.currencyTitle = 'Currency Exchanger'
    this.selectedFromCurrency = 'EUR';
    this.selectedToCurrency = 'USD';
    this.displayResult = `XX.XX USD`;
    this.inputAmount = 0
    this.convertedRate = `1 ${this.selectedFromCurrency} = ${this.currencies[this.selectedToCurrency]}${this.selectedToCurrency}`
  }

  getHistoricalRate() {
    this.monthlyData = []
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    for (let i = 0; i <= 12; i++) {
      let year = currentYear;
      let month = currentMonth - i;

      if (month <= 0) {
        month += 12;
        year--;
      }

      if (year === currentYear && month === currentMonth) {
        continue;
      }

      // Format the date to 'YYYY-MM-DD' using the last day of the month
      const lastDayOfMonth = new Date(year, month, 0);
      const formattedDate = this.formatDate(lastDayOfMonth);
      this.exchangeService.fetchHistoricalRates(this.selectedToCurrency, this.selectedFromCurrency, formattedDate).subscribe(data => {
        if (data.success) {
          this.monthlyData.unshift(data);
        }

        if (this.monthlyData.length === 12) {
          this.createChart();
        }
      });
    }
  }

  formatDate(date: Date): string {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    // Subtract one day to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonth.getTime() - 1);

    const year = lastDayOfMonth.getFullYear();
    const month = (lastDayOfMonth.getMonth() + 1).toString().padStart(2, '0');
    const day = lastDayOfMonth.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  createChart() {
    // Destroy existing chart if it exists for updates
    if (this.chart) {
      this.chart.destroy();
    }
    const labels = this.monthlyData.map(data => {
      const date = new Date(data.date);
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${monthName} ${year}`;
    });
    const datasets = Object.keys(this.monthlyData[0].rates).map(currency => {
      return {
        label: currency,
        data: this.monthlyData.map(data => data.rates[currency]),
        fill: false,
        borderColor: this.getRandomColor(),
        tension: 0.1
      };
    });

    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        scales: {
          x: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Months'
            }
          }] as any,
          y: [{
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Rates'
            }
          }] as any
        }
      }
    });
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}
