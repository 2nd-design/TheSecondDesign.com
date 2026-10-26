import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import satori from 'satori';
import sharp from 'sharp';
import type { AstroIntegration } from 'astro';

const require = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_LABEL = 'The Second Design';
const SITE_HOST = 'theseconddesign.com';

// Pages whose og:image still points at the site-wide default get a generated card.
// Pages that set their own image (blog posts, episodes) are left alone.
const DEFAULT_IMAGE_MARKER = 'hero-image';

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.html') ? [full] : [];
  });

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'");

const attr = (tag: string, name: string): string | undefined => {
  const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? m[1] ?? m[2] ?? m[3] : undefined;
};

const findMeta = (html: string, property: string): string | undefined => {
  for (const tag of html.match(/<meta\s[^>]*>/gi) || []) {
    if ((attr(tag, 'property') || attr(tag, 'name')) === property) return attr(tag, 'content');
  }
  return undefined;
};

const metaContent = (html: string, property: string): string | undefined => {
  const value = findMeta(html, property);
  return value === undefined ? undefined : decode(value);
};

const setMeta = (html: string, property: string, value: string | number): string =>
  html.replace(/<meta\s[^>]*>/gi, (tag) =>
    (attr(tag, 'property') || attr(tag, 'name')) === property
      ? tag.replace(/(\scontent=)(?:"[^"]*"|'[^']*'|[^\s>]+)/i, `$1"${value}"`)
      : tag
  );

const cleanTitle = (raw: string) =>
  raw
    .replace(/\s*[|·]\s*The Second Design\s*$/i, '')
    .replace(/\s*-\s*The Second Design\s*$/i, '')
    .trim();

const titleSize = (title: string) => (title.length > 70 ? 56 : title.length > 45 ? 68 : title.length > 25 ? 84 : 100);

const card = (title: string) => ({
  type: 'div',
  props: {
    style: {
      width: WIDTH,
      height: HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: '#020617',
      backgroundImage:
        'radial-gradient(circle at 85% 0%, rgba(139,92,246,0.35) 0%, rgba(2,6,23,0) 55%), radial-gradient(circle at 5% 100%, rgba(16,185,129,0.22) 0%, rgba(2,6,23,0) 50%)',
      fontFamily: 'DM Serif Display',
      color: '#ffffff',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: '#a78bfa', letterSpacing: 4 },
          children: [
            {
              type: 'div',
              props: { style: { width: 48, height: 3, backgroundImage: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' } },
            },
            SITE_LABEL.toUpperCase(),
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', fontSize: titleSize(title), lineHeight: 1.08, letterSpacing: -1, maxWidth: 1000 },
          children: title,
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', fontSize: 28, color: '#94a3b8' },
          children: SITE_HOST,
        },
      },
    ],
  },
});

export default function ogCards(): AstroIntegration {
  return {
    name: 'og-cards',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const fontPath = require.resolve('@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff');
        const fonts = [{ name: 'DM Serif Display', data: fs.readFileSync(fontPath), weight: 400 as const, style: 'normal' as const }];

        const outDir = path.join(distDir, 'og');
        fs.mkdirSync(outDir, { recursive: true });

        let count = 0;
        for (const file of walk(distDir)) {
          let html = fs.readFileSync(file, 'utf8');
          const image = metaContent(html, 'og:image');
          if (!image || !image.includes(DEFAULT_IMAGE_MARKER)) continue;

          const rawTitle = metaContent(html, 'og:title') || SITE_LABEL;
          const title = cleanTitle(rawTitle) || SITE_LABEL;

          const rel = path.relative(distDir, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
          const slug = (rel || 'home').replace(/\//g, '--');
          const png = await sharp(Buffer.from(await satori(card(title) as never, { width: WIDTH, height: HEIGHT, fonts }))).png().toBuffer();
          fs.writeFileSync(path.join(outDir, `${slug}.png`), png);

          const origin = new URL(image).origin;
          const url = `${origin}/og/${slug}.png`;

          html = setMeta(html, 'og:image', url);
          html = setMeta(html, 'twitter:image', url);
          html = setMeta(html, 'og:image:width', WIDTH);
          html = setMeta(html, 'og:image:height', HEIGHT);
          fs.writeFileSync(file, html);
          count++;
        }
        logger.info(`Generated ${count} link-preview cards in /og`);
      },
    },
  };
}
