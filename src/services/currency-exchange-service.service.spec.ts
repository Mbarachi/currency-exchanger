import { TestBed } from '@angular/core/testing';

import { CurrencyExchangeServiceService } from './currency-exchange-service.service';

describe('CurrencyExchangeServiceService', () => {
  let service: CurrencyExchangeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyExchangeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
