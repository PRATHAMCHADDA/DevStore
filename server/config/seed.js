import { Product, Category, Brand } from '../models/index.js';

const initialCategories = [
  { name: 'Computers', slug: 'computers', description: 'Laptops, desktops, and computing powerhouses', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400' },
  { name: 'Audio', slug: 'audio', description: 'Premium headphones, earbuds, and home soundbooks', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Smart Phones', slug: 'smartphones', description: 'Next generation cellular communication and devices', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400' },
  { name: 'Wearables', slug: 'wearables', description: 'Smartwatches, fitness bands, and tracking devices', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
  { name: 'Gaming', slug: 'gaming', description: 'Consoles, gaming cards, controllers, and rigs', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400' }
];

const initialBrands = [
  { name: 'Apple', slug: 'apple', description: 'Designed in California' },
  { name: 'Sony', slug: 'sony', description: 'High definition audio and gaming' },
  { name: 'Samsung', slug: 'samsung', description: 'Excellence in displays and tech' },
  { name: 'Asus', slug: 'asus', description: 'Gaming hardware and high-performance notebooks' },
  { name: 'Bose', slug: 'bose', description: 'Sound reproduction expertise' },
  { name: 'Dell', slug: 'dell', description: 'Reliable business and consumer computing' },
  { name: 'LG', slug: 'lg', description: 'Life is Good — displays and electronics' },
  { name: 'Microsoft', slug: 'microsoft', description: 'Productivity and gaming innovation' },
  { name: 'Razer', slug: 'razer', description: 'For gamers, by gamers' },
  { name: 'Google', slug: 'google', description: 'Pure Android experience and AI-first devices' }
];

const initialProducts = [
  {
    name: 'Apple MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'The ultimate laptop for developers, creators, and power users. Featuring the groundbreaking 16-core M3 Max chip, a gorgeous 16.2" Liquid Retina XDR display, 48GB of unified memory, and a massive 1TB SSD. Experience up to 22 hours of battery life and studio-quality microphone arrays.',
    price: 3499.00,
    discountedPrice: 3299.00,
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Computers',
    brand: 'Apple',
    stock: 14,
    ratings: 4.9,
    reviewsCount: 18,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    description: 'Industry-leading noise canceling wireless overhead headphones with two processors controlling 8 microphones, Auto NC Optimizer, and hands-free calling. Features spectacular sound quality and up to 30 hours of continuous wireless playback on a single charge.',
    price: 398.00,
    discountedPrice: 348.00,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Audio',
    brand: 'Sony',
    stock: 45,
    ratings: 4.8,
    reviewsCount: 32,
    isFeatured: true,
    isTrending: false,
    isTodayDeal: true
  },
  {
    name: 'iPhone 15 Pro Max 256GB - Titanium',
    slug: 'iphone-15-pro-max-titanium',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever. With a solid 6.7" Super Retina XDR display carrying 120Hz ProMotion and dynamic island graphics.',
    price: 1199.00,
    discountedPrice: 1149.00,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Smart Phones',
    brand: 'Apple',
    stock: 22,
    ratings: 4.7,
    reviewsCount: 54,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Asus ROG Zephyrus G14 Gaming Laptop',
    slug: 'asus-rog-zephyrus-g14-gaming',
    description: 'Dynamic performance in an ultraportable 14" package. Packing the AMD Ryzen 9 processor and NVIDIA GeForce RTX 4070, a gorgeous 120Hz OLED Nebula display, and custom ROG intelligent cooling configurations.',
    price: 1899.00,
    discountedPrice: 1699.00,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Computers',
    brand: 'Asus',
    stock: 9,
    ratings: 4.6,
    reviewsCount: 15,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Bose QuietComfort Ultra Wireless Earbuds',
    slug: 'bose-quietcomfort-ultra-earbuds',
    description: 'Exceptional noise cancellation engineered with immersive audio features. CustomTune technology shapes the ANC configuration precisely to your ears, ensuring deep resonant music reproduction.',
    price: 299.00,
    discountedPrice: 249.00,
    images: [
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Audio',
    brand: 'Bose',
    stock: 30,
    ratings: 4.5,
    reviewsCount: 22,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: true
  },
  {
    name: 'Apple Watch Ultra 2 - Titanium Loop',
    slug: 'apple-watch-ultra-2-titanium',
    description: 'The ultimate sports smartwatch designed for tracking endurance. Featuring a massive bright 3,000-nits Always-On Retina display, dual frequency GPS, customizable tactile Action Button, and cellular support.',
    price: 799.00,
    discountedPrice: 779.00,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Wearables',
    brand: 'Apple',
    stock: 18,
    ratings: 4.8,
    reviewsCount: 11,
    isFeatured: false,
    isTrending: false,
    isTodayDeal: false
  },
  {
    name: 'Sony PlayStation 5 Slim Console Digital Edition',
    slug: 'sony-playstation-5-digital',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.',
    price: 449.00,
    discountedPrice: 449.00,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Gaming',
    brand: 'Sony',
    stock: 50,
    ratings: 4.9,
    reviewsCount: 88,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  }
];

const moreProducts = [
  // ─── Computers ───────────────────────────────────────────────
  {
    name: 'Dell XPS 15 OLED - Core i9 13900H',
    slug: 'dell-xps-15-oled-i9',
    description: 'Dell\'s flagship 15" creator laptop featuring a stunning 3.5K OLED HDR display, Intel Core i9-13900H, NVIDIA GeForce RTX 4070, 32GB DDR5 RAM, and a 1TB NVMe SSD. An absolute powerhouse for video editing, 3D rendering, and demanding workloads — all wrapped in a sleek CNC-machined aluminium chassis.',
    price: 2499.00,
    discountedPrice: 2199.00,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Computers',
    brand: 'Dell',
    stock: 12,
    ratings: 4.7,
    reviewsCount: 29,
    isFeatured: true,
    isTrending: false,
    isTodayDeal: true
  },
  {
    name: 'Microsoft Surface Laptop Studio 2',
    slug: 'microsoft-surface-laptop-studio-2',
    description: 'The most powerful Surface ever. The Surface Laptop Studio 2 features Intel Core i7-13700H, NVIDIA GeForce RTX 4060, a unique pull-forward 14.4" touchscreen that transforms into a versatile studio canvas. Perfect for designers, artists, and creative professionals who demand flexibility.',
    price: 2399.00,
    discountedPrice: 2249.00,
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Computers',
    brand: 'Microsoft',
    stock: 8,
    ratings: 4.6,
    reviewsCount: 17,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Samsung Galaxy Book4 Ultra 16"',
    slug: 'samsung-galaxy-book4-ultra-16',
    description: 'Samsung\'s premium 16" laptop designed for entertainment and productivity. Powered by Intel Core Ultra 9, up to NVIDIA GeForce RTX 4070, and an immersive 3K Dynamic AMOLED 2X 120Hz display that delivers vivid, true-to-life colors. Seamlessly integrates with your Galaxy devices via Multi Control.',
    price: 2199.00,
    discountedPrice: 1999.00,
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Computers',
    brand: 'Samsung',
    stock: 15,
    ratings: 4.5,
    reviewsCount: 21,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: false
  },

  // ─── Smart Phones ─────────────────────────────────────────────
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    description: 'The pinnacle of Samsung\'s smartphone lineup. The Galaxy S24 Ultra includes an integrated S Pen, a 200MP quad-camera system with 100x Space Zoom, Snapdragon 8 Gen 3 processor, a 6.8" QHD+ Dynamic AMOLED display with 120Hz, and 5000mAh battery with 45W fast charging.',
    price: 1299.00,
    discountedPrice: 1199.00,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Smart Phones',
    brand: 'Samsung',
    stock: 35,
    ratings: 4.8,
    reviewsCount: 67,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Google Pixel 9 Pro XL 256GB',
    slug: 'google-pixel-9-pro-xl-256gb',
    description: 'Powered by Google Tensor G4, the Pixel 9 Pro XL redefines AI-first photography. A triple camera system with 50MP main, 5x optical zoom, 6.8" LTPO Super Actua display, and exclusive Google AI features including Magic Eraser, Photo Unblur, and Best Take for the perfect shot every time.',
    price: 1099.00,
    discountedPrice: 999.00,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Smart Phones',
    brand: 'Google',
    stock: 28,
    ratings: 4.7,
    reviewsCount: 41,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: true
  },
  {
    name: 'Samsung Galaxy Z Fold 6 512GB',
    slug: 'samsung-galaxy-z-fold-6-512gb',
    description: 'The ultimate foldable flagship. Unfold a stunning 7.6" AMOLED display for an immersive tablet-like experience, then fold it into a sleek 6.3" cover screen smartphone. Galaxy AI productivity tools, Snapdragon 8 Gen 3, and a titanium frame make the Z Fold 6 a device unlike anything else.',
    price: 1899.00,
    discountedPrice: 1799.00,
    images: [
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Smart Phones',
    brand: 'Samsung',
    stock: 20,
    ratings: 4.6,
    reviewsCount: 33,
    isFeatured: true,
    isTrending: false,
    isTodayDeal: false
  },

  // ─── Audio ────────────────────────────────────────────────────
  {
    name: 'Sony WF-1000XM5 True Wireless Earbuds',
    slug: 'sony-wf-1000xm5-earbuds',
    description: 'Sony\'s most advanced true wireless earbuds with industry-leading noise cancellation. Featuring the V2 and HD Noise Canceling Processor QN2e chipset duo, exceptional 8.4mm drivers for full-range audio, multipoint Bluetooth connection, and up to 36 hours total battery life with the compact charging case.',
    price: 299.00,
    discountedPrice: 259.00,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Audio',
    brand: 'Sony',
    stock: 60,
    ratings: 4.8,
    reviewsCount: 74,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'LG TONE Free T90S Earbuds with UVnano',
    slug: 'lg-tone-free-t90s-earbuds',
    description: 'Premium true wireless earbuds featuring Meridian-tuned audio, Active Noise Cancellation, and the unique UVnano charging case that uses UV-C LED light to sanitize each earbud while charging. Dolby Head Tracking provides a theater-like spatial audio experience wherever you go.',
    price: 199.00,
    discountedPrice: 169.00,
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Audio',
    brand: 'LG',
    stock: 40,
    ratings: 4.4,
    reviewsCount: 26,
    isFeatured: false,
    isTrending: false,
    isTodayDeal: true
  },

  // ─── Wearables ────────────────────────────────────────────────
  {
    name: 'Samsung Galaxy Watch 7 Classic 47mm',
    slug: 'samsung-galaxy-watch-7-classic-47mm',
    description: 'The iconic rotating bezel returns on the Galaxy Watch 7 Classic. Packed with advanced health sensors including BioActive Sensor for body composition, ECG, blood pressure monitoring, and sleep coaching powered by Google\'s Wear OS. A sapphire crystal glass display and 47mm stainless steel case ensure lasting durability.',
    price: 499.00,
    discountedPrice: 449.00,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Wearables',
    brand: 'Samsung',
    stock: 25,
    ratings: 4.6,
    reviewsCount: 38,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Google Pixel Watch 3 45mm LTE',
    slug: 'google-pixel-watch-3-45mm-lte',
    description: 'The Pixel Watch 3 is Google\'s most capable smartwatch yet. With a large 45mm always-on AMOLED display, Fitbit-powered health tracking, emergency SOS, Loss of Pulse Detection, and seamless Google ecosystem integration. Built with recycled aluminium and a Gorilla Glass 5 lens for premium durability.',
    price: 449.00,
    discountedPrice: 399.00,
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Wearables',
    brand: 'Google',
    stock: 18,
    ratings: 4.5,
    reviewsCount: 19,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: false
  },

  // ─── Gaming ───────────────────────────────────────────────────
  {
    name: 'Razer BlackShark V2 Pro Wireless Headset',
    slug: 'razer-blackshark-v2-pro-wireless',
    description: 'Esports-grade wireless audio engineered with THX Spatial Audio for 360° directional precision. Features Razer\'s TriForce Titanium 50mm drivers tuned to separate highs, mids, and lows, HyperClear Super Wideband Mic for crystal clear voice chat, and up to 70 hours of battery life.',
    price: 199.00,
    discountedPrice: 169.00,
    images: [
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Gaming',
    brand: 'Razer',
    stock: 42,
    ratings: 4.7,
    reviewsCount: 55,
    isFeatured: false,
    isTrending: true,
    isTodayDeal: true
  },
  {
    name: 'Asus ROG Ally X Gaming Handheld',
    slug: 'asus-rog-ally-x-gaming-handheld',
    description: 'The ultimate Windows 11 gaming handheld with AMD Ryzen Z1 Extreme processor, a buttery-smooth 120Hz 7" FHD display, 24GB LPDDR5X RAM, 1TB SSD, and an upgraded 80Wh battery for all-day gaming sessions. Play your entire PC gaming library — Steam, Xbox Game Pass, Epic — on the go.',
    price: 899.00,
    discountedPrice: 799.00,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Gaming',
    brand: 'Asus',
    stock: 16,
    ratings: 4.8,
    reviewsCount: 43,
    isFeatured: true,
    isTrending: true,
    isTodayDeal: false
  },
  {
    name: 'Microsoft Xbox Series X 1TB Console',
    slug: 'microsoft-xbox-series-x-1tb',
    description: 'The most powerful Xbox ever. Delivering true 4K gaming at up to 120 FPS with ray-tracing, powered by a 12 teraflop GPU and custom NVMe SSD for near-instant load times. Xbox Game Pass Ultimate gives you access to hundreds of games on day one, including all first-party titles from Microsoft Studios.',
    price: 499.00,
    discountedPrice: 479.00,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Gaming',
    brand: 'Microsoft',
    stock: 55,
    ratings: 4.9,
    reviewsCount: 102,
    isFeatured: true,
    isTrending: false,
    isTodayDeal: false
  }
];

export const seedDatabase = async () => {
  try {
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      console.log('Seeding initial categories...');
      await Category.insertMany(initialCategories);
    }

    const brandsCount = await Brand.countDocuments();
    if (brandsCount === 0) {
      console.log('Seeding initial brands...');
      await Brand.insertMany(initialBrands);
    }

    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.log('Seeding initial products...');
      await Product.insertMany(initialProducts);
      console.log('✅ Base models database seeded successfully!');
    }

    // Seed additional products if they don't already exist
    for (const product of moreProducts) {
      const exists = await Product.findOne({ slug: product.slug });
      if (!exists) {
        await Product.insertMany([product]);
        console.log(`✅ Added new product: ${product.name}`);
      }
    }

    // Seed additional brands if they don't already exist
    const extraBrandNames = ['Dell', 'LG', 'Microsoft', 'Razer', 'Google'];
    for (const brand of initialBrands.filter(b => extraBrandNames.includes(b.name))) {
      const exists = await Brand.findOne({ slug: brand.slug });
      if (!exists) {
        await Brand.insertMany([brand]);
        console.log(`✅ Added new brand: ${brand.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};
