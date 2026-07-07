import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder, Product } from '@/lib/types';

export const getStoryImages = (brandProducts: Product[] = []): ImagePlaceholder[] => {
  const images = PlaceHolderImages.filter(
    (img) => img.id.startsWith('story-') || img.id.startsWith('ugc-')
  ).slice(0, 4);
  return images.map((img, idx) => ({
    ...img,
    description:
      idx === 0
        ? 'Наши бестселлеры: идеальная посадка и качество.'
        : idx === 1
          ? 'LIVE: Как мы создаем коллекции.'
          : idx === 2
            ? 'Новая капсула в деталях.'
            : 'За кулисами новой съемки.',
    viewers: idx === 0 ? '1.5k' : idx === 1 ? '842' : idx === 2 ? '2.1k' : '3.4k',
    // Story variants for MVP
    mode: idx === 0 ? 'products' : idx === 1 ? 'invitation' : idx === 2 ? 'gallery' : 'simple',
    products: idx === 0 ? brandProducts.slice(0, 2) : [],
    isLiveNow: idx === 1,
    extraImages:
      idx === 2
        ? [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
          ]
        : [],
  }));
};

export const filterBrandProducts = (
  brandProducts: Product[],
  activeAudience: string | string[],
  activeCapsule: string | null,
  filterOutlet: string[],
  filterCategory: string[],
  filterColor: string[],
  filterAvailability: string[]
) => {
  const audiences = Array.isArray(activeAudience) ? activeAudience : [activeAudience];
  return brandProducts.filter((p) => {
    if (!audiences.includes('Все') && !audiences.includes(p.audience || '')) return false;
    if (activeCapsule && p.capsule !== activeCapsule) return false;

    // Filter by catalog (Marketplace vs Outlet)
    if (filterOutlet.length === 1) {
      const inOutlet = p.outlet === true || p.is_outlet === true;
      if (filterOutlet.includes('outlet') && !inOutlet) return false;
      if (filterOutlet.includes('marketplace') && inOutlet) return false;
    }

    if (filterCategory.length > 0 && !filterCategory.includes(p.category)) return false;
    if (filterColor.length > 0 && !filterColor.includes(p.color)) return false;
    if (filterAvailability.length > 0 && !filterAvailability.includes(p.availability || 'in_stock'))
      return false;
    return true;
  });
};

export const getFilteredMediaData = (brand: any) => {
  return {
    live: (brand?.events?.filter((e: any) => e.type === 'Прямой эфир') || []).map(
      (e: any, i: number) => ({
        id: e.id || `live-${i}`,
        title: e.title,
        date: e.date,
        status: new Date(e.date) > new Date() ? 'planned' : 'live',
        imageUrl:
          e.imageUrl || 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&q=80',
      })
    ),
    blog: brand?.articles?.filter((a: any) => a.type === 'blog') || [],
    events: (brand?.events?.filter((e: any) => e.type !== 'Прямой эфир') || []).map(
      (e: any, i: number) => ({
        id: e.id || `event-${i}`,
        title: e.title,
        date: e.date,
        type: e.type,
        imageUrl:
          e.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&q=80',
        location: e.location || 'Москва',
      })
    ),
    social: brand?.socials_data || [],
    video: brand?.videos || [],
    customerMentions: brand?.mentions || [],
    press:
      brand?.articles
        ?.filter((a: any) => a.type === 'press')
        .map((a: any) => ({
          ...a,
          name: a.title.split(' ')[0], // Mock magazine name
          logoUrl: '',
        })) || [],
    bts: brand?.bts_data || [],
    podcasts: brand?.podcasts_data || [],
  };
};
