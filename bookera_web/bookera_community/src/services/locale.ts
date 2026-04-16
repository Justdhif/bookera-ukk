'use server';

import { cookies } from 'next/headers';
import { Locale, defaultLocale, locales } from '@/i18n/config';

const COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
};

function isLocale(value?: string): value is Locale {
    return Boolean(value && locales.includes(value as Locale));
}

export async function getUserLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;

    if (isLocale(locale)) {
        return locale;
    }

    return defaultLocale;
}

export async function setUserLocale(locale: Locale) {
    (await cookies()).set(COOKIE_NAME, locale, COOKIE_OPTIONS);
}
