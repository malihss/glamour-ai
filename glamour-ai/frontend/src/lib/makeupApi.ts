// src/lib/makeupApi.ts
// Static product catalogue (40+ products, no API calls) + bonus Makeup API fetch

// ── Raw Makeup API shape (bonus only) ────────────────────────────────────────
export interface MakeupAPIProduct {
  id: number
  brand: string
  name: string
  price: string
  price_sign: string | null
  currency: string | null
  image_link: string
  product_link: string
  website_link: string
  description: string
  rating: number | null
  category: string
  product_type: string
  tag_list: string[]
  product_colors: { hex_value: string; colour_name: string }[]
}

// ── Normalised product shape ──────────────────────────────────────────────────
export interface NormalisedProduct {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice?: number
  primaryImage: string
  isFeatured: boolean
  avgRating?: number
  reviewCount?: number
  category: { id: number; name: string; slug: string }
  brand: { id: number; name: string; slug: string }
  variants: { id: string; name: string; shadeHex: string; stockQuantity: number }[]
  tags: string[]
}

// ── Shared category objects ───────────────────────────────────────────────────
const CAT_MAKEUP    = { id: 1, name: 'Makeup',    slug: 'makeup'    }
const CAT_SKINCARE  = { id: 2, name: 'Skincare',  slug: 'skincare'  }
const CAT_FRAGRANCE = { id: 3, name: 'Fragrance', slug: 'fragrance' }
const CAT_TOOLS     = { id: 4, name: 'Tools',     slug: 'tools'     }

// ── Shared brand objects ──────────────────────────────────────────────────────
const BRAND_FENTY      = { id: 1,  name: 'Fenty Beauty',       slug: 'fenty-beauty'       }
const BRAND_CT         = { id: 2,  name: 'Charlotte Tilbury',  slug: 'charlotte-tilbury'  }
const BRAND_NARS       = { id: 3,  name: 'NARS',               slug: 'nars'               }
const BRAND_MAC        = { id: 4,  name: 'MAC',                slug: 'mac'                }
const BRAND_YSL        = { id: 5,  name: 'YSL Beauty',         slug: 'ysl-beauty'         }
const BRAND_DIOR_B     = { id: 6,  name: 'Dior Beauty',        slug: 'dior-beauty'        }
const BRAND_PMG        = { id: 7,  name: 'Pat McGrath Labs',   slug: 'pat-mcgrath-labs'   }
const BRAND_RARE       = { id: 8,  name: 'Rare Beauty',        slug: 'rare-beauty'        }
const BRAND_LAMER      = { id: 9,  name: 'La Mer',             slug: 'la-mer'             }
const BRAND_TATCHA     = { id: 10, name: 'Tatcha',             slug: 'tatcha'             }
const BRAND_DE         = { id: 11, name: 'Drunk Elephant',     slug: 'drunk-elephant'     }
const BRAND_TO         = { id: 12, name: 'The Ordinary',       slug: 'the-ordinary'       }
const BRAND_SC         = { id: 13, name: 'SkinCeuticals',      slug: 'skinceuticals'      }
const BRAND_CHANEL     = { id: 14, name: 'Chanel',             slug: 'chanel'             }
const BRAND_DIOR_F     = { id: 15, name: 'Dior',               slug: 'dior'               }
const BRAND_JM         = { id: 16, name: 'Jo Malone',          slug: 'jo-malone'          }
const BRAND_BYREDO     = { id: 17, name: 'Byredo',             slug: 'byredo'             }
const BRAND_FOREO      = { id: 18, name: 'FOREO',              slug: 'foreo'              }
const BRAND_BB         = { id: 19, name: 'Beautyblender',      slug: 'beautyblender'      }

// ── Static catalogue ──────────────────────────────────────────────────────────
export const CATALOGUE: NormalisedProduct[] = [

  // ────────────────────────────────────────────────────────────────────────────
  // MAKEUP (16 products)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'm1',
    slug: 'fenty-gloss-bomb-universal-lip-luminizer',
    name: 'Gloss Bomb Universal Lip Luminizer',
    shortDescription: 'High-shine, non-sticky lip gloss that flatters every skin tone.',
    description: 'Fenty Beauty\'s iconic Gloss Bomb delivers an ultra-glossy, plumping shine with a hint of vanilla scent. The doe-foot applicator glides on smoothly for a full, luscious look that lasts all day.',
    price: 22,
    compareAtPrice: 28,
    primaryImage: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 3241,
    category: CAT_MAKEUP,
    brand: BRAND_FENTY,
    variants: [
      { id: 'm1-v1', name: 'Fenty Glow',   shadeHex: '#E8A898', stockQuantity: 80 },
      { id: 'm1-v2', name: 'Hot Chocolit', shadeHex: '#7B3F2E', stockQuantity: 60 },
      { id: 'm1-v3', name: 'Fu$$y',        shadeHex: '#D4607A', stockQuantity: 45 },
      { id: 'm1-v4', name: 'Glass Slipper',shadeHex: '#F5D5C8', stockQuantity: 70 },
    ],
    tags: ['lip gloss', 'shine', 'vegan', 'bestseller'],
  },
  {
    id: 'm2',
    slug: 'charlotte-tilbury-matte-revolution-lipstick',
    name: 'Matte Revolution Lipstick',
    shortDescription: 'Iconic matte lipstick with a comfortable, long-wearing formula.',
    description: 'Charlotte Tilbury\'s Matte Revolution is a cult-favourite lipstick that delivers intense colour with a velvety matte finish. Infused with a moisturising complex, it keeps lips comfortable for up to 10 hours.',
    price: 38,
    primaryImage: 'https://images.unsplash.com/photo-1631214524020-3c69b4b0b1a4?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 2108,
    category: CAT_MAKEUP,
    brand: BRAND_CT,
    variants: [
      { id: 'm2-v1', name: 'Pillow Talk',    shadeHex: '#C4706A', stockQuantity: 90 },
      { id: 'm2-v2', name: 'Red Carpet Red', shadeHex: '#C0392B', stockQuantity: 55 },
      { id: 'm2-v3', name: 'Bond Girl',      shadeHex: '#8B2252', stockQuantity: 40 },
    ],
    tags: ['lipstick', 'matte', 'long-wearing'],
  },
  {
    id: 'm3',
    slug: 'fenty-beauty-pro-filtr-foundation',
    name: 'Pro Filt\'r Soft Matte Longwear Foundation',
    shortDescription: '40-shade foundation with a soft matte, skin-smoothing finish.',
    description: 'Fenty Beauty\'s Pro Filt\'r Foundation offers buildable, medium-to-full coverage with a soft matte finish. Available in 50 shades, it\'s sweat- and humidity-resistant for up to 24 hours of wear.',
    price: 40,
    compareAtPrice: 46,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 5892,
    category: CAT_MAKEUP,
    brand: BRAND_FENTY,
    variants: [
      { id: 'm3-v1', name: '110N',  shadeHex: '#F5DEB3', stockQuantity: 50 },
      { id: 'm3-v2', name: '230N',  shadeHex: '#D2A679', stockQuantity: 60 },
      { id: 'm3-v3', name: '340W',  shadeHex: '#A0724A', stockQuantity: 45 },
      { id: 'm3-v4', name: '490N',  shadeHex: '#4A2C1A', stockQuantity: 30 },
    ],
    tags: ['foundation', 'matte', 'full coverage', 'inclusive'],
  },
  {
    id: 'm4',
    slug: 'pat-mcgrath-mothership-eyeshadow-palette',
    name: 'Mothership I: Subliminal Eyeshadow Palette',
    shortDescription: 'Luxurious 10-pan palette with nudes, neutrals and shimmers.',
    description: 'Pat McGrath Labs\' Mothership palette is a masterclass in wearable glamour. Ten ultra-blendable shades — from satin nudes to dazzling metallics — deliver infinite eye looks for every occasion.',
    price: 125,
    primaryImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    isFeatured: true,
    avgRating: 4.9,
    reviewCount: 1876,
    category: CAT_MAKEUP,
    brand: BRAND_PMG,
    variants: [
      { id: 'm4-v1', name: 'Subliminal', shadeHex: '#C8A882', stockQuantity: 35 },
    ],
    tags: ['eyeshadow', 'palette', 'luxury', 'pigmented'],
  },
  {
    id: 'm5',
    slug: 'nars-climax-mascara',
    name: 'Climax Mascara',
    shortDescription: 'Extreme volume mascara for bold, dramatic lashes.',
    description: 'NARS Climax Mascara delivers maximum volume and intense black pigment in a single stroke. The oversized brush coats every lash from root to tip for a full, fanned-out effect that lasts all day.',
    price: 27,
    primaryImage: 'https://images.unsplash.com/photo-1631214524020-3c69b4b0b1a4?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 1423,
    category: CAT_MAKEUP,
    brand: BRAND_NARS,
    variants: [
      { id: 'm5-v1', name: 'Explicit Black', shadeHex: '#0A0A0A', stockQuantity: 100 },
    ],
    tags: ['mascara', 'volume', 'dramatic'],
  },
  {
    id: 'm6',
    slug: 'rare-beauty-soft-pinch-liquid-blush',
    name: 'Soft Pinch Liquid Blush',
    shortDescription: 'Weightless liquid blush that blends to a natural flush.',
    description: 'Rare Beauty\'s Soft Pinch Liquid Blush is a highly pigmented, long-lasting formula that blends seamlessly into skin. A tiny drop delivers a natural, healthy-looking flush that lasts up to 12 hours.',
    price: 22,
    compareAtPrice: 26,
    primaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 4102,
    category: CAT_MAKEUP,
    brand: BRAND_RARE,
    variants: [
      { id: 'm6-v1', name: 'Joy',    shadeHex: '#E8736A', stockQuantity: 75 },
      { id: 'm6-v2', name: 'Hope',   shadeHex: '#D4A0A0', stockQuantity: 60 },
      { id: 'm6-v3', name: 'Bliss',  shadeHex: '#C97B8A', stockQuantity: 50 },
      { id: 'm6-v4', name: 'Serene', shadeHex: '#B5838D', stockQuantity: 40 },
    ],
    tags: ['blush', 'liquid', 'natural', 'long-lasting'],
  },
  {
    id: 'm7',
    slug: 'nars-radiant-creamy-concealer',
    name: 'Radiant Creamy Concealer',
    shortDescription: 'Creamy, full-coverage concealer with a radiant finish.',
    description: 'NARS Radiant Creamy Concealer provides buildable, full coverage that conceals dark circles, blemishes and imperfections. The lightweight formula blends effortlessly and never creases.',
    price: 32,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 3654,
    category: CAT_MAKEUP,
    brand: BRAND_NARS,
    variants: [
      { id: 'm7-v1', name: 'Chantilly', shadeHex: '#F5E6D3', stockQuantity: 55 },
      { id: 'm7-v2', name: 'Vanilla',   shadeHex: '#EDD5B3', stockQuantity: 60 },
      { id: 'm7-v3', name: 'Caramel',   shadeHex: '#C49A6C', stockQuantity: 45 },
      { id: 'm7-v4', name: 'Espresso',  shadeHex: '#4A2C1A', stockQuantity: 30 },
    ],
    tags: ['concealer', 'full coverage', 'radiant'],
  },
  {
    id: 'm8',
    slug: 'charlotte-tilbury-beauty-light-wand-highlighter',
    name: 'Beauty Light Wand Highlighter',
    shortDescription: 'Liquid highlighter wand for a lit-from-within glow.',
    description: 'Charlotte Tilbury\'s Beauty Light Wand delivers a buildable, luminous highlight in a convenient wand format. The lightweight formula blends seamlessly for a natural, glowing finish on cheekbones, brow bones and cupid\'s bow.',
    price: 45,
    primaryImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 987,
    category: CAT_MAKEUP,
    brand: BRAND_CT,
    variants: [
      { id: 'm8-v1', name: 'Pinkgasm',    shadeHex: '#F4C2C2', stockQuantity: 50 },
      { id: 'm8-v2', name: 'Goldgasm',    shadeHex: '#F0D080', stockQuantity: 45 },
      { id: 'm8-v3', name: 'Peachgasm',   shadeHex: '#FFCBA4', stockQuantity: 40 },
    ],
    tags: ['highlighter', 'glow', 'liquid', 'luminous'],
  },
  {
    id: 'm9',
    slug: 'ysl-rouge-pur-couture-lipstick',
    name: 'Rouge Pur Couture Lipstick',
    shortDescription: 'Iconic satin lipstick with rich, long-lasting colour.',
    description: 'YSL Beauty\'s Rouge Pur Couture is a legendary lipstick that delivers intense, saturated colour with a comfortable satin finish. The formula is enriched with moisturising ingredients for all-day comfort.',
    price: 42,
    primaryImage: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 1234,
    category: CAT_MAKEUP,
    brand: BRAND_YSL,
    variants: [
      { id: 'm9-v1', name: 'Le Rouge',    shadeHex: '#C0392B', stockQuantity: 65 },
      { id: 'm9-v2', name: 'Rose Stiletto',shadeHex: '#D4607A', stockQuantity: 55 },
      { id: 'm9-v3', name: 'Nude Beige',  shadeHex: '#C4956A', stockQuantity: 50 },
    ],
    tags: ['lipstick', 'satin', 'luxury', 'iconic'],
  },
  {
    id: 'm10',
    slug: 'mac-extended-play-gigablack-lash-eyeliner',
    name: 'Extended Play Gigablack Lash Eyeliner',
    shortDescription: 'Intense black liquid eyeliner for precise, dramatic lines.',
    description: 'MAC\'s Extended Play Gigablack Lash Eyeliner delivers ultra-black, smudge-proof lines with a fine-tip brush. The long-wearing formula stays put for up to 12 hours without fading or flaking.',
    price: 24,
    primaryImage: 'https://images.unsplash.com/photo-1631214524020-3c69b4b0b1a4?w=600&q=80',
    isFeatured: false,
    avgRating: 4.4,
    reviewCount: 876,
    category: CAT_MAKEUP,
    brand: BRAND_MAC,
    variants: [
      { id: 'm10-v1', name: 'Gigablack', shadeHex: '#0A0A0A', stockQuantity: 90 },
    ],
    tags: ['eyeliner', 'liquid', 'precise', 'smudge-proof'],
  },
  {
    id: 'm11',
    slug: 'nars-laguna-bronzer',
    name: 'Laguna Bronzer',
    shortDescription: 'Cult-favourite bronzer for a sun-kissed, natural glow.',
    description: 'NARS Laguna Bronzer is a universally flattering pressed powder bronzer that delivers a warm, sun-kissed finish. The silky formula blends effortlessly for a natural, healthy-looking glow.',
    price: 38,
    primaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 2341,
    category: CAT_MAKEUP,
    brand: BRAND_NARS,
    variants: [
      { id: 'm11-v1', name: 'Laguna', shadeHex: '#C4956A', stockQuantity: 70 },
    ],
    tags: ['bronzer', 'sun-kissed', 'powder', 'cult-favourite'],
  },
  {
    id: 'm12',
    slug: 'dior-beauty-diorskin-forever-contour',
    name: 'Dior Forever Couture Luminizer Contour',
    shortDescription: 'Sculpting contour powder for defined, chiselled features.',
    description: 'Dior Beauty\'s Forever Couture Luminizer Contour is a finely milled powder that sculpts and defines facial features. The buildable formula blends seamlessly for a natural, chiselled effect.',
    price: 55,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 654,
    category: CAT_MAKEUP,
    brand: BRAND_DIOR_B,
    variants: [
      { id: 'm12-v1', name: 'Warm Taupe', shadeHex: '#9B7B5B', stockQuantity: 40 },
      { id: 'm12-v2', name: 'Cool Brown', shadeHex: '#7B5B4B', stockQuantity: 35 },
    ],
    tags: ['contour', 'sculpting', 'powder', 'luxury'],
  },
  {
    id: 'm13',
    slug: 'mac-lip-pencil-liner',
    name: 'Lip Pencil',
    shortDescription: 'Creamy, long-wearing lip liner for defined, lasting colour.',
    description: 'MAC Lip Pencil is a smooth, creamy lip liner that defines and shapes lips with precision. The long-wearing formula prevents feathering and keeps lipstick in place all day.',
    price: 22,
    primaryImage: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=600&q=80',
    isFeatured: false,
    avgRating: 4.4,
    reviewCount: 1102,
    category: CAT_MAKEUP,
    brand: BRAND_MAC,
    variants: [
      { id: 'm13-v1', name: 'Whirl',       shadeHex: '#C4956A', stockQuantity: 60 },
      { id: 'm13-v2', name: 'Soar',        shadeHex: '#B5838D', stockQuantity: 55 },
      { id: 'm13-v3', name: 'Spice',       shadeHex: '#8B4513', stockQuantity: 50 },
      { id: 'm13-v4', name: 'Cherry',      shadeHex: '#C0392B', stockQuantity: 45 },
    ],
    tags: ['lip liner', 'define', 'long-wearing'],
  },
  {
    id: 'm14',
    slug: 'charlotte-tilbury-airbrush-flawless-finish-powder',
    name: 'Airbrush Flawless Finish Setting Powder',
    shortDescription: 'Finely milled setting powder for a flawless, blurred finish.',
    description: 'Charlotte Tilbury\'s Airbrush Flawless Finish Powder blurs pores and imperfections for a smooth, airbrushed complexion. The ultra-fine formula sets makeup and controls shine for up to 12 hours.',
    price: 52,
    primaryImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 1876,
    category: CAT_MAKEUP,
    brand: BRAND_CT,
    variants: [
      { id: 'm14-v1', name: 'Fair',   shadeHex: '#F5E6D3', stockQuantity: 55 },
      { id: 'm14-v2', name: 'Medium', shadeHex: '#D2A679', stockQuantity: 50 },
      { id: 'm14-v3', name: 'Deep',   shadeHex: '#8B5E3C', stockQuantity: 40 },
    ],
    tags: ['powder', 'setting', 'blurring', 'flawless'],
  },
  {
    id: 'm15',
    slug: 'fenty-beauty-pro-filtr-primer',
    name: 'Pro Filt\'r Instant Retouch Primer',
    shortDescription: 'Pore-minimising primer for a smooth, long-lasting base.',
    description: 'Fenty Beauty\'s Pro Filt\'r Primer creates a smooth, pore-minimising base that helps foundation last all day. The lightweight, oil-free formula blurs imperfections and controls shine for a flawless finish.',
    price: 34,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 2109,
    category: CAT_MAKEUP,
    brand: BRAND_FENTY,
    variants: [
      { id: 'm15-v1', name: 'Universal', shadeHex: '#F0E0D0', stockQuantity: 80 },
    ],
    tags: ['primer', 'pore-minimising', 'oil-free', 'long-lasting'],
  },
  {
    id: 'm16',
    slug: 'mac-fix-plus-setting-spray',
    name: 'Fix+ Setting Spray',
    shortDescription: 'Iconic setting spray that refreshes and sets makeup all day.',
    description: 'MAC Fix+ is a cult-favourite setting spray that refreshes skin and sets makeup for a natural, skin-like finish. The lightweight mist can also be used to intensify eyeshadow pigment or hydrate skin throughout the day.',
    price: 30,
    compareAtPrice: 35,
    primaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 3421,
    category: CAT_MAKEUP,
    brand: BRAND_MAC,
    variants: [
      { id: 'm16-v1', name: 'Original',    shadeHex: '#E8F4F8', stockQuantity: 100 },
      { id: 'm16-v2', name: 'Rose',        shadeHex: '#FFE4E1', stockQuantity: 70 },
      { id: 'm16-v3', name: 'Coconut',     shadeHex: '#FFF8DC', stockQuantity: 60 },
    ],
    tags: ['setting spray', 'long-lasting', 'refresh', 'cult-favourite'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SKINCARE (12 products)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 's1',
    slug: 'la-mer-creme-de-la-mer-moisturizer',
    name: 'Crème de la Mer Moisturizing Cream',
    shortDescription: 'Legendary ultra-rich moisturiser with Miracle Broth.',
    description: 'La Mer\'s iconic Crème de la Mer is powered by the legendary Miracle Broth — a sea kelp ferment that renews and restores skin. The ultra-rich formula deeply hydrates, softens and heals for a visibly transformed complexion.',
    price: 220,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 2876,
    category: CAT_SKINCARE,
    brand: BRAND_LAMER,
    variants: [
      { id: 's1-v1', name: '30ml',  shadeHex: '#F5F0E8', stockQuantity: 40 },
      { id: 's1-v2', name: '60ml',  shadeHex: '#F5F0E8', stockQuantity: 30 },
      { id: 's1-v3', name: '100ml', shadeHex: '#F5F0E8', stockQuantity: 20 },
    ],
    tags: ['moisturiser', 'luxury', 'anti-ageing', 'hydrating'],
  },
  {
    id: 's2',
    slug: 'drunk-elephant-c-firma-vitamin-c-serum',
    name: 'C-Firma Fresh Day Serum',
    shortDescription: 'Potent vitamin C serum that brightens and firms skin.',
    description: 'Drunk Elephant\'s C-Firma Fresh Day Serum combines 15% L-ascorbic acid with ferulic acid and vitamin E to brighten, firm and protect skin from environmental damage. The fresh-mix format preserves potency until use.',
    price: 90,
    compareAtPrice: 105,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 1987,
    category: CAT_SKINCARE,
    brand: BRAND_DE,
    variants: [
      { id: 's2-v1', name: '30ml', shadeHex: '#FFF3CD', stockQuantity: 50 },
    ],
    tags: ['vitamin C', 'serum', 'brightening', 'antioxidant'],
  },
  {
    id: 's3',
    slug: 'tatcha-rice-wash-cleanser',
    name: 'The Rice Wash Skin-Softening Cleanser',
    shortDescription: 'Gentle foaming cleanser inspired by Japanese rice water rituals.',
    description: 'Tatcha\'s The Rice Wash is a gentle, creamy cleanser that transforms into a soft foam to cleanse without stripping. Formulated with Japanese rice bran, it leaves skin soft, smooth and perfectly balanced.',
    price: 38,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 1432,
    category: CAT_SKINCARE,
    brand: BRAND_TATCHA,
    variants: [
      { id: 's3-v1', name: '150ml', shadeHex: '#FFFAF0', stockQuantity: 65 },
    ],
    tags: ['cleanser', 'gentle', 'Japanese beauty', 'rice'],
  },
  {
    id: 's4',
    slug: 'la-mer-eye-concentrate',
    name: 'The Eye Concentrate',
    shortDescription: 'Intensive eye treatment that targets dark circles and puffiness.',
    description: 'La Mer\'s The Eye Concentrate is powered by Miracle Broth to visibly reduce dark circles, puffiness and fine lines around the delicate eye area. The rich, cooling formula delivers intense hydration and renewal.',
    price: 185,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 876,
    category: CAT_SKINCARE,
    brand: BRAND_LAMER,
    variants: [
      { id: 's4-v1', name: '15ml', shadeHex: '#F5F0E8', stockQuantity: 25 },
    ],
    tags: ['eye cream', 'dark circles', 'puffiness', 'luxury'],
  },
  {
    id: 's5',
    slug: 'tatcha-the-essence-toner',
    name: 'The Essence Plumping Skin Softener',
    shortDescription: 'Hydrating essence-toner hybrid that preps skin for serums.',
    description: 'Tatcha\'s The Essence is a lightweight, hydrating essence that preps skin to better absorb subsequent skincare. Formulated with Hadasei-3 — a trinity of Japanese superfoods — it plumps, softens and smooths skin.',
    price: 68,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 1123,
    category: CAT_SKINCARE,
    brand: BRAND_TATCHA,
    variants: [
      { id: 's5-v1', name: '75ml',  shadeHex: '#F0F8FF', stockQuantity: 55 },
      { id: 's5-v2', name: '150ml', shadeHex: '#F0F8FF', stockQuantity: 40 },
    ],
    tags: ['toner', 'essence', 'hydrating', 'Japanese beauty'],
  },
  {
    id: 's6',
    slug: 'skinceuticals-physical-fusion-uv-defense-spf50',
    name: 'Physical Fusion UV Defense SPF 50',
    shortDescription: 'Tinted mineral sunscreen with a universal skin tone.',
    description: 'SkinCeuticals Physical Fusion UV Defense SPF 50 is a 100% mineral sunscreen with a translucent tint that adapts to all skin tones. The lightweight formula provides broad-spectrum protection while improving skin texture.',
    price: 42,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 2341,
    category: CAT_SKINCARE,
    brand: BRAND_SC,
    variants: [
      { id: 's6-v1', name: '50ml', shadeHex: '#F5DEB3', stockQuantity: 70 },
    ],
    tags: ['SPF', 'sunscreen', 'mineral', 'tinted'],
  },
  {
    id: 's7',
    slug: 'tatcha-the-dewy-skin-mask',
    name: 'The Dewy Skin Mask',
    shortDescription: 'Plumping overnight mask for intensely hydrated, dewy skin.',
    description: 'Tatcha\'s The Dewy Skin Mask is a rich, overnight sleeping mask that delivers intense hydration while you sleep. Formulated with Japanese purple rice and hyaluronic acid, it plumps and smooths skin by morning.',
    price: 68,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 987,
    category: CAT_SKINCARE,
    brand: BRAND_TATCHA,
    variants: [
      { id: 's7-v1', name: '50ml', shadeHex: '#E8F4F8', stockQuantity: 45 },
    ],
    tags: ['face mask', 'overnight', 'hydrating', 'dewy'],
  },
  {
    id: 's8',
    slug: 'the-ordinary-retinol-0-5-in-squalane',
    name: 'Retinol 0.5% in Squalane',
    shortDescription: 'Effective retinol serum for smoother, younger-looking skin.',
    description: 'The Ordinary\'s Retinol 0.5% in Squalane is a moderate-strength retinol formula that targets fine lines, wrinkles and uneven skin texture. Suspended in squalane, it minimises irritation while delivering visible results.',
    price: 9,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: true,
    avgRating: 4.5,
    reviewCount: 8765,
    category: CAT_SKINCARE,
    brand: BRAND_TO,
    variants: [
      { id: 's8-v1', name: '30ml', shadeHex: '#FFFAF0', stockQuantity: 120 },
    ],
    tags: ['retinol', 'anti-ageing', 'affordable', 'serum'],
  },
  {
    id: 's9',
    slug: 'skinceuticals-ce-ferulic-vitamin-c-serum',
    name: 'C E Ferulic Vitamin C Serum',
    shortDescription: 'Gold-standard antioxidant serum for brighter, firmer skin.',
    description: 'SkinCeuticals C E Ferulic is the gold-standard vitamin C serum, combining 15% L-ascorbic acid with vitamin E and ferulic acid. This patented formula provides advanced environmental protection and visibly improves signs of ageing.',
    price: 182,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 3210,
    category: CAT_SKINCARE,
    brand: BRAND_SC,
    variants: [
      { id: 's9-v1', name: '30ml', shadeHex: '#FFF3CD', stockQuantity: 35 },
    ],
    tags: ['vitamin C', 'antioxidant', 'brightening', 'anti-ageing'],
  },
  {
    id: 's10',
    slug: 'the-ordinary-hyaluronic-acid-2-b5',
    name: 'Hyaluronic Acid 2% + B5',
    shortDescription: 'Multi-depth hydration serum with hyaluronic acid and vitamin B5.',
    description: 'The Ordinary\'s Hyaluronic Acid 2% + B5 is a water-based serum that delivers multi-depth hydration using three molecular weights of hyaluronic acid. Vitamin B5 enhances surface hydration and skin smoothness.',
    price: 12,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 12543,
    category: CAT_SKINCARE,
    brand: BRAND_TO,
    variants: [
      { id: 's10-v1', name: '30ml', shadeHex: '#F0F8FF', stockQuantity: 150 },
    ],
    tags: ['hyaluronic acid', 'hydrating', 'affordable', 'serum'],
  },
  {
    id: 's11',
    slug: 'la-mer-the-moisturizing-soft-cream',
    name: 'The Moisturizing Soft Cream',
    shortDescription: 'Lightweight version of the iconic Crème de la Mer.',
    description: 'La Mer\'s The Moisturizing Soft Cream delivers the transformative power of Miracle Broth in a lighter, more fluid texture. Ideal for normal to combination skin, it hydrates, renews and protects for a visibly radiant complexion.',
    price: 195,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 1654,
    category: CAT_SKINCARE,
    brand: BRAND_LAMER,
    variants: [
      { id: 's11-v1', name: '30ml', shadeHex: '#F5F0E8', stockQuantity: 30 },
      { id: 's11-v2', name: '60ml', shadeHex: '#F5F0E8', stockQuantity: 20 },
    ],
    tags: ['moisturiser', 'luxury', 'lightweight', 'anti-ageing'],
  },
  {
    id: 's12',
    slug: 'drunk-elephant-t-l-c-sukari-babyfacial',
    name: 'T.L.C. Sukari Babyfacial',
    shortDescription: 'At-home AHA/BHA facial for smoother, more radiant skin.',
    description: 'Drunk Elephant\'s T.L.C. Sukari Babyfacial is a potent at-home facial treatment combining 25% AHA and 2% BHA to resurface, smooth and brighten skin. Use weekly for visibly refined pores and a more even complexion.',
    price: 80,
    compareAtPrice: 92,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 2109,
    category: CAT_SKINCARE,
    brand: BRAND_DE,
    variants: [
      { id: 's12-v1', name: '50ml', shadeHex: '#FFF8DC', stockQuantity: 45 },
    ],
    tags: ['exfoliator', 'AHA', 'BHA', 'resurfacing'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // FRAGRANCE (8 products)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'f1',
    slug: 'chanel-no5-eau-de-parfum',
    name: 'N°5 Eau de Parfum',
    shortDescription: 'The world\'s most iconic fragrance — timeless floral aldehyde.',
    description: 'Chanel N°5 is the world\'s most iconic fragrance, created in 1921 by Ernest Beaux. A timeless floral aldehyde with notes of ylang-ylang, rose, jasmine and sandalwood, it remains the ultimate symbol of femininity and elegance.',
    price: 148,
    primaryImage: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    isFeatured: true,
    avgRating: 4.9,
    reviewCount: 8765,
    category: CAT_FRAGRANCE,
    brand: BRAND_CHANEL,
    variants: [
      { id: 'f1-v1', name: '35ml',  shadeHex: '#F5DEB3', stockQuantity: 50 },
      { id: 'f1-v2', name: '50ml',  shadeHex: '#F5DEB3', stockQuantity: 40 },
      { id: 'f1-v3', name: '100ml', shadeHex: '#F5DEB3', stockQuantity: 30 },
    ],
    tags: ['perfume', 'floral', 'iconic', 'luxury', 'classic'],
  },
  {
    id: 'f2',
    slug: 'dior-miss-dior-eau-de-parfum',
    name: 'Miss Dior Eau de Parfum',
    shortDescription: 'Romantic floral fragrance with peony, rose and musk.',
    description: 'Dior\'s Miss Dior Eau de Parfum is a romantic, feminine fragrance that opens with fresh citrus notes before blooming into a heart of peony and Grasse rose. A warm base of white musk and patchouli adds depth and sensuality.',
    price: 132,
    primaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 4321,
    category: CAT_FRAGRANCE,
    brand: BRAND_DIOR_F,
    variants: [
      { id: 'f2-v1', name: '30ml',  shadeHex: '#FFB6C1', stockQuantity: 45 },
      { id: 'f2-v2', name: '50ml',  shadeHex: '#FFB6C1', stockQuantity: 35 },
      { id: 'f2-v3', name: '100ml', shadeHex: '#FFB6C1', stockQuantity: 25 },
    ],
    tags: ['perfume', 'floral', 'romantic', 'feminine'],
  },
  {
    id: 'f3',
    slug: 'jo-malone-peony-blush-suede-cologne',
    name: 'Peony & Blush Suede Cologne',
    shortDescription: 'Soft, feminine fragrance with peony, red apple and suede.',
    description: 'Jo Malone\'s Peony & Blush Suede is a soft, feminine fragrance that combines the lush bloom of peony with the sensual warmth of suede. Notes of red apple and jasmine add freshness and depth to this romantic scent.',
    price: 156,
    primaryImage: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 2109,
    category: CAT_FRAGRANCE,
    brand: BRAND_JM,
    variants: [
      { id: 'f3-v1', name: '30ml',  shadeHex: '#FFB6C1', stockQuantity: 40 },
      { id: 'f3-v2', name: '100ml', shadeHex: '#FFB6C1', stockQuantity: 30 },
    ],
    tags: ['cologne', 'floral', 'suede', 'feminine'],
  },
  {
    id: 'f4',
    slug: 'byredo-bal-dafrique-eau-de-parfum',
    name: 'Bal d\'Afrique Eau de Parfum',
    shortDescription: 'Exotic, woody fragrance inspired by African art and culture.',
    description: 'Byredo\'s Bal d\'Afrique is an exotic, woody fragrance inspired by the vibrant art and culture of Africa. Notes of African marigold, violet and cyclamen blend with a warm base of cedarwood, vetiver and musk.',
    price: 220,
    primaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 1543,
    category: CAT_FRAGRANCE,
    brand: BRAND_BYREDO,
    variants: [
      { id: 'f4-v1', name: '50ml',  shadeHex: '#DEB887', stockQuantity: 30 },
      { id: 'f4-v2', name: '100ml', shadeHex: '#DEB887', stockQuantity: 20 },
    ],
    tags: ['perfume', 'woody', 'exotic', 'unisex', 'luxury'],
  },
  {
    id: 'f5',
    slug: 'chanel-coco-mademoiselle-eau-de-parfum',
    name: 'Coco Mademoiselle Eau de Parfum',
    shortDescription: 'Bold, modern fragrance with orange, rose and patchouli.',
    description: 'Chanel Coco Mademoiselle is a bold, modern fragrance that opens with fresh orange and bergamot before revealing a heart of rose and jasmine. A sensual base of patchouli and vetiver gives it an irresistible depth.',
    price: 142,
    primaryImage: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    isFeatured: false,
    avgRating: 4.8,
    reviewCount: 6543,
    category: CAT_FRAGRANCE,
    brand: BRAND_CHANEL,
    variants: [
      { id: 'f5-v1', name: '35ml',  shadeHex: '#F5DEB3', stockQuantity: 45 },
      { id: 'f5-v2', name: '50ml',  shadeHex: '#F5DEB3', stockQuantity: 35 },
      { id: 'f5-v3', name: '100ml', shadeHex: '#F5DEB3', stockQuantity: 25 },
    ],
    tags: ['perfume', 'floral', 'oriental', 'modern', 'iconic'],
  },
  {
    id: 'f6',
    slug: 'byredo-gypsy-water-eau-de-parfum',
    name: 'Gypsy Water Eau de Parfum',
    shortDescription: 'Fresh, woody fragrance with bergamot, pine and sandalwood.',
    description: 'Byredo\'s Gypsy Water is a fresh, woody fragrance inspired by the freedom of the open road. Notes of bergamot, lemon and pepper open into a heart of incense and pine, settling into a warm base of sandalwood and vanilla.',
    price: 210,
    primaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 1876,
    category: CAT_FRAGRANCE,
    brand: BRAND_BYREDO,
    variants: [
      { id: 'f6-v1', name: '50ml',  shadeHex: '#E8E8D0', stockQuantity: 30 },
      { id: 'f6-v2', name: '100ml', shadeHex: '#E8E8D0', stockQuantity: 20 },
    ],
    tags: ['perfume', 'woody', 'fresh', 'unisex'],
  },
  {
    id: 'f7',
    slug: 'jo-malone-wood-sage-sea-salt-body-mist',
    name: 'Wood Sage & Sea Salt Body Mist',
    shortDescription: 'Light, refreshing body mist with sea salt and sage.',
    description: 'Jo Malone\'s Wood Sage & Sea Salt Body Mist is a light, refreshing fragrance mist that captures the invigorating freshness of the sea. Notes of ambrette seed, sea salt and sage create a clean, natural scent perfect for everyday wear.',
    price: 52,
    primaryImage: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 987,
    category: CAT_FRAGRANCE,
    brand: BRAND_JM,
    variants: [
      { id: 'f7-v1', name: '100ml', shadeHex: '#E0F0F8', stockQuantity: 60 },
    ],
    tags: ['body mist', 'fresh', 'sea salt', 'light'],
  },
  {
    id: 'f8',
    slug: 'dior-sauvage-body-mist',
    name: 'Sauvage Parfum Body Mist',
    shortDescription: 'Fresh, aromatic body mist inspired by the iconic Sauvage.',
    description: 'Dior\'s Sauvage Body Mist brings the iconic freshness of Sauvage in a light, refreshing format. Notes of bergamot, pepper and ambroxan create a clean, masculine scent that\'s perfect for daily use.',
    price: 58,
    primaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 1234,
    category: CAT_FRAGRANCE,
    brand: BRAND_DIOR_F,
    variants: [
      { id: 'f8-v1', name: '200ml', shadeHex: '#E8F0F8', stockQuantity: 55 },
    ],
    tags: ['body mist', 'fresh', 'aromatic', 'masculine'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // TOOLS (6 products)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 't1',
    slug: 'mac-182-buffer-brush-set',
    name: '15-Piece Professional Brush Set',
    shortDescription: 'Complete professional brush set for flawless makeup application.',
    description: 'This comprehensive 15-piece professional brush set includes everything you need for a flawless makeup application. From foundation and powder brushes to precise eye and lip brushes, each tool is crafted with ultra-soft synthetic fibres for seamless blending.',
    price: 85,
    compareAtPrice: 110,
    primaryImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 2341,
    category: CAT_TOOLS,
    brand: BRAND_MAC,
    variants: [
      { id: 't1-v1', name: 'Black Handle', shadeHex: '#1A1A1A', stockQuantity: 50 },
      { id: 't1-v2', name: 'Rose Gold',    shadeHex: '#B76E79', stockQuantity: 40 },
    ],
    tags: ['brush set', 'professional', 'synthetic', 'complete'],
  },
  {
    id: 't2',
    slug: 'beautyblender-original-makeup-sponge',
    name: 'Original Beautyblender Makeup Sponge',
    shortDescription: 'The iconic egg-shaped sponge for a flawless, airbrushed finish.',
    description: 'The original Beautyblender is the iconic egg-shaped makeup sponge that revolutionised foundation application. Its unique shape and ultra-soft material blend foundation, concealer and powder seamlessly for a flawless, airbrushed finish.',
    price: 22,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 15432,
    category: CAT_TOOLS,
    brand: BRAND_BB,
    variants: [
      { id: 't2-v1', name: 'Original Pink', shadeHex: '#FF69B4', stockQuantity: 120 },
      { id: 't2-v2', name: 'Nude',          shadeHex: '#D2A679', stockQuantity: 80 },
      { id: 't2-v3', name: 'Black',         shadeHex: '#1A1A1A', stockQuantity: 70 },
    ],
    tags: ['sponge', 'blending', 'foundation', 'iconic'],
  },
  {
    id: 't3',
    slug: 'foreo-luna-4-cleansing-device',
    name: 'LUNA 4 Facial Cleansing Device',
    shortDescription: 'Smart facial cleansing device with T-Sonic pulsations.',
    description: 'FOREO\'s LUNA 4 is a smart facial cleansing device that uses T-Sonic pulsations to remove 99.5% of dirt, oil and makeup residue. The ultra-hygienic silicone bristles are gentle on all skin types and never need replacing.',
    price: 199,
    primaryImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 3210,
    category: CAT_TOOLS,
    brand: BRAND_FOREO,
    variants: [
      { id: 't3-v1', name: 'Pearl Pink', shadeHex: '#FFB6C1', stockQuantity: 35 },
      { id: 't3-v2', name: 'Mint',       shadeHex: '#98FF98', stockQuantity: 30 },
      { id: 't3-v3', name: 'Black',      shadeHex: '#1A1A1A', stockQuantity: 25 },
    ],
    tags: ['cleansing device', 'sonic', 'silicone', 'smart'],
  },
  {
    id: 't4',
    slug: 'tatcha-jade-gua-sha-tool',
    name: 'Jade Gua Sha Facial Lifting Tool',
    shortDescription: 'Traditional jade gua sha tool for facial massage and lifting.',
    description: 'This authentic jade gua sha tool is crafted from genuine jade stone for a cooling, lifting facial massage. Regular use helps reduce puffiness, improve circulation and promote lymphatic drainage for a more sculpted, radiant complexion.',
    price: 38,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: false,
    avgRating: 4.6,
    reviewCount: 1876,
    category: CAT_TOOLS,
    brand: BRAND_TATCHA,
    variants: [
      { id: 't4-v1', name: 'Jade Green', shadeHex: '#00A86B', stockQuantity: 60 },
      { id: 't4-v2', name: 'Rose Quartz',shadeHex: '#F4C2C2', stockQuantity: 50 },
    ],
    tags: ['gua sha', 'jade', 'facial massage', 'lifting'],
  },
  {
    id: 't5',
    slug: 'shiseido-eyelash-curler',
    name: 'Professional Eyelash Curler',
    shortDescription: 'Precision eyelash curler for beautifully curled, lifted lashes.',
    description: 'This professional eyelash curler features a precision-engineered curved pad that fits the natural shape of the eye for a perfect curl every time. The ergonomic handle provides comfortable control for both beginners and professionals.',
    price: 24,
    primaryImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    isFeatured: false,
    avgRating: 4.5,
    reviewCount: 2109,
    category: CAT_TOOLS,
    brand: BRAND_MAC,
    variants: [
      { id: 't5-v1', name: 'Silver', shadeHex: '#C0C0C0', stockQuantity: 80 },
      { id: 't5-v2', name: 'Gold',   shadeHex: '#FFD700', stockQuantity: 60 },
    ],
    tags: ['eyelash curler', 'precision', 'professional'],
  },
  {
    id: 't6',
    slug: 'tweezerman-slant-tweezer',
    name: 'Slant Tweezer',
    shortDescription: 'Professional-grade slant tweezer for precise brow grooming.',
    description: 'Tweezerman\'s iconic Slant Tweezer is the gold standard in brow grooming. Hand-filed to a perfectly calibrated tension, the slanted tip grips even the finest hairs for precise, effortless removal. Comes with a lifetime guarantee.',
    price: 30,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    isFeatured: false,
    avgRating: 4.8,
    reviewCount: 4321,
    category: CAT_TOOLS,
    brand: BRAND_MAC,
    variants: [
      { id: 't6-v1', name: 'Stainless Steel', shadeHex: '#C0C0C0', stockQuantity: 90 },
      { id: 't6-v2', name: 'Rose Gold',       shadeHex: '#B76E79', stockQuantity: 70 },
      { id: 't6-v3', name: 'Black',           shadeHex: '#1A1A1A', stockQuantity: 60 },
    ],
    tags: ['tweezers', 'brow', 'precision', 'professional'],
  },
]

// ── Catalogue query functions (synchronous, no API calls) ─────────────────────

/**
 * Returns featured products from the static catalogue.
 * @param limit - Maximum number of products to return (default 8)
 */
export function fetchFeaturedProducts(limit = 8): NormalisedProduct[] {
  return CATALOGUE.filter(p => p.isFeatured).slice(0, limit)
}

/**
 * Returns products filtered by category slug.
 * @param slug  - Category slug: 'makeup' | 'skincare' | 'fragrance' | 'tools'
 * @param limit - Maximum number of products to return (default 12)
 */
export function fetchByCategory(slug: string, limit = 12): NormalisedProduct[] {
  return CATALOGUE.filter(p => p.category.slug === slug).slice(0, limit)
}

/**
 * Returns makeup category products.
 * @param limit - Maximum number of products to return (default 16)
 */
export function fetchMakeupProducts(limit = 16): NormalisedProduct[] {
  return fetchByCategory('makeup', limit)
}

/**
 * Searches products by name or brand name (case-insensitive).
 * @param query - Search string
 * @param limit - Maximum number of products to return (default 12)
 */
export function searchProducts(query: string, limit = 12): NormalisedProduct[] {
  const q = query.toLowerCase().trim()
  if (!q) return CATALOGUE.slice(0, limit)
  return CATALOGUE
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
    .slice(0, limit)
}

// ── Bonus: raw Makeup API fetch (not used by the functions above) ─────────────

const MAKEUP_API_BASE = 'https://makeup-api.herokuapp.com/api/v1/products.json'

/**
 * Bonus async function that fetches directly from the Makeup API.
 * NOT called by any of the catalogue functions above.
 * @param params - Query parameters to pass to the Makeup API
 */
export async function fetchFromMakeupAPI(
  params: Record<string, string> = {}
): Promise<MakeupAPIProduct[]> {
  const qs = new URLSearchParams(params).toString()
  const url = qs ? `${MAKEUP_API_BASE}?${qs}` : MAKEUP_API_BASE
  const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit)
  if (!res.ok) throw new Error(`Makeup API error: ${res.status}`)
  return res.json() as Promise<MakeupAPIProduct[]>
}
