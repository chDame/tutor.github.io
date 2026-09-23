import type { Fraction } from '../types'

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    [a, b] = [b, a % b]
  }
  return a || 1
}

export function reduceFraction(f: Fraction): Fraction {
  const divisor = gcd(f.num, f.den)
  return { num: f.num / divisor, den: f.den / divisor }
}

/** Cross-multiplication equality so equivalent (unsimplified) fractions are accepted. */
export function fractionsEqual(a: Fraction, b: Fraction): boolean {
  return a.num * b.den === b.num * a.den
}

export function formatFraction(f: Fraction): string {
  return `${f.num}/${f.den}`
}
