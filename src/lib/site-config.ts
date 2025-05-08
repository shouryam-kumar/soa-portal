// Site-wide configuration values
const siteConfig = {
  name: 'Okto Portal',
  shortName: 'Okto',
  description: 'The Okto Portal for the Summer of Abstraction program',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://okto.app',
  ogImage: '/images/okto-og.png',
  links: {
    twitter: 'https://twitter.com/oktoverse',
    github: 'https://github.com/okto-app',
  },
  contactEmail: 'support@okto.app',
};

export default siteConfig; 