import React, { useState } from 'react'
import { Page, Loading } from "@shopify/polaris";
import { NavBar } from './components'
import { Outlet } from 'react-router-dom'
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';

export default function AppLayout() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const loadingMarkup = isLoading ? <Loading /> : null;

    return (
        <Page fullWidth >
            <TitleBar title={t("HomePage.title")} />
            <main className='main'>
                <NavBar />
                <Outlet />
            </main>
        </Page>
    )
}
