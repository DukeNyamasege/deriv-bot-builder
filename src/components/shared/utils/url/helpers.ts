import { URLUtils } from '@deriv-com/utils';

/**
 * Retrieves the 'lang' parameter from the URL.
 * @deprecated Please use 'URLUtils.getQueryParameter' from '@deriv-com/utils' instead.
 */
export const getLangFromUrl = (): string | null => URLUtils.getQueryParameter('lang') || null;

/**
 * Retrieves the 'action' parameter from the URL.
 * @deprecated Please use 'URLUtils.getQueryParameter' from '@deriv-com/utils' instead.
 */
export const getActionFromUrl = (): string | null => URLUtils.getQueryParameter('action') || null;

/**
 * Determines the platform based on the domain.
 */
export const getPlatformFromUrl = (domain: string = window.location.hostname) => {
    const resolutions = {
        is_staging_deriv_app: /^staging-app\.deriv\.(com|me|be)$/i.test(domain),
        is_deriv_app: /^app\.deriv\.(com|me|be)$/i.test(domain),
        is_test_link: /^(.*)\.binary\.sx$/i.test(domain),
        is_test_deriv_app: /^test-app\.deriv\.com$/i.test(domain),
        is_derivlite_com: /^bot\.derivlite\.com$/i.test(domain), // ✅ Added support for your domain
    };

    return {
        ...resolutions,
        is_staging: resolutions.is_staging_deriv_app,
        is_test_link: resolutions.is_test_link,
    };
};

/**
 * Checks if the current domain is a staging environment.
 */
export const isStaging = (domain: string = window.location.hostname): boolean => {
    const { is_staging_deriv_app } = getPlatformFromUrl(domain);
    return is_staging_deriv_app;
};

/**
 * Checks if the current domain is the test version of Deriv App.
 */
export const isTestDerivApp = (domain: string = window.location.hostname): boolean => {
    const { is_test_deriv_app } = getPlatformFromUrl(domain);
    return is_test_deriv_app;
};
