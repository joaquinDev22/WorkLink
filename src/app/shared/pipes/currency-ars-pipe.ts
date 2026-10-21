import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyArs',
})
export class CurrencyArsPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
