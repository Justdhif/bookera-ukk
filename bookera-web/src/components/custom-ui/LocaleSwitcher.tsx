import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import { Dispatch, SetStateAction } from 'react';
import { Locale } from '@/i18n/config';

type LocaleSwitcherProps = {
    setLocale: Dispatch<SetStateAction<Locale | undefined>>;
};

export default function LocaleSwitcher({ setLocale }: LocaleSwitcherProps) {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    return (
        <LocaleSwitcherSelect
            defaultValue={locale}
            items={[
                {
                    value: 'en',
                    label: t('en'),
                },
                {
                    value: 'id',
                    label: t('id'),
                },
            ]}
            label={t('label')}
            setLocale={setLocale}
        />
    );
}
