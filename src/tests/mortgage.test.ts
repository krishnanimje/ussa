import { describe, it, expect } from 'vitest';
import { calculateMortgage, formatCurrency } from '../lib/mortgage';

describe('Mortgage Calculations', () => {
  it('calculates monthly principal and interest accurately for 30-year fixed', () => {
    const result = calculateMortgage({
      homePrice: 1000000,
      downPaymentPercent: 20,
      interestRate: 6.5,
      loanTermYears: 30,
      annualPropertyTaxRate: 1.25,
      annualHomeInsurance: 1200,
      monthlyHoa: 0,
      isVaLoan: false
    });

    expect(result.homePrice).toBe(1000000);
    expect(result.downPaymentAmount).toBe(200000);
    expect(result.loanAmount).toBe(800000);
    // Principal & interest for $800k at 6.5% for 30yr is approx $5,057
    expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(5000);
    expect(result.monthlyPrincipalAndInterest).toBeLessThan(5100);
    // With 20% down, PMI should be 0
    expect(result.monthlyPmi).toBe(0);
    expect(result.totalMonthlyPayment).toBeGreaterThan(6000);
  });

  it('correctly waives PMI for VA loans even with 0% down', () => {
    const result = calculateMortgage({
      homePrice: 800000,
      downPaymentPercent: 0,
      interestRate: 6.0,
      loanTermYears: 30,
      annualPropertyTaxRate: 1.2,
      annualHomeInsurance: 1200,
      monthlyHoa: 0,
      isVaLoan: true // VA military loan
    });

    expect(result.downPaymentAmount).toBe(0);
    expect(result.loanAmount).toBe(800000);
    expect(result.monthlyPmi).toBe(0); // VA benefits eliminate PMI
  });

  it('adds PMI for conventional loans under 20% down', () => {
    const result = calculateMortgage({
      homePrice: 800000,
      downPaymentPercent: 5,
      interestRate: 6.5,
      loanTermYears: 30,
      isVaLoan: false
    });

    expect(result.monthlyPmi).toBeGreaterThan(0);
  });

  it('formats currency cleanly without cents', () => {
    expect(formatCurrency(1250000)).toBe('$1,250,000');
    expect(formatCurrency(750)).toBe('$750');
  });
});
