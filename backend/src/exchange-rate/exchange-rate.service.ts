import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, firstValueFrom } from 'rxjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ExchangeRateService {
  private exchangeRates: Record<string, number> = {
    'cash_try': 1.00
  }; 

  private readonly GOLD_CONVERSION_FACTOR = 31.1035; 
  private readonly QUARTER_GOLD_GRAMS = 1.75; 
  private readonly HALF_GOLD_GRAMS = 3.50;    
  private readonly FULL_GOLD_GRAMS = 7.016;   

  constructor(private readonly httpService: HttpService) {
    this.fetchExternalRates(); 
  }

  @Cron('0 9 * * *')
  async fetchExternalRates(): Promise<void> {
    
    const API_KEY = process.env.EXCHANGE_RATE_API_KEY; 

    if (!API_KEY) {
      this.exchangeRates['USD'] = 30.0; 
      this.exchangeRates['EUR'] = 32.0;
      this.exchangeRates['GBP'] = 38.0;
      this.exchangeRates['gold_gram'] = 2800; 
      return; 
    }

    const currencyUrl = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`; 
    
    try {
      const currencyResponse = await firstValueFrom(
        this.httpService.get(currencyUrl).pipe(
          map(response => response.data)
        )
      );

      if (currencyResponse.conversion_rates) {
        this.exchangeRates['USD'] = 1 / currencyResponse.conversion_rates['USD'];
        this.exchangeRates['EUR'] = 1 / currencyResponse.conversion_rates['EUR'];
        this.exchangeRates['GBP'] = 1 / currencyResponse.conversion_rates['GBP'];
      }
      
      const XAU_TRY_RATE = 175000; 

      if(XAU_TRY_RATE > 0) {
          const liveGramPrice = XAU_TRY_RATE / this.GOLD_CONVERSION_FACTOR; 
          this.exchangeRates['gold_gram'] = liveGramPrice;
      }
    } catch (error) {
      // Hata durumunda uygulama çökmesini önlemek için
      console.error('Harici kur çekme hatası. Son kaydedilen kurlar kullanılıyor:', error.message);
    }
  }

  getLivePrice(symbol: string): number {
    const symbolUpper = symbol.toUpperCase();
    
    if (symbol.includes('gold')) {
        const gramPrice = this.exchangeRates['gold_gram'] || 0; 
        
        switch(symbol) {
            case 'gold_gram':
                return gramPrice;
            case 'gold_quarter':
                return gramPrice * this.QUARTER_GOLD_GRAMS;
            case 'gold_half':
                return gramPrice * this.HALF_GOLD_GRAMS;
            case 'gold_full': 
                return gramPrice * this.FULL_GOLD_GRAMS;
            default:
                return 0;
        }
    }
    
    const price = this.exchangeRates[symbolUpper]; 
    
    return price || 0; 
  }
}