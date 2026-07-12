import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Perfume from './models/Perfume';
import User from './models/User';
import SystemConfig from './models/SystemConfig';
import Coupon from './models/Coupon';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alweenfragrance';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB to start seeding...');

    // 1. Clean existing collections
    await Perfume.deleteMany({});
    await User.deleteMany({});
    await SystemConfig.deleteMany({});

    console.log('Cleaned existing collections.');

    // 2. Create Global configs
    const config = new SystemConfig({
      freeDeliveryThreshold: 3000, // 3000 BDT
      shippingFee: 100, // 100 BDT
      isFreeDeliveryEnabled: true,
      pointsToDiscountRate: 10 // 10 points = 1 BDT
    });
    await config.save();
    console.log('Global settings seeded.');

    // 3. Seed the 14 static perfumes for the Hero section carousel
    // These start with 'ST-' formula keys so they are bypassed in the admin UI view.
    const staticPerfumes = [
      {
        name: 'THE MOST WANTED',
        internalFormulaKey: 'ST-WANTED',
        description: 'A fiery, addictive fragrance blending sweet cardamom, warm toffee, and rich amberwood. Algorithmic extraction profile.',
        imageUrls: ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'],
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
        name: 'CREED AVENTUS',
        internalFormulaKey: 'ST-AVENTUS',
        description: 'The legendary fragrance celebrating strength, power, and success. Formulated with blackcurrant, Italian bergamot, and birch.',
        imageUrls: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 8000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 120,
        isExcludedFromDiscounts: false,
        topNotes: 'Pineapple, Bergamot, Blackcurrant',
        heartNotes: 'Birch, Jasmine, Patchouli',
        baseNotes: 'Oakmoss, Ambergris, Vanilla'
      },
      {
        name: 'ACQUA DI GIO PROFUMO',
        internalFormulaKey: 'ST-ADG-PROF',
        description: 'An elegant, deep, and airy fragrance merging marine accords, sweet bergamot, and dark incense. Clean tech extraction.',
        imageUrls: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 12000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 75,
        isExcludedFromDiscounts: false,
        topNotes: 'Marine Notes, Bergamot, Grapefruit',
        heartNotes: 'Rosemary, Sage, Geranium',
        baseNotes: 'Incense, Patchouli, Vetiver'
      },
      {
        name: 'BACCARAT ROUGE 540',
        internalFormulaKey: 'ST-BR540',
        description: 'A luminous and sophisticated fragrance laying on the skin like an amber, floral, and woody breeze. High-end synthetic key.',
        imageUrls: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 7000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 150,
        isExcludedFromDiscounts: false,
        topNotes: 'Saffron, Jasmine, Tagetes',
        heartNotes: 'Amberwood, Ambergris, Hedione',
        baseNotes: 'Fir Resin, Cedar, Musk'
      },
      {
        name: 'WULONG CHA',
        internalFormulaKey: 'ST-WULONG',
        description: 'A fresh, citrusy tea fragrance carrying notes of oolong tea, Mediterranean fig, and musk.',
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
        name: 'YSL MYSLF',
        internalFormulaKey: 'ST-MYSLF',
        description: 'A modern, clean representation of modern masculinity. Blends fresh orange blossom and rich wood accords.',
        imageUrls: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 9000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 90,
        isExcludedFromDiscounts: false,
        topNotes: 'Calabrian Bergamot, Fresh Accord',
        heartNotes: 'Tunisian Orange Blossom, Absolute',
        baseNotes: 'Ambrofix, Patchouli, Wood'
      },
      {
        name: 'YSL Y',
        internalFormulaKey: 'ST-YSL-Y',
        description: 'A deep, fresh, and masculine fragrance with notes of sage, geranium, and sensual wood.',
        imageUrls: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 11000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 80,
        isExcludedFromDiscounts: false,
        topNotes: 'Apple, Ginger, Bergamot',
        heartNotes: 'Sage, Juniper Berries, Geranium',
        baseNotes: 'Amberwood, Tonka Bean, Cedar'
      },
      {
        name: '212 VIP MAN',
        internalFormulaKey: 'ST-212VIP',
        description: 'An explosive party cocktail containing caviar lime, frozen mint, and black pepper. Synthetic nightlife key.',
        imageUrls: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 9500,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 70,
        isExcludedFromDiscounts: false,
        topNotes: 'Lime Caviar, Frozen Mint, Black Pepper',
        heartNotes: 'Vodka, Ginger, Apple',
        baseNotes: 'Kingwood, Amber, Leather'
      },
      {
        name: 'LE MALE ELIXIR JEAN PAUL',
        internalFormulaKey: 'ST-LEMALE-ELIX',
        description: 'An intense, gold torso fragrance featuring lavender, warm benzoin, and sweet honey.',
        imageUrls: ['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 8000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 85,
        isExcludedFromDiscounts: false,
        topNotes: 'Lavender, Mint, Bergamot',
        heartNotes: 'Vanilla, Benzoin, Honey',
        baseNotes: 'Tonka Bean, Tobacco, Sandalwood'
      },
      {
        name: 'DUNHILL ICON',
        internalFormulaKey: 'ST-DUNHILL',
        description: 'A refined, classic British signature scent. Merges fresh bergamot, black pepper, and warm vetiver.',
        imageUrls: ['https://images.unsplash.com/photo-1528740561666-bd247e66ad50?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 12000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 65,
        isExcludedFromDiscounts: false,
        topNotes: 'Neroli, Bergamot, Black Pepper',
        heartNotes: 'Lavender, Cardamom, Sage',
        baseNotes: 'Vetiver, Leather, Oakmoss'
      },
      {
        name: 'STRONGER WITH YOU',
        internalFormulaKey: 'ST-SWY',
        description: 'A warm, magnetic fragrance carrying spicy pepper, chestnut, and vanilla accords.',
        imageUrls: ['https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 10500,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 75,
        isExcludedFromDiscounts: false,
        topNotes: 'Cardamom, Pink Pepper, Violet Leaf',
        heartNotes: 'Sage, Melon, Pineapple',
        baseNotes: 'Chestnut, Vanilla, Amberwood'
      },
      {
        name: 'LV PACIFIC CHILL',
        internalFormulaKey: 'ST-LV-PACIFIC',
        description: 'A vibrant wellness fragrance capturing the energy of the ocean. Blends blackcurrant, carrot seed, and aromatic herbs.',
        imageUrls: ['https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 7500,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 130,
        isExcludedFromDiscounts: false,
        topNotes: 'Blackcurrant, Orange, Lime',
        heartNotes: 'Coriander, Basil, Carrot Seed',
        baseNotes: 'Dates, Fig, Ambrette'
      },
      {
        name: 'LV IMAGINATION',
        internalFormulaKey: 'ST-LV-IMAG',
        description: 'An exceptional, ultra-premium concentration of amber, tea, and citrus. Sourced with black tea from China.',
        imageUrls: ['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 7000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 140,
        isExcludedFromDiscounts: false,
        topNotes: 'Citron, Calabrian Bergamot, Sicilian Orange',
        heartNotes: 'Nigerian Ginger, Ceylon Cinnamon, Neroli',
        baseNotes: 'Chinese Black Tea, Ambroxan, Guaiac Wood'
      },
      {
        name: 'GOOD GIRL',
        internalFormulaKey: 'ST-GOODGIRL',
        description: 'A bold, sensual blend of dark and light elements. Features almond, jasmine sambac, and roasted cocoa.',
        imageUrls: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600'],
        current_volume_ml: 11000,
        reorder_threshold_ml: 1000,
        loss_margin_factor: 0.03,
        pricePerMl: 85,
        isExcludedFromDiscounts: false,
        topNotes: 'Almond, Coffee, Bergamot',
        heartNotes: 'Jasmine Sambac, Tuberose, Orris',
        baseNotes: 'Tonka Bean, Cocoa, Sandalwood'
      }
    ];

    await Perfume.insertMany(staticPerfumes);
    console.log('Seeded 14 static hero perfumes.');

    // 4. Create Admin User
    const admin = new User({
      name: 'Alween Admin Manager',
      email: 'admin@alweenfragrance.com',
      phone: '01711223344',
      passwordHash: hashPassword('admin123'),
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user seeded: admin@alweenfragrance.com / admin123');

    // 5. Seed default discount coupon ALWEEN20
    await Coupon.deleteMany({});
    const coupon = new Coupon({
      code: 'ALWEEN20',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountCap: 1000,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      appliesTo: 'all',
      selectedProductIds: []
    });
    await coupon.save();
    console.log('Coupon seeded: ALWEEN20 (20% off)');

    console.log('Database configurations, Admin and Coupons seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
    process.exit(1);
  }
};

seedDatabase();
