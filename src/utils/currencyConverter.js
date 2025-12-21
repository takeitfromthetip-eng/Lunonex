/**
 * Multi-Currency Support System
 * Automatically detects user location and shows prices in local currency
 * All payments converted to USD on backend
 * 
 * Supported Currencies:
 * - USD (United States Dollar) - Base currency
 * - EUR (Euro) - European Union
 * - GBP (British Pound) - United Kingdom
 * - JPY (Japanese Yen) - Japan
 * - CAD (Canadian Dollar) - Canada
 * - AUD (Australian Dollar) - Australia
 * - CHF (Swiss Franc) - Switzerland
 * - CNY (Chinese Yuan) - China
 * - INR (Indian Rupee) - India
 * - KRW (South Korean Won) - South Korea
 * - BRL (Brazilian Real) - Brazil
 * - MXN (Mexican Peso) - Mexico
 * - RUB (Russian Ruble) - Russia
 * - ZAR (South African Rand) - South Africa
 * - SGD (Singapore Dollar) - Singapore
 * - NZD (New Zealand Dollar) - New Zealand
 * - SEK (Swedish Krona) - Sweden
 * - NOK (Norwegian Krone) - Norway
 * - DKK (Danish Krone) - Denmark
 * - PLN (Polish Zloty) - Poland
 * - THB (Thai Baht) - Thailand
 * - IDR (Indonesian Rupiah) - Indonesia
 * - MYR (Malaysian Ringgit) - Malaysia
 * - PHP (Philippine Peso) - Philippines
 * - HKD (Hong Kong Dollar) - Hong Kong
 * - TWD (Taiwan Dollar) - Taiwan
 * - TRY (Turkish Lira) - Turkey
 * - AED (UAE Dirham) - United Arab Emirates
 * - SAR (Saudi Riyal) - Saudi Arabia
 * - ILS (Israeli Shekel) - Israel
 * - ARS (Argentine Peso) - Argentina
 * - CLP (Chilean Peso) - Chile
 * - COP (Colombian Peso) - Colombia
 * - PEN (Peruvian Sol) - Peru
 * - VND (Vietnamese Dong) - Vietnam
 * - EGP (Egyptian Pound) - Egypt
 * - NGN (Nigerian Naira) - Nigeria
 * - KES (Kenyan Shilling) - Kenya
 */

// Currency symbols and formatting
export const CURRENCY_CONFIG = {
    USD: { symbol: '$', name: 'US Dollar', decimals: 2, position: 'before' },
    EUR: { symbol: '€', name: 'Euro', decimals: 2, position: 'before' },
    GBP: { symbol: '£', name: 'British Pound', decimals: 2, position: 'before' },
    JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0, position: 'before' },
    CAD: { symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, position: 'before' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2, position: 'before' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2, position: 'before' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2, position: 'before' },
    INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2, position: 'before' },
    KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0, position: 'before' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2, position: 'before' },
    MXN: { symbol: 'MX$', name: 'Mexican Peso', decimals: 2, position: 'before' },
    RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2, position: 'before' },
    ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2, position: 'before' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2, position: 'before' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, position: 'before' },
    SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2, position: 'after' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2, position: 'after' },
    DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2, position: 'after' },
    PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2, position: 'after' },
    THB: { symbol: '฿', name: 'Thai Baht', decimals: 2, position: 'before' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, position: 'before' },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, position: 'before' },
    PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2, position: 'before' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, position: 'before' },
    TWD: { symbol: 'NT$', name: 'Taiwan Dollar', decimals: 0, position: 'before' },
    TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2, position: 'before' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, position: 'before' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal', decimals: 2, position: 'before' },
    ILS: { symbol: '₪', name: 'Israeli Shekel', decimals: 2, position: 'before' },
    ARS: { symbol: 'AR$', name: 'Argentine Peso', decimals: 2, position: 'before' },
    CLP: { symbol: 'CLP$', name: 'Chilean Peso', decimals: 0, position: 'before' },
    COP: { symbol: 'COL$', name: 'Colombian Peso', decimals: 0, position: 'before' },
    PEN: { symbol: 'S/', name: 'Peruvian Sol', decimals: 2, position: 'before' },
    VND: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0, position: 'after' },
    EGP: { symbol: 'E£', name: 'Egyptian Pound', decimals: 2, position: 'before' },
    NGN: { symbol: '₦', name: 'Nigerian Naira', decimals: 2, position: 'before' },
    KES: { symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, position: 'before' },
};

// Get real-time exchange rates from API
let cachedRates = null;
let lastFetch = 0;
const CACHE_DURATION = 3600000; // 1 hour

export async function getExchangeRates() {
    const now = Date.now();

    // Return cached rates if still valid
    if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
        return cachedRates;
    }

    try {
        // Use exchangerate-api.com (free tier: 1500 requests/month)
        // Alternative: api.frankfurter.app (free, no API key needed)
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        const data = await response.json();

        cachedRates = {
            USD: 1.00,
            ...data.rates,
            timestamp: now
        };

        lastFetch = now;
        return cachedRates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);

        // Fallback to approximate rates (updated November 2025)
        return {
            USD: 1.00,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.50,
            CAD: 1.38,
            AUD: 1.53,
            CHF: 0.88,
            CNY: 7.24,
            INR: 83.12,
            KRW: 1320.00,
            BRL: 4.98,
            MXN: 17.15,
            RUB: 92.50,
            ZAR: 18.65,
            SGD: 1.34,
            NZD: 1.67,
            SEK: 10.65,
            NOK: 10.95,
            DKK: 6.87,
            PLN: 4.02,
            THB: 34.85,
            IDR: 15680.00,
            MYR: 4.72,
            PHP: 56.45,
            HKD: 7.81,
            TWD: 31.85,
            TRY: 34.20,
            AED: 3.67,
            SAR: 3.75,
            ILS: 3.72,
            ARS: 350.00,
            CLP: 890.00,
            COP: 4100.00,
            PEN: 3.76,
            VND: 24500.00,
            EGP: 48.90,
            NGN: 780.00,
            KES: 129.00,
            timestamp: now
        };
    }
}

// Detect user's currency based on browser locale and timezone
export function detectUserCurrency() {
    try {
        // Try to detect from browser locale
        const locale = navigator.language || navigator.userLanguage;

        // Map common locales to currencies
        const localeToCurrency = {
            'en-US': 'USD', 'en': 'USD',
            'en-GB': 'GBP', 'en-UK': 'GBP',
            'en-CA': 'CAD',
            'en-AU': 'AUD',
            'en-NZ': 'NZD',
            'en-ZA': 'ZAR',
            'en-SG': 'SGD',
            'en-IN': 'INR',
            'en-HK': 'HKD',
            'en-PH': 'PHP',
            'en-MY': 'MYR',
            'en-NG': 'NGN',
            'en-KE': 'KES',
            'de-DE': 'EUR', 'de': 'EUR',
            'de-AT': 'EUR',
            'de-CH': 'CHF',
            'fr-FR': 'EUR', 'fr': 'EUR',
            'fr-CA': 'CAD',
            'fr-CH': 'CHF',
            'es-ES': 'EUR', 'es': 'EUR',
            'es-MX': 'MXN',
            'es-AR': 'ARS',
            'es-CL': 'CLP',
            'es-CO': 'COP',
            'es-PE': 'PEN',
            'it-IT': 'EUR', 'it': 'EUR',
            'it-CH': 'CHF',
            'nl-NL': 'EUR', 'nl': 'EUR',
            'pt-BR': 'BRL', 'pt': 'BRL',
            'pt-PT': 'EUR',
            'ja-JP': 'JPY', 'ja': 'JPY',
            'ko-KR': 'KRW', 'ko': 'KRW',
            'zh-CN': 'CNY', 'zh': 'CNY',
            'zh-TW': 'TWD',
            'zh-HK': 'HKD',
            'ru-RU': 'RUB', 'ru': 'RUB',
            'sv-SE': 'SEK', 'sv': 'SEK',
            'no-NO': 'NOK', 'no': 'NOK',
            'da-DK': 'DKK', 'da': 'DKK',
            'pl-PL': 'PLN', 'pl': 'PLN',
            'th-TH': 'THB', 'th': 'THB',
            'id-ID': 'IDR', 'id': 'IDR',
            'vi-VN': 'VND', 'vi': 'VND',
            'tr-TR': 'TRY', 'tr': 'TRY',
            'ar-AE': 'AED', 'ar': 'SAR',
            'ar-SA': 'SAR',
            'he-IL': 'ILS', 'he': 'ILS',
            'hi-IN': 'INR', 'hi': 'INR',
            'ms-MY': 'MYR', 'ms': 'MYR',
            'tl-PH': 'PHP',
            'el-GR': 'EUR',
            'fi-FI': 'EUR',
            'ro-RO': 'EUR',
            'bg-BG': 'EUR',
            'hr-HR': 'EUR',
            'cs-CZ': 'EUR',
            'hu-HU': 'EUR',
            'sk-SK': 'EUR',
            'sl-SI': 'EUR',
            'et-EE': 'EUR',
            'lv-LV': 'EUR',
            'lt-LT': 'EUR',
        };

        const detected = localeToCurrency[locale] || localeToCurrency[locale.split('-')[0]];
        if (detected) {
            return detected;
        }

        // Fallback to timezone-based detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timezoneToCurrency = {
            'America/New_York': 'USD',
            'America/Chicago': 'USD',
            'America/Los_Angeles': 'USD',
            'America/Denver': 'USD',
            'America/Toronto': 'CAD',
            'America/Vancouver': 'CAD',
            'America/Mexico_City': 'MXN',
            'America/Sao_Paulo': 'BRL',
            'America/Buenos_Aires': 'ARS',
            'America/Santiago': 'CLP',
            'America/Bogota': 'COP',
            'America/Lima': 'PEN',
            'Europe/London': 'GBP',
            'Europe/Paris': 'EUR',
            'Europe/Berlin': 'EUR',
            'Europe/Madrid': 'EUR',
            'Europe/Rome': 'EUR',
            'Europe/Amsterdam': 'EUR',
            'Europe/Brussels': 'EUR',
            'Europe/Vienna': 'EUR',
            'Europe/Stockholm': 'SEK',
            'Europe/Oslo': 'NOK',
            'Europe/Copenhagen': 'DKK',
            'Europe/Warsaw': 'PLN',
            'Europe/Zurich': 'CHF',
            'Europe/Moscow': 'RUB',
            'Europe/Istanbul': 'TRY',
            'Asia/Tokyo': 'JPY',
            'Asia/Seoul': 'KRW',
            'Asia/Shanghai': 'CNY',
            'Asia/Hong_Kong': 'HKD',
            'Asia/Taipei': 'TWD',
            'Asia/Singapore': 'SGD',
            'Asia/Bangkok': 'THB',
            'Asia/Jakarta': 'IDR',
            'Asia/Kuala_Lumpur': 'MYR',
            'Asia/Manila': 'PHP',
            'Asia/Ho_Chi_Minh': 'VND',
            'Asia/Dubai': 'AED',
            'Asia/Riyadh': 'SAR',
            'Asia/Tel_Aviv': 'ILS',
            'Asia/Kolkata': 'INR',
            'Australia/Sydney': 'AUD',
            'Australia/Melbourne': 'AUD',
            'Pacific/Auckland': 'NZD',
            'Africa/Johannesburg': 'ZAR',
            'Africa/Cairo': 'EGP',
            'Africa/Lagos': 'NGN',
            'Africa/Nairobi': 'KES',
        };

        return timezoneToCurrency[timezone] || 'USD';
    } catch (error) {
        console.error('Currency detection error:', error);
        return 'USD'; // Default to USD
    }
}

// Convert USD amount to target currency
export async function convertPrice(usdAmount, targetCurrency) {
    if (targetCurrency === 'USD') {
        return usdAmount;
    }

    const rates = await getExchangeRates();
    const rate = rates[targetCurrency];

    if (!rate) {
        console.warn(`Exchange rate not found for ${targetCurrency}, using USD`);
        return usdAmount;
    }

    return usdAmount * rate;
}

// Format price with currency symbol
export function formatPrice(amount, currency) {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
    const rounded = config.decimals === 0
        ? Math.round(amount)
        : Number(amount.toFixed(config.decimals));

    const formatted = rounded.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
    });

    if (config.position === 'before') {
        return `${config.symbol}${formatted}`;
    } else {
        return `${formatted} ${config.symbol}`;
    }
}

// Get price in user's currency with formatted string
export async function getPriceInUserCurrency(usdAmount) {
    const currency = detectUserCurrency();
    const amount = await convertPrice(usdAmount, currency);
    const formatted = formatPrice(amount, currency);

    return {
        currency,
        amount,
        formatted,
        usdAmount,
        rate: amount / usdAmount
    };
}

// Store user's preferred currency
export function setPreferredCurrency(currency) {
    localStorage.setItem('preferred_currency', currency);
}

export function getPreferredCurrency() {
    return localStorage.getItem('preferred_currency') || detectUserCurrency();
}
