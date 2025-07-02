import type { DecimalSource } from "break_infinity.js";
import Decimal from "break_infinity.js";

const LETTERS = "~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export enum NotationType {
    Default,
    Scientific,
}

export function formatLetters(n: DecimalSource) {
    const d = new Decimal(n);
    let o = Math.floor(d.e / 3);

    // resulting letters
    let result = "";

    while (o > 0) {
        const letter = LETTERS[o % LETTERS.length];
        result = `${letter}${result}`;

        o = Math.floor(o / LETTERS.length);
    }

    const mantissaPlaces = 2 - (d.e % 3);
    const mantissa = 10 ** (Decimal.log10(d) % 3);

    return `${mantissa.toFixed(mantissaPlaces)}${result}`;
}

export function formatRoman(n: number): string {
    const strings: [number, string][] = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];
    let result = "";
    for (const [amount, string] of strings) {
        while (n >= amount) {
            result += string;
            n -= amount;
            if (n <= 0) return result;
        }
    }
    return result;
}
