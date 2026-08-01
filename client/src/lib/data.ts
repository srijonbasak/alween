export interface Perfume {
  _id: string;
  name: string;
  internalFormulaKey: string;
  description: string;
  imageUrls: string[];
  vimeoUrl?: string;
  current_volume_ml: number;
  reorder_threshold_ml: number;
  loss_margin_factor: number;
  pricePerMl: number;
  isExcludedFromDiscounts: boolean;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  type?: 'single' | 'combo';
  perfumeCategory?: 'inspired' | 'original';
  oilConcentration?: string;
  price6ml?: number;
  price10ml?: number;
  price15ml?: number;
  price30ml?: number;
  price50ml?: number;
  image6ml?: string;
  image10ml?: string;
  image15ml?: string;
  image30ml?: string;
  image50ml?: string;
  originalBottleImage?: string;
  packagingImage?: string;
  isFeatured?: boolean;
}

// Statically hardcoded 14 premium perfumes requested for the hero carousel slider
export const STATIC_HERO_PERFUMES: Perfume[] = [
  {
    _id: 'ST-WANTED',
    name: 'THE MOST WANTED',
    internalFormulaKey: 'ST-WANTED',
    description: 'A fragrance featuring cardamom, sweet toffee, and amberwood.',
    imageUrls: ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'],
    vimeoUrl: 'https://vimeo.com/1211733718',
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Cardamom, Mandarin, Pink Pepper',
    heartNotes: 'Toffee, Lavender, Sage',
    baseNotes: 'Amberwood, Benzoin, Patchouli'
  },
  {
    _id: 'ST-AVENTUS',
    name: 'CREED AVENTUS',
    internalFormulaKey: 'ST-AVENTUS',
    description: 'Features notes of pineapple, blackcurrant, and dry birch.',
    imageUrls: ['/images/creed_aventus.png'],
    vimeoUrl: 'https://vimeo.com/1211735131',
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 120,
    isExcludedFromDiscounts: false,
    topNotes: 'Pineapple, Bergamot, Blackcurrant',
    heartNotes: 'Birch, Jasmine, Patchouli',
    baseNotes: 'Oakmoss, Ambergris, Vanilla'
  },
  {
    _id: 'ST-ADG-PROF',
    name: 'ACQUA DI GIO PROFUMO',
    internalFormulaKey: 'ST-ADG-PROF',
    description: 'A fragrance featuring marine accords, bergamot, and incense.',
    imageUrls: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 75,
    isExcludedFromDiscounts: false,
    topNotes: 'Marine Notes, Bergamot, Grapefruit',
    heartNotes: 'Rosemary, Sage, Geranium',
    baseNotes: 'Incense, Patchouli, Vetiver'
  },
  {
    _id: 'ST-BR540',
    name: 'BACCARAT ROUGE 540',
    internalFormulaKey: 'ST-BR540',
    description: 'An amber, floral, and woody fragrance.',
    imageUrls: ['/images/baccarat_rouge.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 150,
    isExcludedFromDiscounts: false,
    topNotes: 'Saffron, Jasmine, Tagetes',
    heartNotes: 'Amberwood, Ambergris, Hedione',
    baseNotes: 'Fir Resin, Cedar, Musk'
  },
  {
    _id: 'ST-WULONG',
    name: 'WULONG CHA',
    internalFormulaKey: 'ST-WULONG',
    description: 'A citrus tea fragrance with notes of oolong tea, Mediterranean fig, and musk.',
    imageUrls: ['https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 95,
    isExcludedFromDiscounts: false,
    topNotes: 'Bergamot, Orange, Mandarin',
    heartNotes: 'Oolong Tea, Nutmeg, Jasmine',
    baseNotes: 'Musk, Fig, Amber'
  },
  {
    _id: 'ST-MYSLF',
    name: 'YSL MYSLF',
    internalFormulaKey: 'ST-MYSLF',
    description: 'A clean fragrance blending orange blossom and wood accords.',
    imageUrls: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 90,
    isExcludedFromDiscounts: false,
    topNotes: 'Calabrian Bergamot, Fresh Accord',
    heartNotes: 'Tunisian Orange Blossom, Absolute',
    baseNotes: 'Ambrofix, Patchouli, Wood'
  },
  {
    _id: 'ST-YSL-Y',
    name: 'YSL Y',
    internalFormulaKey: 'ST-YSL-Y',
    description: 'A fragrance with notes of sage, geranium, and wood.',
    imageUrls: ['/images/ysl_y.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 80,
    isExcludedFromDiscounts: false,
    topNotes: 'Apple, Ginger, Bergamot',
    heartNotes: 'Sage, Juniper Berries, Geranium',
    baseNotes: 'Amberwood, Tonka Bean, Cedar'
  },
  {
    _id: 'ST-212VIP',
    name: '212 VIP MAN',
    internalFormulaKey: 'ST-212VIP',
    description: 'Features caviar lime, frozen mint, and black pepper.',
    imageUrls: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 70,
    isExcludedFromDiscounts: false,
    topNotes: 'Lime Caviar, Frozen Mint, Black Pepper',
    heartNotes: 'Vodka, Ginger, Apple',
    baseNotes: 'Kingwood, Amber, Leather'
  },
  {
    _id: 'ST-LEMALE-ELIX',
    name: 'LA MALE ELIXIR JEAN PAUL',
    internalFormulaKey: 'ST-LEMALE-ELIX',
    description: 'A fragrance featuring lavender, benzoin, and honey.',
    imageUrls: ['/images/le_male_elixir.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Lavender, Mint, Bergamot',
    heartNotes: 'Vanilla, Benzoin, Honey',
    baseNotes: 'Tonka Bean, Tobacco, Sandalwood'
  },
  {
    _id: 'ST-DUNHILL',
    name: 'DUNHIL ICON',
    internalFormulaKey: 'ST-DUNHILL',
    description: 'A fragrance featuring bergamot, black pepper, and vetiver.',
    imageUrls: ['https://images.unsplash.com/photo-1528740561666-bd247e66ad50?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 65,
    isExcludedFromDiscounts: false,
    topNotes: 'Neroli, Bergamot, Black Pepper',
    heartNotes: 'Lavender, Cardamom, Sage',
    baseNotes: 'Vetiver, Leather, Oakmoss'
  },
  {
    _id: 'ST-SWY',
    name: 'STRONGER WITH YOU',
    internalFormulaKey: 'ST-SWY',
    description: 'A fragrance with pepper, chestnut, and vanilla accords.',
    imageUrls: ['https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 75,
    isExcludedFromDiscounts: false,
    topNotes: 'Cardamom, Pink Pepper, Violet Leaf',
    heartNotes: 'Sage, Melon, Pineapple',
    baseNotes: 'Chestnut, Vanilla, Amberwood'
  },
  {
    _id: 'ST-LV-PACIFIC',
    name: 'LV PACIFIC CHILL',
    internalFormulaKey: 'ST-LV-PACIFIC',
    description: 'An aquatic fragrance blending blackcurrant and carrot seed.',
    imageUrls: ['https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 130,
    isExcludedFromDiscounts: false,
    topNotes: 'Blackcurrant, Orange, Lime',
    heartNotes: 'Coriander, Basil, Carrot Seed',
    baseNotes: 'Dates, Fig, Ambrette'
  },
  {
    _id: 'ST-LV-IMAG',
    name: 'LV IMAGINATION',
    internalFormulaKey: 'ST-LV-IMAG',
    description: 'A fragrance featuring amber, citrus, and Chinese black tea.',
    imageUrls: ['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 140,
    isExcludedFromDiscounts: false,
    topNotes: 'Citron, Calabrian Bergamot, Sicilian Orange',
    heartNotes: 'Nigerian Ginger, Ceylon Cinnamon, Neroli',
    baseNotes: 'Chinese Black Tea, Ambroxan, Guaiac Wood'
  },
  {
    _id: 'ST-GOODGIRL',
    name: 'GOOD GIRL',
    internalFormulaKey: 'ST-GOODGIRL',
    description: 'Features almond, jasmine sambac, and roasted cocoa.',
    imageUrls: ['/images/good_girl.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Almond, Coffee, Bergamot',
    heartNotes: 'Jasmine Sambac, Tuberose, Orris',
    baseNotes: 'Tonka Bean, Cocoa, Sandalwood'
  }
];
