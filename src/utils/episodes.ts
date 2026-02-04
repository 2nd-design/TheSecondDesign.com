import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface Episode {
  id: string;
  slug: string;
  title: string;
  studentName: string;
  excerpt?: string;
  videoUrl?: string;
  tags?: string[];
  draft?: boolean;
  publishDate?: Date;
  Content?: any;
}

const getNormalizedEpisode = async (entry: CollectionEntry<'episode'>): Promise<Episode> => {
  const { id, data } = entry;
  const { Content } = await render(entry);

  const slug = id.replace(/\.(md|mdx)$/, '');

  return {
    id,
    slug,
    title: data.title,
    studentName: data.studentName,
    excerpt: data.excerpt,
    videoUrl: data.videoUrl,
    tags: data.tags,
    draft: data.draft,
    publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
    Content,
  };
};

export const fetchEpisodes = async (): Promise<Episode[]> => {
  const entries = await getCollection('episode');
  const episodes = await Promise.all(entries.map(getNormalizedEpisode));

  return episodes
    .filter((e) => !e.draft)
    .sort((a, b) => (b.publishDate?.valueOf() ?? 0) - (a.publishDate?.valueOf() ?? 0));
};

export const getStaticPathsEpisodes = async () => {
  return (await fetchEpisodes()).map((episode) => ({
    params: { slug: episode.slug },
    props: { episode },
  }));
};
