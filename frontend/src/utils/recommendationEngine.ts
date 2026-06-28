export interface RecommendedProduct {
  name: string;
  brand: string;
  category: string;
  ingredients: string;
  whyRecommended: string;
  howToUse: string;
  timeOfDay: 'Morning' | 'Night' | 'Both';
}

export const productDatabase: RecommendedProduct[] = [
  // Cleansers
  {
    name: "Oat Cleanser 6%",
    brand: "Minimalist",
    category: "Cleanser",
    ingredients: "6% Oat Extract, Hyaluronic Acid, CoQ10",
    whyRecommended: "Calms, nourishes, and hydrates sensitive or dry skin while removing light dirt and debris.",
    howToUse: "Apply to wet face, massage gently in circular motions, and rinse with lukewarm water.",
    timeOfDay: "Both"
  },
  {
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    ingredients: "Essential Ceramides, Hyaluronic Acid, Glycerin",
    whyRecommended: "Restores compromised skin barrier and provides non-stripping moisture for dry skin.",
    howToUse: "Massage onto wet skin, lather gently, and rinse.",
    timeOfDay: "Both"
  },
  {
    name: "Salicylic Acid 2% LHA Cleanser",
    brand: "Minimalist",
    category: "Cleanser",
    ingredients: "2% Salicylic Acid, LHA, Zinc PCA",
    whyRecommended: "Unclogs sebum-heavy pores and regulates shine. Excellent for oily or acne-prone skin.",
    howToUse: "Lather onto wet skin, massage for 30 seconds to let actives work, and rinse.",
    timeOfDay: "Both"
  },
  {
    name: "2% Salicylic Acid Face Wash",
    brand: "The Derma Co.",
    category: "Cleanser",
    ingredients: "Salicylic Acid, Willow Bark, Witch Hazel",
    whyRecommended: "Clears out deep acne-causing blockages and reduces current breakout inflammation.",
    howToUse: "Splash face with water, pump cleanser, massage gently, and rinse.",
    timeOfDay: "Both"
  },
  {
    name: "Sensibio Gel Moussant",
    brand: "Bioderma",
    category: "Cleanser",
    ingredients: "Coco Glucoside, Glyceryl Oleate, DAF Formula",
    whyRecommended: "Soothing foaming gel that calms redness, irritation, and inflammation in sensitive skin.",
    howToUse: "Apply on wet face, lather, and rinse gently.",
    timeOfDay: "Both"
  },
  {
    name: "Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Cleanser",
    ingredients: "Niacinamide, Panthenol, Hydrating Glycerin",
    whyRecommended: "Non-irritating, soap-free formula that preserves skin's natural protective barrier.",
    howToUse: "Apply and massage. Can be rinsed with water, or wiped off with a cotton pad.",
    timeOfDay: "Both"
  },
  // Serums
  {
    name: "Hyaluronic Acid 2% + B5",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "2% Hyaluronic Acid, Vitamin B5 (Panthenol)",
    whyRecommended: "Provides multi-depth hydration to relieve dry, dehydrated, or tight skin.",
    howToUse: "Apply 2-3 drops to damp face in the morning after cleansing.",
    timeOfDay: "Morning"
  },
  {
    name: "Niacinamide 10%",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "10% Niacinamide, 1% Zinc PCA",
    whyRecommended: "Reduces oiliness, tightens enlarged pores, and strengthens skin barrier.",
    howToUse: "Pat onto clean face before applying heavier creams.",
    timeOfDay: "Both"
  },
  {
    name: "Vitamin C 16%",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "16% Ethyl Ascorbic Acid, Ferulic Acid",
    whyRecommended: "Brightens dull skin, fades dark spots, and shields skin from sun damage.",
    howToUse: "Apply 2-3 drops in the morning before moisturizer and sunscreen.",
    timeOfDay: "Morning"
  },
  {
    name: "Alpha Arbutin 2%",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "2% Alpha Arbutin, Hyaluronic Acid",
    whyRecommended: "Reduces melanin synthesis to treat hyperpigmentation and uneven skin tone.",
    howToUse: "Apply to clean skin after toner and before moisturizer.",
    timeOfDay: "Both"
  },
  {
    name: "Trubiom Pigmentation Serum",
    brand: "Conscious Chemist",
    category: "Serum",
    ingredients: "Niacinamide, Kojic Acid, Tranexamic Acid",
    whyRecommended: "Clinically target-fades stubborn pigmentation, dark spots, and tanning.",
    howToUse: "Pat gently onto clean skin in the evening.",
    timeOfDay: "Night"
  },
  {
    name: "Brightening Serum",
    brand: "Deconstruct",
    category: "Serum",
    ingredients: "10% Niacinamide, 2% Tyrostat",
    whyRecommended: "Exhibits strong synergistic action to lighten dark patches and dullness.",
    howToUse: "Apply 2-3 drops morning or night.",
    timeOfDay: "Both"
  },
  {
    name: "Caffeine Eye Serum 8%",
    brand: "Minimalist",
    category: "Eye Care",
    ingredients: "8% Caffeine, EGCG, Hyaluronic Acid",
    whyRecommended: "Improves microcirculation under eyes to reduce dark circles and puffiness.",
    howToUse: "Massage 1-2 drops gently around the eye contours before bed.",
    timeOfDay: "Night"
  },
  {
    name: "Under Eye Cream",
    brand: "The Derma Co.",
    category: "Eye Care",
    ingredients: "Caffeine, Retinol, Multi-Peptides",
    whyRecommended: "Brightens under-eye pigmentation and smooths out fine lines.",
    howToUse: "Tap gently around the orbital bone with ring finger.",
    timeOfDay: "Night"
  },
  // Moisturizers
  {
    name: "Ceramide 0.3% + Madecassoside",
    brand: "Minimalist",
    category: "Moisturizer",
    ingredients: "Ceramides (AP, EOP, NP), Madecassoside",
    whyRecommended: "Provides barrier defense and deep skin soothing for dry or sensitive skin.",
    howToUse: "Smooth over face and neck after applying active serums.",
    timeOfDay: "Both"
  },
  {
    name: "Moisturizing Cream",
    brand: "Cetaphil",
    category: "Moisturizer",
    ingredients: "Sweet Almond Oil, Vitamin E, Glycerin",
    whyRecommended: "Rich moisturizing cream that locks in water to repair extreme dryness.",
    howToUse: "Apply as final step in your night routine.",
    timeOfDay: "Night"
  },
  {
    name: "Moisturizing Cream",
    brand: "CeraVe",
    category: "Moisturizer",
    ingredients: "Ceramides (1, 3, 6-II), Hyaluronic Acid",
    whyRecommended: "Deeply hydrates dry, flaky skin and restores natural lipid barrier.",
    howToUse: "Smooth generously over face and dry patches.",
    timeOfDay: "Both"
  },
  {
    name: "Barrier Repair Moisturizer",
    brand: "Dot & Key",
    category: "Moisturizer",
    ingredients: "5 Essential Ceramides, Probiotics",
    whyRecommended: "Nourishing barrier cream that soothes redness, tighteness, and flakiness.",
    howToUse: "Massage onto face after serums.",
    timeOfDay: "Both"
  },
  {
    name: "Green Tea Oil-Free Moisturizer",
    brand: "Plum",
    category: "Moisturizer",
    ingredients: "Green Tea Extract, Niacinamide, Squalane",
    whyRecommended: "Lightweight, non-comedogenic hydration that keeps oily skin matte and clear.",
    howToUse: "Massage onto face evenly.",
    timeOfDay: "Both"
  },
  {
    name: "Oil-Free Cica Gel Moisturizer",
    brand: "Dot & Key",
    category: "Moisturizer",
    ingredients: "Cica (Centella), Tea Tree, Niacinamide",
    whyRecommended: "Soothing gel moisturizer that hydrates oily or acne-prone skin without clogging.",
    howToUse: "Apply daily as final step of routine.",
    timeOfDay: "Both"
  },
  {
    name: "PM Facial Moisturizing Lotion",
    brand: "CeraVe",
    category: "Moisturizer",
    ingredients: "3 Essential Ceramides, Niacinamide, Hyaluronic Acid",
    whyRecommended: "Ultralight night lotion that moisturizes and calms irritated, acne-prone skin.",
    howToUse: "Apply before bed.",
    timeOfDay: "Night"
  },
  // Sunscreens
  {
    name: "Matte Sunscreen SPF 50",
    brand: "Foxtale",
    category: "Sunscreen",
    ingredients: "Niacinamide, Hybrid UV Filters",
    whyRecommended: "High sun protection with an ultra-matte, oil-controlling finish.",
    howToUse: "Apply in the morning as final step.",
    timeOfDay: "Morning"
  },
  {
    name: "Lightweight Daily Sunscreen SPF 50",
    brand: "Conscious Chemist",
    category: "Sunscreen",
    ingredients: "Hyaluronic Acid, UV Protectants",
    whyRecommended: "Dewy, zero-white-cast sun shield for dry or normal skin.",
    howToUse: "Apply in the morning and reapply every 3 hours if outdoors.",
    timeOfDay: "Morning"
  },
  // Lip Care
  {
    name: "L-Ascorbic Acid Lip Balm SPF 30",
    brand: "Minimalist",
    category: "Lip Care",
    ingredients: "Vitamin C (L-Ascorbic Acid), Ceramides, UV Filters",
    whyRecommended: "Brightens dark, pigmented lips and shields from UV damage.",
    howToUse: "Swipe on lips during the day.",
    timeOfDay: "Morning"
  },
  {
    name: "Lip Defense SPF 30",
    brand: "Sebamed",
    category: "Lip Care",
    ingredients: "Vitamin E, Jojoba Oil",
    whyRecommended: "Soothes chapped, dry lips and treats lip pigmentation.",
    howToUse: "Apply throughout the day as needed.",
    timeOfDay: "Morning"
  },
  {
    name: "Lip Sleeping Mask",
    brand: "Laneige",
    category: "Lip Care",
    ingredients: "Berry Mix Complex, Vitamin C, Antioxidants",
    whyRecommended: "Dissolves dead skin cells on lips overnight, restoring soft pink lips.",
    howToUse: "Apply a generous layer on lips before bed.",
    timeOfDay: "Night"
  }
];

export interface SkinReportInput {
  skinType: string;
  acne: string;
  pigmentation: string;
  darkCircles: string;
  dryness: string;
  oiliness: string;
  isSensitive: string;
  mainConcern: string;
  mainGoal: string;
}

export const generateSkinRecommendations = (input: SkinReportInput) => {
  const { skinType, acne, pigmentation, darkCircles, dryness, oiliness, isSensitive, mainConcern, mainGoal } = input;
  
  // 1. Calculate Skin Score
  let score = 100;
  if (acne === 'Mild') score -= 5;
  if (acne === 'Moderate') score -= 12;
  if (acne === 'Severe') score -= 20;

  if (pigmentation === 'Mild') score -= 5;
  if (pigmentation === 'Moderate') score -= 10;
  if (pigmentation === 'Severe') score -= 18;

  if (darkCircles === 'Mild') score -= 4;
  if (darkCircles === 'Moderate') score -= 8;
  if (darkCircles === 'Severe') score -= 15;

  if (dryness === 'Mild') score -= 4;
  if (dryness === 'Moderate') score -= 8;
  if (dryness === 'Severe') score -= 15;

  if (oiliness === 'Mild') score -= 4;
  if (oiliness === 'Moderate') score -= 8;
  if (oiliness === 'Severe') score -= 15;

  if (isSensitive === 'Yes') score -= 12;

  score = Math.max(35, Math.min(100, score));

  // 2. Formulate routines
  const morningRoutine = ['Gentle Hydrating Cleanser'];
  const nightRoutine = ['Double Cleansing Oil/Gel'];

  // Type specific step selections
  if (skinType.toLowerCase() === 'oily' || oiliness === 'Severe' || oiliness === 'Moderate') {
    morningRoutine[0] = 'Salicylic Acid Foaming Cleanser';
    morningRoutine.push('Niacinamide Pore Serum');
    morningRoutine.push('Lightweight Gel Moisturizer');
  } else if (skinType.toLowerCase() === 'dry' || dryness === 'Severe' || dryness === 'Moderate') {
    morningRoutine[0] = 'Creamy Ceramide Cleanser';
    morningRoutine.push('Hyaluronic Acid Boosting Serum');
    morningRoutine.push('Rich Barrier Repair Cream');
  } else {
    morningRoutine.push('Daily Balancing Hydration Serum');
    morningRoutine.push('Barrier Defense Moisturizer');
  }

  // Concern specific step additions
  if (acne === 'Moderate' || acne === 'Severe' || mainConcern === 'acne') {
    nightRoutine.push('Salicylic Acid Acne Spot Gel');
    nightRoutine.push('Soothing Cica Gel Moisturizer');
  } else if (pigmentation === 'Moderate' || pigmentation === 'Severe' || mainConcern === 'pigmentation' || mainConcern === 'tanning') {
    morningRoutine.push('Vitamin C Brightening Serum');
    nightRoutine.push('Tranexamic Acid / Glycolic Exfoliator');
  } else if (mainConcern === 'fine_lines') {
    nightRoutine.push('Gentle Retinol Night Serum');
    nightRoutine.push('Peptide Repair Sleeping Mask');
  }

  // Always Sunscreen morning, Moisturizer night
  morningRoutine.push('Broad Spectrum Sunscreen SPF 50+');
  nightRoutine.push('Hydrating Night Cream');

  // 3. Recommended Products matching
  const recommendedProducts: RecommendedProduct[] = [];

  // Match Cleansers
  if (skinType.toLowerCase() === 'oily' || acne !== 'None') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Salicylic") && p.brand === "Minimalist")!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Salicylic") && p.brand === "The Derma Co.")!);
  } else if (skinType.toLowerCase() === 'dry') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Oat"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Hydrating Facial Cleanser"))!);
  } else if (isSensitive === 'Yes') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Sensibio"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Gentle Skin Cleanser"))!);
  } else {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Gentle Skin Cleanser"))!);
  }

  // Match Serums
  if (skinType.toLowerCase() === 'dry' || dryness !== 'None') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Hyaluronic Acid"))!);
  }
  if (skinType.toLowerCase() === 'oily' || oiliness !== 'None' || mainConcern === 'large_pores') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Niacinamide 10%"))!);
  }
  if (pigmentation !== 'None' || mainConcern === 'pigmentation' || mainConcern === 'tanning') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Vitamin C 16%"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Alpha Arbutin 2%"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Trubiom"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Brightening Serum"))!);
  }

  // Match moisturizers & sunscreens
  if (skinType.toLowerCase() === 'dry') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Ceramide 0.3%"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Moisturizing Cream") && p.brand === "Cetaphil")!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Barrier Repair Moisturizer"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Lightweight Daily Sunscreen"))!);
  } else if (skinType.toLowerCase() === 'oily' || acne !== 'None') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Green Tea"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Cica Gel"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("PM Facial Moisturizing Lotion"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Matte Sunscreen"))!);
  } else {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("CeraVe") && p.name.includes("Moisturizing Cream"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Matte Sunscreen"))!);
  }

  // Match Lip care
  if (mainConcern === 'lip_pigmentation') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("L-Ascorbic Acid Lip Balm"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Lip Defense"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Lip Sleeping Mask"))!);
  }

  // Match Eye care
  if (darkCircles !== 'None' || mainConcern === 'dark_circles') {
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Caffeine Eye Serum"))!);
    recommendedProducts.push(productDatabase.find(p => p.name.includes("Under Eye Cream"))!);
  }

  // Filter out undefined matches
  const filteredProducts = recommendedProducts.filter(Boolean);

  // 4. Generate Skincare Tips
  const tips: string[] = [];
  if (skinType.toLowerCase() === 'dry') {
    tips.push("Avoid harsh foaming cleansers.", "Moisturize twice daily.", "Wash your face with lukewarm water.");
  } else if (skinType.toLowerCase() === 'oily') {
    tips.push("Don't over-wash your face (twice a day is enough).", "Choose non-comedogenic, oil-free gel products.");
  } else {
    tips.push("Maintain a consistent skin routine morning and night.", "Keep skin hydrated by drinking 2-3L of water daily.");
  }

  if (acne !== 'None' || mainConcern === 'acne') {
    tips.push("Avoid picking or popping pimples to prevent scarring.", "Introduce active ingredients (like Salicylic Acid) gradually.");
  }
  if (pigmentation !== 'None' || mainConcern === 'pigmentation' || mainConcern === 'tanning') {
    tips.push("Apply SPF 50+ sunscreen every day, even when indoors.", "Skincare active results take several weeks of consistent use.");
  }
  if (isSensitive === 'Yes' || skinType.toLowerCase() === 'sensitive') {
    tips.push("Always patch test new products behind your ear.", "Avoid harsh physical scrubs and artificial fragrances.");
  }
  if (mainConcern === 'lip_pigmentation') {
    tips.push("Stay hydrated (drink 2-3L of water daily).", "Avoid licking or biting your lips.", "Protect lips from sun exposure with SPF balms.");
  }
  if (darkCircles !== 'None' || mainConcern === 'dark_circles') {
    tips.push("Maintain a consistent sleep cycle of 7-8 hours.", "Stay hydrated and limit salt intake at night.", "Gently apply sunscreen around the eye area.");
  }

  // 5. Generate Warnings
  const warnings: string[] = [];
  if (isSensitive === 'Yes') {
    warnings.push('Patch test all new exfoliating actives before facial application.');
  }
  if (acne === 'Severe') {
    warnings.push('For severe inflammatory breakouts, consulting a board-certified dermatologist is advised.');
  }

  // Return the rich, unified report structure
  return {
    skinScore: score,
    skinType: skinType.charAt(0).toUpperCase() + skinType.slice(1),
    acneLevel: acne,
    pigmentationLevel: pigmentation,
    darkCircles,
    drynessLevel: dryness,
    oilinessLevel: oiliness,
    isSensitive,
    mainConcern,
    mainGoal,
    generatedRoutine: {
      morning: Array.from(new Set(morningRoutine)),
      night: Array.from(new Set(nightRoutine))
    },
    recommendedProducts: filteredProducts,
    skincareTips: Array.from(new Set(tips)),
    healthyHabits: [
      '💧 Drink 2-3L water daily',
      '😴 Maintain consistent 8H sleep cycle',
      '☀️ Wear sunscreen daily, even indoors',
      '🧼 Wash pillowcases once a week',
      '🥗 Consume antioxidants-rich wholefoods'
    ],
    weeklyGoals: {
      morningRoutine: '0/7',
      nightRoutine: '0/7',
      drinkWater: '0/7',
      sleepHours: '0/7'
    },
    warnings,
    waterGoal: 2.0,
    sleepGoal: 8,
    progressNotes: "",
    disclaimer: "These recommendations are for educational and skincare management purposes only. They are not a medical diagnosis. Consult a dermatologist for persistent or severe skin concerns."
  };
};

export interface RoutineStepDetail extends RecommendedProduct {
  order: number;
  frequency: 'Daily' | 'Weekly';
  completed: boolean;
}

export const generateRoutineSteps = (
  skinType: string,
  acne: string,
  pigmentation: string,
  darkSpots: string,
  lipPigmentation: string,
  darkCircles: string,
  fineLines: string,
  dryness: string,
  oiliness: string,
  isSensitive: string
) => {
  const morning: RoutineStepDetail[] = [];
  const night: RoutineStepDetail[] = [];

  // Helper to find product from DB
  const getProduct = (nameQuery: string, brandQuery?: string): RecommendedProduct => {
    const prod = productDatabase.find(p => 
      p.name.toLowerCase().includes(nameQuery.toLowerCase()) && 
      (!brandQuery || p.brand.toLowerCase() === brandQuery.toLowerCase())
    );
    if (prod) return prod;
    // fallback
    return productDatabase[0];
  };

  // 1. Cleanser
  let mCleanser = getProduct("Gentle Skin Cleanser", "Cetaphil");
  let nCleanser = getProduct("Gentle Skin Cleanser", "Cetaphil");

  if (skinType.toLowerCase() === 'dry' || dryness === 'Severe' || dryness === 'Moderate') {
    mCleanser = getProduct("Oat Cleanser");
    nCleanser = getProduct("Hydrating Facial Cleanser");
  } else if (skinType.toLowerCase() === 'oily' || oiliness === 'Severe' || oiliness === 'Moderate') {
    mCleanser = getProduct("Salicylic Acid 2% LHA");
    nCleanser = getProduct("2% Salicylic Acid Face Wash", "The Derma Co.");
  } else if (skinType.toLowerCase() === 'sensitive' || isSensitive === 'Yes') {
    mCleanser = getProduct("Sensibio Gel Moussant");
    nCleanser = getProduct("Gentle Skin Cleanser");
  } else if (skinType.toLowerCase() === 'combination') {
    mCleanser = getProduct("Gentle Skin Cleanser");
    nCleanser = getProduct("Sensibio Gel Moussant");
  }

  // 2. Treatment Serum
  let mSerum = getProduct("Niacinamide 10%");
  let nSerum = getProduct("Brightening Serum", "Deconstruct");

  if (skinType.toLowerCase() === 'dry' || dryness === 'Severe' || dryness === 'Moderate') {
    mSerum = getProduct("Hyaluronic Acid");
    nSerum = getProduct("Hyaluronic Acid");
  } else if (skinType.toLowerCase() === 'oily' || oiliness === 'Severe' || oiliness === 'Moderate') {
    mSerum = getProduct("Niacinamide 10%");
    nSerum = getProduct("Niacinamide 10%");
  } else if (skinType.toLowerCase() === 'sensitive' || isSensitive === 'Yes') {
    mSerum = getProduct("Oat Cleanser"); // Use soothing cleanser base as mild serum
    nSerum = getProduct("Ceramide 0.3%");
  }

  // Concern adjustments for Serum
  if (acne === 'Yes' || acne === 'Severe' || acne === 'Moderate') {
    mSerum = getProduct("Niacinamide 10%");
    nSerum = getProduct("Niacinamide 10%");
  }
  if (pigmentation === 'Yes' || pigmentation === 'Severe' || pigmentation === 'Moderate') {
    mSerum = getProduct("Vitamin C 16%");
    nSerum = getProduct("Alpha Arbutin 2%");
  }
  if (darkSpots === 'Yes' || darkSpots === 'Severe' || darkSpots === 'Moderate') {
    mSerum = getProduct("Alpha Arbutin 2%");
    nSerum = getProduct("Brightening Serum", "Deconstruct");
  }

  // 3. Moisturizer
  let mMoisturizer = getProduct("CeraVe", "CeraVe");
  let nMoisturizer = getProduct("PM Facial Moisturizing Lotion");

  if (skinType.toLowerCase() === 'dry' || dryness === 'Severe' || dryness === 'Moderate') {
    mMoisturizer = getProduct("Barrier Repair Moisturizer", "Dot & Key");
    nMoisturizer = getProduct("Moisturizing Cream", "Cetaphil");
  } else if (skinType.toLowerCase() === 'oily' || oiliness === 'Severe' || oiliness === 'Moderate') {
    mMoisturizer = getProduct("Green Tea Oil-Free");
    nMoisturizer = getProduct("Oil-Free Cica Gel");
  } else if (skinType.toLowerCase() === 'sensitive' || isSensitive === 'Yes') {
    mMoisturizer = getProduct("Ceramide 0.3%");
    nMoisturizer = getProduct("Barrier Repair Moisturizer");
  } else if (skinType.toLowerCase() === 'combination') {
    mMoisturizer = getProduct("Green Tea Oil-Free");
    nMoisturizer = getProduct("PM Facial Moisturizing Lotion");
  }

  // 4. Sunscreen (Morning only)
  let mSunscreen = getProduct("Matte Sunscreen", "Foxtale");
  if (skinType.toLowerCase() === 'dry' || dryness === 'Severe') {
    mSunscreen = getProduct("Lightweight Daily Sunscreen", "Conscious Chemist");
  }

  // Build Morning steps list
  morning.push({ ...mCleanser, order: 1, frequency: 'Daily', completed: false });
  morning.push({ ...mSerum, order: 2, frequency: 'Daily', completed: false });
  morning.push({ ...mMoisturizer, order: 3, frequency: 'Daily', completed: false });
  morning.push({ ...mSunscreen, order: 4, frequency: 'Daily', completed: false });

  // Build Night steps list
  night.push({ ...nCleanser, order: 1, frequency: 'Daily', completed: false });
  night.push({ ...nSerum, order: 2, frequency: 'Daily', completed: false });
  night.push({ ...nMoisturizer, order: 3, frequency: 'Daily', completed: false });

  // Concern additions (Overnight / Eye / Lip treatments)
  const additions: RecommendedProduct[] = [];

  if (lipPigmentation === 'Yes') {
    morning.push({ ...getProduct("L-Ascorbic Acid Lip Balm"), order: 5, frequency: 'Daily', completed: false });
    additions.push(getProduct("Lip Sleeping Mask"));
  }
  if (darkCircles === 'Yes' || darkCircles === 'Severe' || darkCircles === 'Moderate') {
    additions.push(getProduct("Caffeine Eye Serum"));
  }
  if (acne === 'Yes' || acne === 'Severe' || acne === 'Moderate') {
    additions.push(getProduct("Under Eye Cream"));
  }
  if (fineLines === 'Yes') {
    additions.push(getProduct("Under Eye Cream"));
  }

  // Push night additions
  let nightOrder = 4;
  if (additions.length > 0) {
    const uniqueAdditions = Array.from(new Set(additions.map(a => a.name))).map(name => additions.find(a => a.name === name)!);
    uniqueAdditions.forEach(add => {
      night.push({ ...add, order: nightOrder++, frequency: 'Daily', completed: false });
    });
  } else {
    night.push({ ...getProduct("Lip Sleeping Mask"), order: 4, frequency: 'Daily', completed: false });
  }

  return { morning, night };
};
