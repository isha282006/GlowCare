import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import RecommendedProduct from '../models/RecommendedProduct';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const recommendedProducts = [
  // ═══════════════════════════════════════════════════
  // CLEANSERS
  // ═══════════════════════════════════════════════════
  {
    name: "Salicylic Acid 2% LHA Cleanser",
    brand: "Minimalist",
    category: "Cleanser",
    ingredients: "2% Salicylic Acid, LHA, Zinc PCA",
    skinTypes: ["Oily", "Combination"],
    skinConcerns: ["Acne", "Blackheads", "Whiteheads", "Large Pores"],
    timeOfDay: "Both",
    description: "A gentle exfoliating cleanser with Salicylic Acid and LHA that penetrates deep into pores to dissolve excess sebum, dead skin cells, and acne-causing impurities.",
    howToUse: "Lather onto wet skin, massage for 30 seconds to let actives work, and rinse with lukewarm water.",
    whyRecommended: "Unclogs sebum-heavy pores and regulates shine. Excellent for oily or acne-prone skin."
  },
  {
    name: "2% Salicylic Acid Face Wash",
    brand: "The Derma Co.",
    category: "Cleanser",
    ingredients: "Salicylic Acid, Willow Bark, Witch Hazel",
    skinTypes: ["Oily", "Combination"],
    skinConcerns: ["Acne", "Blackheads", "Whiteheads"],
    timeOfDay: "Both",
    description: "An anti-acne face wash formulated with Salicylic Acid, Willow Bark, and Witch Hazel to deeply cleanse and prevent breakouts.",
    howToUse: "Splash face with water, pump cleanser, massage gently, and rinse.",
    whyRecommended: "Clears out deep acne-causing blockages and reduces current breakout inflammation."
  },
  {
    name: "Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Cleanser",
    ingredients: "Niacinamide, Panthenol, Hydrating Glycerin",
    skinTypes: ["Dry", "Sensitive", "Normal", "Combination"],
    skinConcerns: ["Redness", "Dullness", "Dry Lips"],
    timeOfDay: "Both",
    description: "A soap-free, non-irritating cleanser that preserves the skin's natural protective barrier while effectively removing impurities.",
    howToUse: "Apply and massage. Can be rinsed with water, or wiped off with a cotton pad.",
    whyRecommended: "Non-irritating, soap-free formula that preserves skin's natural protective barrier."
  },
  {
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    ingredients: "Essential Ceramides, Hyaluronic Acid, Glycerin",
    skinTypes: ["Dry", "Normal", "Sensitive"],
    skinConcerns: ["Dullness", "Redness", "Fine Lines"],
    timeOfDay: "Both",
    description: "A hydrating cleanser with three essential ceramides and hyaluronic acid that restores the skin's moisture barrier without stripping.",
    howToUse: "Massage onto wet skin, lather gently, and rinse.",
    whyRecommended: "Restores compromised skin barrier and provides non-stripping moisture for dry skin."
  },
  {
    name: "Foaming Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    ingredients: "Ceramides, Niacinamide, Hyaluronic Acid",
    skinTypes: ["Oily", "Combination", "Normal"],
    skinConcerns: ["Acne", "Blackheads", "Large Pores"],
    timeOfDay: "Both",
    description: "A foaming gel cleanser with ceramides and niacinamide that effectively removes excess oil while maintaining the skin's protective barrier.",
    howToUse: "Apply to wet skin, massage gently in circular motions, and rinse thoroughly.",
    whyRecommended: "Removes excess oil and impurities without disrupting the skin's natural barrier."
  },
  {
    name: "Oat Cleanser 6%",
    brand: "Minimalist",
    category: "Cleanser",
    ingredients: "6% Oat Extract, Hyaluronic Acid, CoQ10",
    skinTypes: ["Dry", "Sensitive", "Normal"],
    skinConcerns: ["Redness", "Dullness"],
    timeOfDay: "Both",
    description: "A calming oat-based cleanser that nourishes and hydrates sensitive or dry skin while removing light dirt and debris.",
    howToUse: "Apply to wet face, massage gently in circular motions, and rinse with lukewarm water.",
    whyRecommended: "Calms, nourishes, and hydrates sensitive or dry skin while removing light dirt and debris."
  },
  {
    name: "Sensibio Gel Moussant",
    brand: "La Roche-Posay",
    category: "Cleanser",
    ingredients: "Thermal Spring Water, Niacinamide, Glycerin",
    skinTypes: ["Sensitive", "Dry", "Normal"],
    skinConcerns: ["Redness", "Dullness"],
    timeOfDay: "Both",
    description: "A soothing foaming gel that calms redness, irritation, and inflammation in sensitive skin with La Roche-Posay thermal spring water.",
    howToUse: "Apply on wet face, lather, and rinse gently.",
    whyRecommended: "Soothing foaming gel that calms redness, irritation, and inflammation in sensitive skin."
  },

  // ═══════════════════════════════════════════════════
  // SERUMS
  // ═══════════════════════════════════════════════════
  {
    name: "10% Niacinamide Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "10% Niacinamide, 1% Zinc PCA",
    skinTypes: ["Oily", "Combination", "Normal"],
    skinConcerns: ["Acne", "Large Pores", "Whiteheads", "Blackheads", "Pigmentation"],
    timeOfDay: "Both",
    description: "A potent niacinamide serum that controls excess oil, minimizes pores, and fades post-acne marks for clearer skin.",
    howToUse: "Pat onto clean face before applying heavier creams.",
    whyRecommended: "Reduces oiliness, tightens enlarged pores, and strengthens skin barrier."
  },
  {
    name: "5% Niacinamide Serum",
    brand: "The Derma Co.",
    category: "Serum",
    ingredients: "5% Niacinamide, Hyaluronic Acid",
    skinTypes: ["Oily", "Combination", "Normal", "Sensitive"],
    skinConcerns: ["Acne", "Large Pores", "Dullness"],
    timeOfDay: "Both",
    description: "A lightweight serum with 5% niacinamide to control sebum, minimize pores, and improve overall skin texture.",
    howToUse: "Apply 2-3 drops on cleansed face and pat gently.",
    whyRecommended: "Gentle yet effective concentration for oil control and pore refinement across skin types."
  },
  {
    name: "Vitamin C 16% Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "16% Ethyl Ascorbic Acid, Ferulic Acid",
    skinTypes: ["Normal", "Dry", "Combination", "Oily"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Morning",
    description: "A high-potency vitamin C serum with ferulic acid that brightens skin, fades dark spots, and provides antioxidant protection against environmental damage.",
    howToUse: "Apply 2-3 drops in the morning before moisturizer and sunscreen.",
    whyRecommended: "Brightens dull skin, fades dark spots, and shields skin from UV-induced free radical damage."
  },
  {
    name: "Vitamin C 10% Serum",
    brand: "The Derma Co.",
    category: "Serum",
    ingredients: "10% Vitamin C, Ferulic Acid, Vitamin E",
    skinTypes: ["Normal", "Combination", "Oily"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Morning",
    description: "A stabilized vitamin C serum that targets uneven skin tone, hyperpigmentation, and dullness.",
    howToUse: "Apply 3-4 drops on cleansed skin in the morning before sunscreen.",
    whyRecommended: "Targets uneven skin tone with a stable form of Vitamin C and antioxidant protection."
  },
  {
    name: "Alpha Arbutin 2% Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "2% Alpha Arbutin, Hyaluronic Acid",
    skinTypes: ["Normal", "Dry", "Combination", "Sensitive", "Oily"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Both",
    description: "A gentle skin-brightening serum that inhibits melanin synthesis to fade hyperpigmentation, age spots, and sun damage.",
    howToUse: "Apply to clean skin after toner and before moisturizer.",
    whyRecommended: "Reduces melanin synthesis to treat hyperpigmentation and uneven skin tone safely."
  },
  {
    name: "Hyaluronic Acid 2% + B5 Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "2% Hyaluronic Acid, Vitamin B5 (Panthenol)",
    skinTypes: ["Dry", "Normal", "Sensitive", "Combination"],
    skinConcerns: ["Dullness", "Fine Lines", "Redness"],
    timeOfDay: "Morning",
    description: "A multi-weight hyaluronic acid serum with vitamin B5 that provides multi-depth hydration for dry, dehydrated, or tight skin.",
    howToUse: "Apply 2-3 drops to damp face in the morning after cleansing.",
    whyRecommended: "Provides multi-depth hydration to relieve dry, dehydrated, or tight skin."
  },
  {
    name: "Retinol 0.3% Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "0.3% Retinol, Coenzyme Q10, Squalane",
    skinTypes: ["Normal", "Combination", "Oily"],
    skinConcerns: ["Fine Lines", "Wrinkles", "Dullness", "Large Pores"],
    timeOfDay: "Night",
    description: "A beginner-friendly retinol serum that boosts collagen production, smooths fine lines, and improves skin texture overnight.",
    howToUse: "Apply 2-3 drops at night on clean skin. Start 2-3 times a week and build up tolerance.",
    whyRecommended: "Stimulates collagen production and accelerates cell turnover to reduce fine lines and wrinkles."
  },
  {
    name: "0.5% Retinol Face Serum",
    brand: "The Derma Co.",
    category: "Serum",
    ingredients: "0.5% Retinol, Squalane, Vitamin E",
    skinTypes: ["Normal", "Combination"],
    skinConcerns: ["Fine Lines", "Wrinkles", "Dark Spots"],
    timeOfDay: "Night",
    description: "A mid-strength retinol serum for experienced users to target deeper wrinkles, fine lines, and age spots.",
    howToUse: "Apply at night, 2-3 times per week. Always use sunscreen the next morning.",
    whyRecommended: "Mid-strength retinol for deeper anti-aging effects and pigmentation correction."
  },
  {
    name: "Peptide Complex Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "Multi-Peptide Complex, Hyaluronic Acid",
    skinTypes: ["Normal", "Dry", "Combination", "Sensitive"],
    skinConcerns: ["Fine Lines", "Wrinkles"],
    timeOfDay: "Both",
    description: "A multi-peptide serum that signals skin to produce more collagen, improving firmness and reducing visible signs of aging.",
    howToUse: "Apply 3-4 drops to face and neck after cleansing.",
    whyRecommended: "Multi-peptide complex that signals skin cells to boost collagen production and improve firmness."
  },
  {
    name: "Tranexamic Acid 3% Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "3% Tranexamic Acid, Niacinamide, HPA",
    skinTypes: ["Normal", "Oily", "Combination", "Sensitive"],
    skinConcerns: ["Pigmentation", "Dark Spots"],
    timeOfDay: "Both",
    description: "A targeted serum that inhibits melanin transfer to fade stubborn pigmentation, melasma, and post-inflammatory marks.",
    howToUse: "Apply 2-3 drops to affected areas morning and night.",
    whyRecommended: "Targets stubborn hyperpigmentation and melasma by inhibiting melanin transfer."
  },
  {
    name: "Centella Asiatica Serum",
    brand: "Minimalist",
    category: "Serum",
    ingredients: "Centella Asiatica Extract, Madecassoside, Asiaticoside",
    skinTypes: ["Sensitive", "Dry", "Normal", "Combination"],
    skinConcerns: ["Redness", "Acne"],
    timeOfDay: "Both",
    description: "A soothing serum with centella asiatica (cica) that calms inflammation, redness, and helps heal acne scars.",
    howToUse: "Apply 2-3 drops to cleansed face, focusing on irritated areas.",
    whyRecommended: "Calms inflammation, reduces redness, and accelerates healing of damaged skin."
  },
  {
    name: "Trubiom Pigmentation Serum",
    brand: "Conscious Chemist",
    category: "Serum",
    ingredients: "Niacinamide, Kojic Acid, Tranexamic Acid",
    skinTypes: ["Normal", "Oily", "Combination"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Night",
    description: "A clinically formulated serum with a triple-action brightening complex to fade stubborn pigmentation and tanning.",
    howToUse: "Pat gently onto clean skin in the evening.",
    whyRecommended: "Clinically targets stubborn pigmentation, dark spots, and tanning with triple-action actives."
  },
  {
    name: "Brightening Serum",
    brand: "Deconstruct",
    category: "Serum",
    ingredients: "10% Niacinamide, 2% Tyrostat",
    skinTypes: ["Normal", "Oily", "Combination"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Both",
    description: "A synergistic brightening serum combining niacinamide with tyrosinase inhibitors to lighten dark patches and improve radiance.",
    howToUse: "Apply 2-3 drops morning or night.",
    whyRecommended: "Strong synergistic action to lighten dark patches and combat dullness."
  },
  {
    name: "C-20 Vitamin C Serum",
    brand: "Foxtale",
    category: "Serum",
    ingredients: "20% Ethyl Ascorbic Acid, Vitamin E, Ferulic Acid",
    skinTypes: ["Normal", "Combination", "Oily"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Morning",
    description: "A high-concentration stable vitamin C serum that delivers intense brightening and antioxidant protection.",
    howToUse: "Apply 3-4 drops to clean face in the morning. Follow with sunscreen.",
    whyRecommended: "High-potency stable vitamin C for intense brightening and environmental protection."
  },
  {
    name: "Glow Serum with Rice + Alpha Arbutin",
    brand: "Beauty of Joseon",
    category: "Serum",
    ingredients: "Rice Bran Water, 2% Alpha Arbutin, Niacinamide",
    skinTypes: ["Normal", "Dry", "Combination", "Sensitive"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Both",
    description: "A nourishing Korean beauty serum with rice bran water and alpha arbutin that brightens skin and fades dark spots gently.",
    howToUse: "Apply 2-3 drops to face and neck after toner.",
    whyRecommended: "Gentle brightening with traditional rice bran and alpha arbutin, ideal for sensitive skin."
  },

  // ═══════════════════════════════════════════════════
  // EYE CARE
  // ═══════════════════════════════════════════════════
  {
    name: "Caffeine Eye Serum 8%",
    brand: "Minimalist",
    category: "Eye Care",
    ingredients: "8% Caffeine, EGCG, Hyaluronic Acid",
    skinTypes: ["Normal", "Dry", "Combination", "Oily", "Sensitive"],
    skinConcerns: ["Under-eye Dark Circles"],
    timeOfDay: "Night",
    description: "A concentrated caffeine serum that improves microcirculation under the eyes to reduce dark circles and puffiness.",
    howToUse: "Massage 1-2 drops gently around the eye contours before bed.",
    whyRecommended: "Improves microcirculation under eyes to visibly reduce dark circles and puffiness."
  },
  {
    name: "Under Eye Cream with Caffeine & Retinol",
    brand: "The Derma Co.",
    category: "Eye Care",
    ingredients: "Caffeine, Retinol, Multi-Peptides",
    skinTypes: ["Normal", "Dry", "Combination", "Oily", "Sensitive"],
    skinConcerns: ["Under-eye Dark Circles", "Fine Lines", "Wrinkles"],
    timeOfDay: "Night",
    description: "A targeted under-eye cream that brightens pigmentation, reduces puffiness, and smooths fine lines around the eye area.",
    howToUse: "Tap gently around the orbital bone with ring finger every night.",
    whyRecommended: "Brightens under-eye pigmentation and smooths out fine lines around the eye contour."
  },

  // ═══════════════════════════════════════════════════
  // MOISTURIZERS
  // ═══════════════════════════════════════════════════
  {
    name: "Ceramide 0.3% + Madecassoside Moisturizer",
    brand: "Minimalist",
    category: "Moisturizer",
    ingredients: "Ceramides (AP, EOP, NP), Madecassoside",
    skinTypes: ["Dry", "Sensitive", "Normal"],
    skinConcerns: ["Redness", "Dullness", "Fine Lines"],
    timeOfDay: "Both",
    description: "A barrier-repairing moisturizer with ceramides and madecassoside that provides deep soothing and hydration for dry or compromised skin.",
    howToUse: "Smooth over face and neck after applying active serums.",
    whyRecommended: "Provides barrier defense and deep skin soothing for dry or sensitive skin."
  },
  {
    name: "Moisturizing Cream",
    brand: "CeraVe",
    category: "Moisturizer",
    ingredients: "Ceramides (1, 3, 6-II), Hyaluronic Acid, MVE Technology",
    skinTypes: ["Dry", "Normal", "Sensitive"],
    skinConcerns: ["Dullness", "Redness", "Fine Lines"],
    timeOfDay: "Both",
    description: "A rich cream with patented MVE technology that releases ceramides throughout the day to deeply hydrate and restore the skin barrier.",
    howToUse: "Smooth generously over face and dry patches morning and night.",
    whyRecommended: "Deeply hydrates dry, flaky skin and restores natural lipid barrier with ceramides."
  },
  {
    name: "Moisturizing Cream",
    brand: "Cetaphil",
    category: "Moisturizer",
    ingredients: "Sweet Almond Oil, Vitamin E, Glycerin",
    skinTypes: ["Dry", "Sensitive", "Normal"],
    skinConcerns: ["Dullness", "Redness"],
    timeOfDay: "Night",
    description: "A rich, non-greasy body and face cream that provides intense 48-hour hydration with a clinically proven formula.",
    howToUse: "Apply as final step in your night routine.",
    whyRecommended: "Rich moisturizing cream that locks in water to repair extreme dryness."
  },
  {
    name: "Barrier Repair Moisturizer",
    brand: "Dot & Key",
    category: "Moisturizer",
    ingredients: "5 Essential Ceramides, Probiotics, Hyaluronic Acid",
    skinTypes: ["Dry", "Sensitive", "Normal", "Combination"],
    skinConcerns: ["Redness", "Dullness"],
    timeOfDay: "Both",
    description: "A nourishing barrier cream with 5 ceramides and probiotics that soothes redness, tightness, and flakiness.",
    howToUse: "Massage onto face after serums morning and night.",
    whyRecommended: "Nourishing barrier cream that soothes redness, tightness, and flakiness."
  },
  {
    name: "Oil-Free Cica Gel Moisturizer",
    brand: "Dot & Key",
    category: "Moisturizer",
    ingredients: "Cica (Centella), Tea Tree, Niacinamide",
    skinTypes: ["Oily", "Combination"],
    skinConcerns: ["Acne", "Blackheads", "Large Pores"],
    timeOfDay: "Both",
    description: "A lightweight gel moisturizer with cica and tea tree that hydrates oily or acne-prone skin without clogging pores.",
    howToUse: "Apply daily as final step of routine.",
    whyRecommended: "Soothing gel moisturizer that hydrates oily or acne-prone skin without clogging."
  },
  {
    name: "Green Tea Oil-Free Moisturizer",
    brand: "Dot & Key",
    category: "Moisturizer",
    ingredients: "Green Tea Extract, Niacinamide, Squalane",
    skinTypes: ["Oily", "Combination", "Normal"],
    skinConcerns: ["Acne", "Large Pores", "Dullness"],
    timeOfDay: "Both",
    description: "A lightweight, non-comedogenic moisturizer with green tea that keeps oily skin matte, hydrated, and clear.",
    howToUse: "Massage onto face evenly after serum.",
    whyRecommended: "Lightweight, non-comedogenic hydration that keeps oily skin matte and clear."
  },
  {
    name: "PM Facial Moisturizing Lotion",
    brand: "CeraVe",
    category: "Moisturizer",
    ingredients: "3 Essential Ceramides, Niacinamide, Hyaluronic Acid",
    skinTypes: ["Normal", "Oily", "Combination"],
    skinConcerns: ["Dullness", "Large Pores", "Acne"],
    timeOfDay: "Night",
    description: "An ultralight night lotion with niacinamide and ceramides that moisturizes and calms irritated, acne-prone skin.",
    howToUse: "Apply before bed as the last step of your night routine.",
    whyRecommended: "Ultralight night lotion that moisturizes and calms irritated, acne-prone skin."
  },
  {
    name: "Hydrating Peptide Moisturizer",
    brand: "Deconstruct",
    category: "Moisturizer",
    ingredients: "Peptide Complex, Ceramides, Squalane",
    skinTypes: ["Normal", "Dry", "Combination"],
    skinConcerns: ["Fine Lines", "Wrinkles", "Dullness"],
    timeOfDay: "Both",
    description: "A peptide-infused moisturizer that firms skin while providing deep hydration and barrier support.",
    howToUse: "Apply to face and neck morning and night after serum.",
    whyRecommended: "Peptide-infused formula that boosts skin firmness while deeply hydrating."
  },
  {
    name: "Squalane + Ceramide Moisturizer",
    brand: "Conscious Chemist",
    category: "Moisturizer",
    ingredients: "Squalane, Ceramides, Vitamin E",
    skinTypes: ["Dry", "Sensitive", "Normal"],
    skinConcerns: ["Redness", "Dullness", "Dry Lips"],
    timeOfDay: "Both",
    description: "A deeply nourishing moisturizer with plant-derived squalane and ceramides for barrier restoration.",
    howToUse: "Apply generously to face and neck after serums.",
    whyRecommended: "Plant-derived squalane deeply nourishes and repairs the skin barrier."
  },

  // ═══════════════════════════════════════════════════
  // SUNSCREENS
  // ═══════════════════════════════════════════════════
  {
    name: "SPF 50 Sunscreen",
    brand: "Minimalist",
    category: "Sunscreen",
    ingredients: "Zinc Oxide, Vitamin E, Squalane",
    skinTypes: ["Normal", "Dry", "Sensitive", "Combination"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Fine Lines", "Wrinkles"],
    timeOfDay: "Morning",
    description: "A broad-spectrum mineral sunscreen with zinc oxide that protects against UVA/UVB rays while nourishing the skin.",
    howToUse: "Apply generously as the last step of morning routine. Reapply every 2-3 hours when outdoors.",
    whyRecommended: "Broad-spectrum mineral protection that prevents pigmentation and premature aging."
  },
  {
    name: "Matte Sunscreen SPF 50",
    brand: "Foxtale",
    category: "Sunscreen",
    ingredients: "Niacinamide, Hybrid UV Filters",
    skinTypes: ["Oily", "Combination", "Normal"],
    skinConcerns: ["Acne", "Large Pores", "Pigmentation", "Dark Spots"],
    timeOfDay: "Morning",
    description: "A matte-finish sunscreen with niacinamide that provides high SPF protection with an ultra-matte, oil-controlling finish.",
    howToUse: "Apply in the morning as final step. Reapply every 3 hours if outdoors.",
    whyRecommended: "High sun protection with an ultra-matte, oil-controlling finish perfect for oily skin."
  },
  {
    name: "Lightweight Daily Sunscreen SPF 50",
    brand: "Conscious Chemist",
    category: "Sunscreen",
    ingredients: "Hyaluronic Acid, UV Protectants, Vitamin E",
    skinTypes: ["Dry", "Normal", "Sensitive"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness"],
    timeOfDay: "Morning",
    description: "A dewy, zero-white-cast sunscreen with hyaluronic acid that provides SPF 50 protection while keeping dry skin hydrated.",
    howToUse: "Apply in the morning and reapply every 3 hours if outdoors.",
    whyRecommended: "Dewy, zero-white-cast sun shield that keeps dry skin hydrated while protecting."
  },
  {
    name: "Relief Sun SPF50+ PA++++",
    brand: "Beauty of Joseon",
    category: "Sunscreen",
    ingredients: "Rice Bran, Probiotics, Chemical UV Filters",
    skinTypes: ["Normal", "Dry", "Sensitive", "Combination"],
    skinConcerns: ["Pigmentation", "Dark Spots", "Dullness", "Fine Lines"],
    timeOfDay: "Morning",
    description: "A Korean beauty sunscreen with rice bran and probiotics that provides SPF50+ PA++++ protection with a lightweight, moisturizing texture.",
    howToUse: "Apply generously as the last step of your morning skincare routine.",
    whyRecommended: "Provides broad-spectrum SPF50+ protection while keeping skin hydrated and nourished."
  },
  {
    name: "Anthelios Invisible Fluid SPF50+",
    brand: "La Roche-Posay",
    category: "Sunscreen",
    ingredients: "Mexoryl SX, Mexoryl XL, Thermal Spring Water",
    skinTypes: ["Sensitive", "Normal", "Combination", "Oily"],
    skinConcerns: ["Redness", "Pigmentation", "Dark Spots"],
    timeOfDay: "Morning",
    description: "An ultra-lightweight invisible fluid sunscreen with patented Mexoryl filters for maximum UVA/UVB protection on sensitive skin.",
    howToUse: "Shake well before use. Apply generously as last skincare step. Reapply every 2 hours.",
    whyRecommended: "Dermatologist-recommended ultra-protection for sensitive and reactive skin."
  },

  // ═══════════════════════════════════════════════════
  // LIP CARE
  // ═══════════════════════════════════════════════════
  {
    name: "Vitamin C Lip Balm SPF 30",
    brand: "Minimalist",
    category: "Lip Care",
    ingredients: "Vitamin C (L-Ascorbic Acid), Ceramides, UV Filters",
    skinTypes: ["Normal", "Dry", "Sensitive", "Combination", "Oily"],
    skinConcerns: ["Dry Lips", "Pigmentation"],
    timeOfDay: "Morning",
    description: "A brightening lip balm with vitamin C and SPF 30 that fights lip pigmentation while providing sun protection.",
    howToUse: "Swipe on lips during the day. Reapply after eating or drinking.",
    whyRecommended: "Brightens dark, pigmented lips and shields from UV damage throughout the day."
  },
  {
    name: "Lip Sleeping Mask",
    brand: "Dot & Key",
    category: "Lip Care",
    ingredients: "Shea Butter, Vitamin E, Berry Complex",
    skinTypes: ["Normal", "Dry", "Sensitive", "Combination", "Oily"],
    skinConcerns: ["Dry Lips"],
    timeOfDay: "Night",
    description: "An overnight lip treatment mask with shea butter and berry complex that dissolves dead skin cells and restores soft, pink lips.",
    howToUse: "Apply a generous layer on lips before bed. Wipe off in the morning.",
    whyRecommended: "Dissolves dead skin cells on lips overnight, restoring soft, hydrated lips."
  },
  {
    name: "Ceramide Lip Therapy",
    brand: "CeraVe",
    category: "Lip Care",
    ingredients: "Ceramides, Hyaluronic Acid, Cholesterol",
    skinTypes: ["Normal", "Dry", "Sensitive", "Combination", "Oily"],
    skinConcerns: ["Dry Lips"],
    timeOfDay: "Both",
    description: "A healing lip balm with ceramides and hyaluronic acid that restores the lip barrier and prevents moisture loss.",
    howToUse: "Apply throughout the day whenever lips feel dry.",
    whyRecommended: "Restores lip barrier with ceramides for long-lasting hydration and healing."
  },

  // ═══════════════════════════════════════════════════
  // EXFOLIATORS
  // ═══════════════════════════════════════════════════
  {
    name: "AHA 25% + PHA 5% + BHA 2% Peeling Solution",
    brand: "Minimalist",
    category: "Exfoliator",
    ingredients: "25% AHA, 5% PHA, 2% BHA",
    skinTypes: ["Normal", "Oily", "Combination"],
    skinConcerns: ["Dullness", "Blackheads", "Dark Spots", "Acne", "Large Pores"],
    timeOfDay: "Night",
    description: "A potent chemical exfoliator with AHA, BHA, and PHA that removes dead skin cells, unclogs pores, and improves overall skin texture.",
    howToUse: "Apply to clean, dry face for 10 minutes max. Rinse. Use 1-2 times per week only.",
    whyRecommended: "Powerful weekly exfoliation that resurfaces skin, fades marks, and unclogs pores."
  },
  {
    name: "Glycolic Acid 7% Toner",
    brand: "Minimalist",
    category: "Exfoliator",
    ingredients: "7% Glycolic Acid, Aloe Vera",
    skinTypes: ["Normal", "Oily", "Combination"],
    skinConcerns: ["Dullness", "Dark Spots", "Pigmentation", "Large Pores"],
    timeOfDay: "Night",
    description: "A daily-use glycolic acid toner that gently exfoliates, brightens skin, and improves texture over time.",
    howToUse: "Apply with a cotton pad to clean face at night. Follow with moisturizer.",
    whyRecommended: "Daily chemical exfoliation to improve radiance and reduce textural irregularities."
  },
  {
    name: "PHA 3% Toner",
    brand: "Foxtale",
    category: "Exfoliator",
    ingredients: "3% PHA (Gluconolactone), Aloe Vera, Panthenol",
    skinTypes: ["Sensitive", "Dry", "Normal"],
    skinConcerns: ["Dullness", "Large Pores"],
    timeOfDay: "Night",
    description: "A gentle PHA toner suitable for sensitive skin that exfoliates without irritation while providing hydration.",
    howToUse: "Apply with cotton pad on clean face. Can be used daily.",
    whyRecommended: "Ultra-gentle exfoliation suitable for sensitive skin without causing irritation."
  },

  // ═══════════════════════════════════════════════════
  // MASKS
  // ═══════════════════════════════════════════════════
  {
    name: "Salicylic Acid Clay Mask",
    brand: "Dot & Key",
    category: "Mask",
    ingredients: "Salicylic Acid, Kaolin Clay, Tea Tree Oil",
    skinTypes: ["Oily", "Combination"],
    skinConcerns: ["Acne", "Blackheads", "Whiteheads", "Large Pores"],
    timeOfDay: "Night",
    description: "A deep-cleansing clay mask with salicylic acid that draws out impurities, excess oil, and minimizes the appearance of pores.",
    howToUse: "Apply an even layer on clean face. Leave for 10-15 minutes. Rinse with lukewarm water. Use 1-2 times per week.",
    whyRecommended: "Deep-cleansing weekly treatment that draws out impurities and shrinks pores."
  },
  {
    name: "Hydrating Sheet Mask",
    brand: "Beauty of Joseon",
    category: "Mask",
    ingredients: "Ginseng, Hyaluronic Acid, Rice Water",
    skinTypes: ["Dry", "Normal", "Sensitive"],
    skinConcerns: ["Dullness", "Fine Lines"],
    timeOfDay: "Night",
    description: "A luxurious Korean sheet mask with ginseng and rice water that drenches skin in moisture and improves plumpness.",
    howToUse: "Place on clean face for 15-20 minutes. Pat in remaining essence. Use 1-2 times per week.",
    whyRecommended: "Drenches the skin in deep moisture and improves plumpness with Korean botanicals."
  },

  // ═══════════════════════════════════════════════════
  // TONERS
  // ═══════════════════════════════════════════════════
  {
    name: "Panthenol 3% Toner",
    brand: "Minimalist",
    category: "Toner",
    ingredients: "3% Panthenol, Betaine, Hyaluronic Acid",
    skinTypes: ["Sensitive", "Dry", "Normal"],
    skinConcerns: ["Redness", "Dullness"],
    timeOfDay: "Both",
    description: "A soothing panthenol toner that calms irritated skin, strengthens the barrier, and provides lightweight hydration.",
    howToUse: "Pour onto palms or cotton pad and pat gently into skin after cleansing.",
    whyRecommended: "Calms irritated, red skin and strengthens the moisture barrier with panthenol."
  },
  {
    name: "Ginseng Essence Water",
    brand: "Beauty of Joseon",
    category: "Toner",
    ingredients: "Ginseng Root Water, Niacinamide",
    skinTypes: ["Normal", "Dry", "Combination", "Sensitive"],
    skinConcerns: ["Dullness", "Fine Lines", "Wrinkles"],
    timeOfDay: "Both",
    description: "A Korean essence toner with fermented ginseng that revitalizes dull skin, improves elasticity, and adds a healthy glow.",
    howToUse: "Pour onto palms and press into cleansed face. Can also be used with a cotton pad.",
    whyRecommended: "Revitalizes dull, tired skin and improves elasticity with fermented ginseng."
  },

  // ═══════════════════════════════════════════════════
  // TREATMENTS (Spot treatments, specialized)
  // ═══════════════════════════════════════════════════
  {
    name: "Salicylic Acid 2% Spot Treatment",
    brand: "The Derma Co.",
    category: "Treatment",
    ingredients: "2% Salicylic Acid, Tea Tree Oil",
    skinTypes: ["Oily", "Combination", "Normal"],
    skinConcerns: ["Acne", "Blackheads", "Whiteheads"],
    timeOfDay: "Night",
    description: "A targeted spot treatment that penetrates into individual blemishes to speed up healing and reduce inflammation.",
    howToUse: "Dab directly onto blemishes at night after cleansing. Do not apply all over face.",
    whyRecommended: "Targeted blemish treatment that accelerates healing of individual acne spots."
  },
  {
    name: "Squalane Oil",
    brand: "Minimalist",
    category: "Treatment",
    ingredients: "100% Plant-Derived Squalane",
    skinTypes: ["Dry", "Sensitive", "Normal"],
    skinConcerns: ["Dullness", "Redness", "Dry Lips", "Fine Lines"],
    timeOfDay: "Night",
    description: "A lightweight facial oil with plant-derived squalane that deeply nourishes and locks in moisture without clogging pores.",
    howToUse: "Apply 3-4 drops as the last step of your night routine, after moisturizer.",
    whyRecommended: "Locks in all previous skincare layers and provides deep overnight nourishment."
  },
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing recommended products
    await RecommendedProduct.deleteMany({});
    console.log('Cleared existing recommended products');

    // Insert all products
    const result = await RecommendedProduct.insertMany(recommendedProducts);
    console.log(`Successfully seeded ${result.length} recommended products`);

    // Summary
    const categories = [...new Set(recommendedProducts.map(p => p.category))];
    const brands = [...new Set(recommendedProducts.map(p => p.brand))];
    console.log(`\nCategories (${categories.length}): ${categories.join(', ')}`);
    console.log(`Brands (${brands.length}): ${brands.join(', ')}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Only run when executed directly (not when imported)
if (require.main === module) {
  seedProducts();
}
