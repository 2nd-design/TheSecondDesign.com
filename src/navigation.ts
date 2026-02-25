import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Home', href: '/' },

    { text: 'Consulting', href: '/consulting' },

    { text: 'Real World Ready', href: '/real-world-ready' },

    { text: 'Testimonials', href: '/testimonials' },

    { text: 'Blog', href: getBlogPermalink() },

    // More dropdown (last item)
    {
      text: 'More',
      links: [
        { text: 'Products', href: '/products' },
        { text: 'Proof of Work', href: '/proof-of-work' },
        { text: 'Open Source', href: '/open-source' },
        { text: 'About', href: '/about' },
        { text: 'Contact', href: '/contact' },
      ],
    },
  ],
  actions: [],
};

export const footerData = {
  links: [
    {
      title: 'Company',
      links: [
        { text: 'Products', href: '/products' },
        { text: 'Open Source', href: '/open-source' },
        { text: 'About', href: '/about' },
        { text: 'Consulting', href: '/consulting' },
        { text: 'Real World Ready', href: '/real-world-ready' },
        { text: 'Proof of Work', href: '/proof-of-work' },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Testimonials', href: '/testimonials' },
        { text: 'Contact', href: '/contact' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/TheSecondDesign' },
  ],
  footNote: `
    © ${new Date().getFullYear()} The Second Design. All rights reserved.
  `,
};
