// Real estate mortgage & amortization calculations
import type { MortgageCalculationInput, MortgageCalculationResult } from './types';

export function calculateMortgage(input: MortgageCalculationInput): MortgageCalculationResult {
  const homePrice = Math.max(0, input.homePrice || 0);
  const downPaymentPercent = Math.min(100, Math.max(0, input.downPaymentPercent ?? 20));
  const interestRate = Math.max(0.1, input.interestRate ?? 6.5);
  const loanTermYears = input.loanTermYears === 15 ? 15 : 30;
  const annualTaxRate = input.annualPropertyTaxRate ?? 1.25; // Default San Diego County ~1.25%
  const annualInsurance = input.annualHomeInsurance ?? Math.max(1000, homePrice * 0.002);
  const monthlyHoa = Math.max(0, input.monthlyHoa ?? 0);
  const isVaLoan = Boolean(input.isVaLoan);

  const downPaymentAmount = Math.round((homePrice * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, homePrice - downPaymentAmount);

  // Monthly Principal & Interest calculation
  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    
    monthlyPrincipalAndInterest = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    );
  }

  // Monthly taxes and insurance
  const monthlyPropertyTax = Math.round((homePrice * (annualTaxRate / 100)) / 12);
  const monthlyHomeInsurance = Math.round(annualInsurance / 12);

  // Private Mortgage Insurance (PMI)
  // VA loans have 0% PMI by federal regulation!
  // Conventional loans require PMI if down payment is less than 20%
  let monthlyPmi = 0;
  if (!isVaLoan && downPaymentPercent < 20 && loanAmount > 0) {
    const annualPmiRate = 0.0075; // ~0.75% of loan balance per year
    monthlyPmi = Math.round((loanAmount * annualPmiRate) / 12);
  }

  const totalMonthlyPayment = 
    monthlyPrincipalAndInterest + 
    monthlyPropertyTax + 
    monthlyHomeInsurance + 
    monthlyPmi + 
    monthlyHoa;

  return {
    homePrice,
    downPaymentAmount,
    loanAmount,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyPmi,
    monthlyHoa,
    totalMonthlyPayment
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
