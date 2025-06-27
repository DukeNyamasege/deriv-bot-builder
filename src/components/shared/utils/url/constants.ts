const isBrowser = () => typeof window !== 'undefined';

const deriv_com_url = 'deriv.com';
const deriv_me_url = 'deriv.me';
const deriv_be_url = 'deriv.be';
const mesoflix_url = 'mesoflix.online'; // ✅ Added support for your domain

const supported_domains = [deriv_com_url, deriv_me_url, deriv_be_url, mesoflix_url];
const domain_url_initial =
    (isBrowser() && window.location.hostname.replace(/^app\./, '').replace(/^bot\./, '')) || '';
const domain_url = supported_domains.includes(domain_url_initial) ? domain_url_initial : deriv_com_url;

export const deriv_urls = Object.freeze({
    DERIV_HOST_NAME: domain_url,
    DERIV_COM_PRODUCTION: `https://${domain_url}`,
    DERIV_COM_PRODUCTION_EU: `https://${domain_url}`,
    DERIV_COM_STAGING: `https://${domain_url}`,
    DERIV_APP_PRODUCTION: `https://${domain_url}`,
    DERIV_APP_STAGING: `https://${domain_url}`,
    SMARTTRADER_PRODUCTION: `https://${domain_url}`,
    SMARTTRADER_STAGING: `https://${domain_url}`,
    BINARYBOT_PRODUCTION: `https://${domain_url}`,
    BINARYBOT_STAGING: `https://${domain_url}`,
});
