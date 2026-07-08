import * as z from 'zod';

export const productEditSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().optional(),
  sku: z.string().min(1, 'Артикул обязателен'),
  additionalSku: z.string().optional(),
  productionCost: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Себестоимость не может быть отрицательной').optional().or(z.literal(''))
  ),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Цена не может быть отрицательной')),
  markup: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Наценка не может быть отрицательной').optional().or(z.literal(''))
  ),
  description: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  sizeTemplates: z.array(z.string()).optional(),
  availableColors: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Название цвета обязательно'),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Неверный HEX формат'),
        colorCode: z.string().optional(),
        colorDescription: z.string().optional(),
        status: z.enum(['active', 'disabled']).default('active'),
        isBase: z.boolean().default(false),
        lifecycleStatus: z.enum(['in_stock', 'outlet', 'archived']).default('in_stock'),
        noSale: z.boolean().default(false),
        carryOver: z.boolean().default(false),
        discounts: z
          .array(
            z.object({
              percentage: z.preprocess(
                (val) => (val === '' ? undefined : Number(val)),
                z.number().min(0).max(100)
              ),
              startDate: z.string(),
              endDate: z.string(),
            })
          )
          .optional(),
        sizeAvailability: z
          .array(
            z.object({
              size: z.string().min(1, 'Размер обязателен'),
              status: z.enum(['in_stock', 'pre_order', 'out_of_stock']),
              quantity: z.preprocess(
                (val) => (val === '' ? undefined : Number(val)),
                z.number().min(0).optional()
              ),
              preOrderDate: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  composition: z
    .array(
      z.object({
        material: z.string().min(1, 'Материал обязателен'),
        percentage: z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          z
            .number()
            .min(0, 'Процент не может быть больше 100')
            .max(100, 'Процент не может быть больше 100')
            .optional()
            .or(z.literal(''))
        ),
      })
    )
    .optional(),
  material: z.string().optional(),
  insulationMaterial: z.string().optional(),
  temperature: z.string().optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string(),
        hint: z.string(),
        colorName: z.string().optional(),
        isCover: z.boolean().optional(),
      })
    )
    .optional(),
  videoUrls: z.array(z.object({ url: z.string().url('Неверный URL') })).optional(),
  model3dUrls: z.array(z.object({ url: z.string().url('Неверный URL') })).optional(),
  audience: z.enum(['Мужской', 'Женский', 'Унисекс']),
  category: z.string().min(1, 'Категория обязательна'),
  subcategory: z.string().optional(),
  subcategory2: z.string().optional(),
  collectionYear: z.string().optional(),
  season: z.enum(['осень-зима', 'весна-лето', 'круглогодичная']),
  collection: z.string().optional(),
  orderAvailability: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    })
    .optional(),
  marketing: z
    .object({
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  priceParsing: z
    .object({
      autoParseUrl: z.string().url('Неверный URL').optional(),
      manualLinks: z.array(z.object({ url: z.string().url('Неверный URL') })).optional(),
    })
    .optional(),
  clothing: z
    .object({
      fit: z.string().optional(),
      length: z.string().optional(),
      sleeveLength: z.string().optional(),
      cuff: z.string().optional(),
      collar: z.string().optional(),
      fastening: z.string().optional(),
      waist: z.string().optional(),
      pockets: z.string().optional(),
      lining: z.string().optional(),
      stitching: z.string().optional(),
      decor: z.string().optional(),
      hardware: z.string().optional(),
      fabricTexture: z.string().optional(),
      processingTech: z.string().optional(),
      pattern: z.string().optional(),
      shoulder: z.string().optional(),
      backDetails: z.string().optional(),
      hemType: z.string().optional(),
      waistband: z.string().optional(),
      transformation: z.string().optional(),
      reinforcement: z.string().optional(),
      seam: z.string().optional(),
      combination: z.string().optional(),
      drapery: z.string().optional(),
      hemFinish: z.string().optional(),
    })
    .optional(),
  footwear: z
    .object({
      heelHeight: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().optional().or(z.literal(''))
      ),
      upperMaterial: z.string().optional(),
      soleMaterial: z.string().optional(),
      insoleMaterial: z.string().optional(),
    })
    .optional(),
  attributes: z
    .object({
      style: z.string().optional(),
      occasion: z.string().optional(),
      brandSignature: z.string().optional(),
    })
    .optional(),
});

export type ProductEditFormValues = z.infer<typeof productEditSchema>;
