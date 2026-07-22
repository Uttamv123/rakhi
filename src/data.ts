/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrateBoxStyle, RakhiThread, PremiumTreat, MessageCardTemplate, PreCuratedGift, StandaloneThreadItem } from './types';

// Hotlink images from the high-fidelity screenshots & other high-quality matching URLs
export const HERO_IMAGES = {
  topThread: 'https://lh3.googleusercontent.com/aida/AP1WRLuMI88DERaMMQurvHUY4Slt6Lx665Huxk2aLxUc_UNsqedJEr5mZOMHXYOZhS0k3QkaqM5qPnIPfNLUNXaqKEYsEX_B_MHUDXdtIn_z_MmVgL3qyG-rAfACHT8NPJQnmSW1OprU1NiQwGwg6RzFZXAPrFYVIckKOc4Z-suG72_Fr15pTk2dovYuZ5FpvjjyawtJct0h5EZAj3T-o9d3lfyf5t8V0QUClfMe6YkexYdBh67S2u1qFhFEGDE=s1600',
  mainPlate: '/hero-rakhi.png',
  bottomThread: 'https://lh3.googleusercontent.com/aida/AP1WRLtIStvRkbcgOcoyKH3WxxHIP-Yw_z9KX1Yv-eAb21dyHwU5GtvQv3QGBMhZGEznmFD82z8u_DFieaUR053Y9J_OPN9bNMlRLPJC6RkioNxMQXLxMI7w8J50mQn7h-vXd-6oYIYtWlOqfuETeZZMvK77stczwTkj16JjO8BHYLSpJt2ATuEMv-yScgMg3TsS7L7sB93tzrjv8BctcS7D_Jm40861KdzmyHJm9UUKwoOAZqYmzGOSwUjqefBX=s1600',
  storyCouple: 'https://lh3.googleusercontent.com/aida/AP1WRLsrvclSFxzMLlJmMy1a6UZueVtvqoSSkJEm6vfYZPePk4fj0WlW_jw3-QJlJDkJGf6TOJNj_2eUsjiA1X0xDsdmocLyHIAPNsraB_CgCuh0nPlBuI0tq-5cpXl93L_5fnT1E0CBdTGauuwldxskmjJEPF8_2ki_4cxIbYjapalYRNqgfXyl7lPs2Vapm3rUEkkn247uRRxijxoEejXQatZkLkUoYWWYa_PXL6uJ2aESnIuXLZ9lPu8btHs=s1600'
};

export const RELATION_IMAGES = {
  brother: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNwVUKf0EjqNJHRu_Rb501afJP4pXWugd6mh59X9zuEOXw8BLhx0PS9ev1FL2pLC1QUbhO0cDvg5LAt5gXxGPSWM2fiF0pMkUP7pj66rAP6WzV-Gc7TgN21Dn-Sy3GBKVWGRhFOFSRRIBJlIPVIBkYO_FQuU5JA5G3_l2erHWRUSSelu-C1NtZXZThPrXmhVsbDbMryNPNqbzFqs6FjnyimD_IGU8giIfvUfTUVqyzrYqAMoOvher-11zfUSdyPUpVXLNjQlLzG1LW',
  kids: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa7YkVTQjsbbx_QwzBHvgkNEKzmFucfifaJ3_fv7Sz8GhXbbwihOIsyT8cgZjsHptcNBTVrVpwragl7scUD5kdtioTny95HZDYKEI4Fc9wctSqSyXa1fXT_jKYEq6uIE6b9w_DHTXabhI_QIlqohPmyvFma5mdmM7BEqS1rTEaDg2iGNWLifoNHhAAUi7Pstj_tOhcOaCagBA0yikwd5L44I5RimIgma57B1cGOpapdH8sTY9Zwtny2rBVaWXOZjS-1IqLq4xZSYwL',
  couple: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800'
};

export const PANTRY_IMAGES = {
  sweets: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkmRjnISlHXU_C92TgR_RSDIr4Aty1ooSHSmU3vU5zMRW_DtRICwK92sLvVCm-AFtQojt31J-hmiTPwumnOodOXTI7ZFLtzlOGlpHtyol7acFIg4nAsM_WTqBQizBEcVu9R-qxQ2pThduW7GGLZDlUjx-8WUv6po8mxHei3uUNVyPL8_Vx2EmLQb98eCXVtBYD7pAuDTlFZ-VIlWInnN-vxJi8SQOgQeb8N3AJW-8_2_WV5BY_p6UOIf9tgKhr8Pz4wUhcSCTJAnFu',
  dryFruits: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDejWISbVURUCR-EcTDSZ2uXGnNjCe8GIUIMX8O5zKfClzrYMSGIA9fq_Qp883vdxs2_GnBorwjSw-xgJ7UvMEITGpe-Yj5pn75ZeJJBUQTDSqaiUxwUZauoP_WbSqH8i4bF_GA6_EdVgpU-89mfxaxhPyO-fGZCO861K3QNwLt2ruD2mO9fH6iWi-8U048turTbNtF7901onSxBJQ8YSh3yZ5PrnMun0j9r39Ii3s59zZEQN9K7HFfUm1vBeXDFH94GnJ9QYth32W',
  chocolates: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa7YkVTQjsbbx_QwzBHvgkNEKzmFucfifaJ3_fv7Sz8GhXbbwihOIsyT8cgZjsHptcNBTVrVpwragl7scUD5kdtioTny95HZDYKEI4Fc9wctSqSyXa1fXT_jKYEq6uIE6b9w_DHTXabhI_QIlqohPmyvFma5mdmM7BEqS1rTEaDg2iGNWLifoNHhAAUi7Pstj_tOhcOaCagBA0yikwd5L44I5RimIgma57B1cGOpapdH8sTY9Zwtny2rBVaWXOZjS-1IqLq4xZSYwL'
};

// Crate Box Styles
export const CRATE_BOX_STYLES: CrateBoxStyle[] = [
  {
    id: 'wooden-heritage',
    name: 'Heritage Pine Wood Crate',
    description: 'Beautifully hand-crafted reusable wooden crate with slide-to-open latch, wood wool bedding, and traditional stamp marking.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'royal-velvet',
    name: 'Imperial Velvet Treasure Box',
    description: 'Deep royal maroon velvet finished rigid storage box with fine golden floral hot stamping, satin interior, and tassel closures.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'classic-floral',
    name: 'Vibrant Mandala Gift Case',
    description: 'Eco-friendly heavy-duty textured paperboard container wrapped in hand-pressed golden foil floral and Sanskrit border designs.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400'
  }
];

// Premium handmade Rakhi thread choices
export const RAKHI_THREADS: RakhiThread[] = [
  // 1. BROTHER OPTIONS
  {
    id: 'gold-ganesha',
    name: '24K Gold-Plated Ganesha Thread',
    description: 'A finely detailed center gold-plated Ganesha deity with genuine American diamonds on soft premium silk thread.',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'sandalwood-royal',
    name: 'Sandalwood Heritage Bead Rakhi',
    description: 'Authentic aromatic Mysore Sandalwood beads hand-threaded with pure zari details and protective rudraksha seeds.',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'rudraksha-silver-shield',
    name: 'Panchmukhi Rudraksha Silver Shield',
    description: 'A sacred five-faced Panchmukhi Rudraksha bead encased in a beautifully engraved sterling silver-plated frame, hand-tied on red holy yarn.',
    price: 11.25,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'kundan-floral-shield',
    name: 'Royal Kundan Floral Shield',
    description: 'A majestic center glass Kundan stone surrounded by smaller crystal zircon gems, tied with double-stranded premium saffron silk threads.',
    price: 13.50,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'zari-peacock-zardosi',
    name: 'Varanasi Zari Peacock Rakhi',
    description: 'Exquisite hand-woven gold-wire zardosi peacock feather embroidery centered with tiny blue gemstones on a soft felt backing.',
    price: 10.50,
    image: 'https://images.unsplash.com/photo-1628144541571-08f328f4ebbc?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'silver-mahabali',
    name: 'Sterling Silver Veer Bajrang Shield',
    description: 'A courageous sterling silver shield engraving of Lord Hanuman\'s Mace (Gada), bound with extra-thick traditional red and yellow Mauli thread.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'royal-swastik-zari',
    name: 'Auspicious Royal Swastik Zari Thread',
    description: 'A sparkling diamond-encrusted traditional Swastik emblem set inside a golden circular dial, hand-tied with premium gold-twisted silk cords.',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'antique-om-dial',
    name: 'Antique Om Medallion Dial',
    description: 'Classic distressed-brass Om monogram with handcrafted filigree petals and tiny rudraksha spacers on double-bonded scarlet threads.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'evil-eye-protection',
    name: 'Nazar-Dosh Protection Hamsa Rakhi',
    description: 'Featuring a classic protective blue glass Nazar bead and Hamsa hand, detailed with silver spacers and tied on dark-blue resilient silk twine.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'shree-silver-brooch',
    name: 'Sacred Shree Monogram Silver Rakhi',
    description: 'Beautiful hand-cast sterling silver plaque depicting the sacred \'Shree\' calligraphy, flanked by red coral beads on a bright vermillion silk thread.',
    price: 15.25,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'platinum-geometric-luxe',
    name: 'Platinum-Plated Minimalist Geometric Bead',
    description: 'For the modern, minimal brother. A clean, three-dimensional geometric platinum-finished bead, suspended on an ultra-slim charcoal grey waxed cord.',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'handmade-terracotta-tribal',
    name: 'Eco-Friendly Terracotta Tribal Mandala',
    description: 'Organic hand-fired clay bead painted with traditional folk motifs in safe organic dyes, tied to a rustic, 100% natural jute thread.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'floral-brass-meena',
    name: 'Jaipur Floral Brass Meenakari Rakhi',
    description: 'Vivid hand-painted blue and yellow enamel work on solid brass, showcasing traditional Rajasthani floral art with cotton thread.',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'designer-chakra-bead',
    name: 'Gilded Wheel of Protection (Chakra)',
    description: 'Inspired by Lord Vishnu\'s Sudarshana Chakra, this golden spoked wheel Rakhi features a tiny central ruby zircon on high-grade silk.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },
  {
    id: 'traditional-mouli-sacred',
    name: 'Pure Holy Mauli Sandalwood Twist',
    description: 'An extra-thick, multi-layered cotton Mauli thread blessed at Varanasi Ghats, adorned with small natural Tulsi and sandalwood beads.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400',
    relationTags: ['brother']
  },

  // 2. KIDS OPTIONS
  {
    id: 'superhero-bal',
    name: 'Playful Little Ganesha Kid Thread',
    description: 'A cheerful, soft silicone Ganesha caricature thread. Safe, irritation-free, and adjustable for tiny wrists.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'hanuman-dancing-kid',
    name: 'Cute Dancing Bal Hanuman Thread',
    description: 'A super-soft silicone, glowing Bal Hanuman cartoon caricature with a playful expression. Kid-friendly, hypoallergenic adjustable bands.',
    price: 7.25,
    image: 'https://images.unsplash.com/photo-1530651788726-1dbf58eeef1f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'krishna-flute-kid',
    name: 'Little Krishna Flute & Butter Pot',
    description: 'A delightful colorful thread with a playful baby Krishna holding a golden flute and butter pot, decorated with glowing colorful beads.',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'dino-cartoon-band',
    name: 'Roaring Little Dino Cartoon Strap',
    description: 'A playful green rubber dinosaur strap with friendly cartoon eyes, fitted on a double-braided orange and green premium soft thread.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'space-astronaut-kid',
    name: 'Glittering Cosmic Astronaut Rakhi',
    description: 'Perfect for the little space dreamer! A glittering astronaut emblem that glows in the dark, tied with comfortable blue silk thread.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'playful-chhota-bheem',
    name: 'Mighty Bal Bheem Laddu Band',
    description: 'Featuring the loved strong cartoon hero clutching a golden sweet Laddu. Made from non-toxic durable rubber on a bright yellow ribbon.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1530651788726-1dbf58eeef1f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'dancing-peppa-pink',
    name: 'Cute Pink Piggy Princess Band',
    description: 'Sweet pink cartoon character with a sparkling gold crown on a soft pink satin band. Completely nickel-free and baby-safe.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'glow-minion-banana',
    name: 'Glowing Happy Banana Minion Band',
    description: 'Playful single-eyed cartoon minion holding a banana. The face glows in the dark, mounted on an adjustable soft-grip silicone strap.',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'magical-unicorn-sparkle',
    name: 'Magical Glittering Unicorn Star',
    description: 'Colorful 3D rubber unicorn head with a soft sparkly horn and pastel rainbow beads on a comfy baby-pink elastic thread.',
    price: 6.25,
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'roaring-tiger-cub',
    name: 'Brave Little Tiger Cub Wristband',
    description: 'Soft fabric-stuffed baby tiger face that squeaks gently when pressed! Perfect and ultra-safe for infants and toddlers.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1531842477197-54cf8821213b?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'little-ganesha-modak',
    name: 'Sweet Little Ganesha & Modak Band',
    description: 'Bright orange cartoon Ganesha holding a tiny glittering modak, attached to a colorful braided thread with adjustable sliding knot.',
    price: 6.80,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'smiley-emoji-spring',
    name: 'Bouncy Smiley Emoji Yellow Band',
    description: 'A hilarious yellow laughing-emoji face on a bouncy miniature metal spring. Bound to bring a smile to any kid\'s face!',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'shining-star-led',
    name: 'LED Flashing Multi-Color Star Watch',
    description: 'Features a tiny hidden battery and a pressable button that activates a colorful flashing light show inside a transparent rubber star.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'mighty-spider-badge',
    name: 'Web-Slinger Spider Action Band',
    description: 'An awesome red and blue web-spinning superhero shield badge with shiny beads on highly robust blue nylon thread.',
    price: 7.20,
    image: 'https://images.unsplash.com/photo-1604644401890-0bd678c83785?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },
  {
    id: 'playful-teddy-bear',
    name: 'Soft Fuzzy Plush Teddy Wristlet',
    description: 'Features a tiny, cute stuffed plush teddy bear head on a soft, scratch-free fuzzy brown flannel wristband with velcro clasp.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=400',
    relationTags: ['kids']
  },

  // 3. BHAIYA-BHABHI (COUPLE) OPTIONS
  {
    id: 'bhaiya-bhabhi-lumba',
    name: 'Royal Rose & Pearl Lumba Set',
    description: 'Elegant matching couple sets: a designer dial thread for the brother and a dangling pearlescent Lumba hook for sister-in-law.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'meenakari-peacock-couple',
    name: 'Jaipur Meenakari Peacock Couple Set',
    description: 'An outstanding matching pair: a classic hand-enamelled blue-green Peacock dial Rakhi for Bhaiya, and a cascading hanging Lumba with pearls for Bhabhi.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'marigold-silk-couple',
    name: 'Marigold Silk Tassel & Golden Lumba Pair',
    description: 'Styled in sunshine yellow and orange silk. An ornate, flower-shaped dial thread for Bhaiya, accompanied by a heavy tassel hanging Lumba for Bhabhi.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'sandalwood-pearl-couple',
    name: 'Sandalwood & Pearl Heritage Couple Duo',
    description: 'An elegant luxury combination: a premium sandalwood and silver bead thread for Bhaiya, and a matching hanging sandalwood-ring Lumba with fresh white pearls for Bhabhi.',
    price: 21.50,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'gilded-mandala-chuda-couple',
    name: 'Ornate Gilded Mandala & Chuda Lumba Set',
    description: 'Elaborate gold-lace work. Features an auspicious gold-foiled Mandala medallion for Bhaiya and a stunning bangle-loop (Chuda) Lumba with hanging golden beads for Bhabhi.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'royal-emerald-couple',
    name: 'Regal Emerald & Polki Couple Set',
    description: 'Set with rich emerald green stones and gold-rimmed Polki work. Includes a strong designer thread for Bhaiya and a gorgeous dangling kundan Lumba for Bhabhi.',
    price: 24.50,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'silver-filigree-couple',
    name: 'Jaipur Silver Filigree Heritage Set',
    description: 'Exquisite hand-drawn fine sterling silver wirework. Complete with an elegant silver medallion for Bhaiya and a matching multi-tiered silver Lumba for Bhabhi.',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'kundan-choker-lumba-pair',
    name: 'Premium Kundan & Ghungroo Couple Combo',
    description: 'Featuring authentic glass-cut Kundan medallions bordered with soft tiny bells (Ghungroos) that make a pleasant ringing sound. Hand-tied on red yarn.',
    price: 23.50,
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'heritage-gota-patti-pair',
    name: 'Rajasthani Gota Patti Pink & Gold Set',
    description: 'Beautiful handmade pink and gold lace-work. Features a lightweight flat coin Rakhi for Bhaiya and an elaborate dangling latkan-style Lumba for Bhabhi.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'zardosi-crown-couple',
    name: 'Imperial Gold Zardosi Crown Couple Set',
    description: 'Royal golden-wire embroidery on red velvet. Represents the king and queen of the family: a crown dial thread for Bhaiya and a gorgeous tassel Lumba for Bhabhi.',
    price: 25.50,
    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'white-pearl-cascade-couple',
    name: 'Fresh River Pearl Cascade Couple Duo',
    description: 'Premium double-strand natural white pearls. A pristine pearl-embedded wrist thread for Bhaiya and matching dangling white pearl drop Lumba for Bhabhi.',
    price: 27.50,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'sacred-rudraksha-lumba-duo',
    name: 'Shiva-Shakti Rudraksha Heritage Duo',
    description: 'Blessed Panchmukhi Rudraksha beads mixed with gold caps. A spiritual wrist string for Bhaiya and matching hanging Rudraksha-floral Lumba for Bhabhi.',
    price: 19.50,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'terracotta-ethnic-couple',
    name: 'Hand-Painted Terracotta Couple Set',
    description: 'Earthy organic baked clay medallions painted in classic ochre and maroon floral patterns, on natural spun cotton threads.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'royal-blue-silk-couple',
    name: 'Varanasi Midnight Blue Zari Couple Set',
    description: 'Woven with deep royal blue premium silk thread and gold zari weaves. Matching set with delicate blue-silk hanging tassels and golden beads.',
    price: 20.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  },
  {
    id: 'antique-jadau-luxe-couple',
    name: 'Vintage Jadau Royal Couple Treasure',
    description: 'High luxury gold-plated brass set featuring faux rubies and emeralds in intricate traditional Jadau patterns, matching heavy Lumba with hanging golden balls.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=400',
    relationTags: ['bhaiya-bhabhi']
  }
];

// Treat Options
export const PREMIUM_TREATS: PremiumTreat[] = [
  {
    id: 'kaju-katli',
    name: 'Artisanal Silver Kaju Katli',
    category: 'sweets',
    description: 'Silky, melt-in-your-mouth cashew triangles decorated with edible pure silver vark, prepared fresh with organic ghee.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    weightGrams: 250
  },
  {
    id: 'motichoor-laddu',
    name: 'Saffron Motichoor Delight',
    category: 'sweets',
    description: 'Made from premium gram flour pearls, fried in premium pure cow ghee, and infused with saffron strands and pistachios.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400',
    weightGrams: 250
  },
  {
    id: 'royal-cashews',
    name: 'Slow Roasted Masala Cashews',
    category: 'dry-fruits',
    description: 'W320 size giant cashews dry-roasted to a crispy perfection and spiced with premium rock salt and high-grade black pepper.',
    price: 11.50,
    image: 'https://images.unsplash.com/photo-1508061461508-cb18c242f556?auto=format&fit=crop&q=80&w=400',
    weightGrams: 200
  },
  {
    id: 'salted-pistachios',
    name: 'Jumbo Iranian Roasted Pistachios',
    category: 'dry-fruits',
    description: 'Lightly salted and air-roasted in-shell premium pistachios, packed in resealable safety foils to lock in flavor.',
    price: 13.00,
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=400',
    weightGrams: 200
  },
  {
    id: 'almond-rocks',
    name: 'Dark Artisanal Almond Clusters',
    category: 'chocolates',
    description: '64% dark Belgian chocolate mixed with crunchy roasted California almond slivers. Perfect blend of sweet and bitter.',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1548907040-4d42b52125ea?auto=format&fit=crop&q=80&w=400',
    weightGrams: 180
  }
];

// Card Templates
export const CARD_TEMPLATES: MessageCardTemplate[] = [
  {
    id: 'mandala-royal',
    name: 'Traditional Saffron Mandala',
    bgColor: '#FFF5EB',
    textColor: '#8C3200',
    borderColor: '#E65C00',
    fontClass: 'font-serif',
    bgPattern: 'radial-gradient(circle, #ffe2cc 1px, transparent 1px)'
  },
  {
    id: 'minimal-cream',
    name: 'Editorial Gold Border',
    bgColor: '#FCFBF9',
    textColor: '#1F2937',
    borderColor: '#735c00',
    fontClass: 'font-serif'
  },
  {
    id: 'youth-kids',
    name: 'Playful Festivities',
    bgColor: '#F0FDFA',
    textColor: '#115E59',
    borderColor: '#0D9488',
    fontClass: 'font-sans'
  }
];

// Pre-curated high-quality crates based on the high-fidelity screenshot
export const PRE_CURATED_GIFTS: PreCuratedGift[] = [
  {
    id: 'pantry-classic-sweets',
    name: 'The Traditional Mithai Crate',
    description: 'A luxurious combination pairing a premium 24K Gold-Plated Ganesha Rakhi thread with a fresh 250g box of hand-rolled Silver Kaju Katli and Saffron Laddus.',
    price: 38.00,
    image: PANTRY_IMAGES.sweets,
    rakhiName: '24K Gold Ganesha Thread',
    sweetsName: 'Authentic Indian Sweets Platter',
    relation: 'brother',
    badge: 'Bestseller'
  },
  {
    id: 'pantry-dry-fruits',
    name: 'The Royal Nut & Thread Crate',
    description: 'Crafted with our Mysore Sandalwood Bead Rakhi and paired elegantly with hand-roasted giant California Almonds and slow-salted jumbo Pistachios in a beautiful pine crate.',
    price: 34.50,
    image: PANTRY_IMAGES.dryFruits,
    rakhiName: 'Sandalwood Bead Rakhi',
    sweetsName: 'Premium Roasted Dry Fruits Duo',
    relation: 'brother',
    badge: 'Heritage Choice'
  },
  {
    id: 'pantry-kids-party',
    name: 'The Little Ganesha Kids Hamper',
    description: 'Make the little one\'s festival incredible! Soft adjustable caricature Bal Ganesha thread paired with fine chocolate almond rocks and artisanal cream cookies.',
    price: 24.99,
    image: PANTRY_IMAGES.chocolates,
    rakhiName: 'Playful Little Ganesha Thread',
    sweetsName: 'Fine Belgian Chocolate Almond Rocks',
    relation: 'kids',
    badge: 'Kids Favorite'
  },
  {
    id: 'pantry-kids-hanuman-feast',
    name: 'Bal Hanuman Playtime Crate',
    description: 'A super-fun festive basket for kids featuring our Cute Dancing Bal Hanuman silicone thread, accompanied by delicious artisanal chocolate clusters and sweet butter cookies.',
    price: 22.50,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400',
    rakhiName: 'Cute Dancing Bal Hanuman Thread',
    sweetsName: 'Gourmet Chocolate Clusters & Cookies',
    relation: 'kids',
    badge: 'New Launch'
  },
  {
    id: 'pantry-couple-royal-rose',
    name: 'The Royal Rose Couple Hamper',
    description: 'A magnificent luxury couple hamper featuring the matching Royal Rose & Pearl Lumba Set for Bhaiya & Bhabhi, paired with a fresh box of Silver Kaju Katli and roasted masala cashews in an elegant pine wood chest.',
    price: 48.00,
    image: RELATION_IMAGES.couple,
    rakhiName: 'Royal Rose & Pearl Lumba Set',
    sweetsName: 'Silver Kaju Katli & Spicy Cashews',
    relation: 'couple',
    badge: 'Premium Couple'
  },
  {
    id: 'pantry-couple-meenakari',
    name: 'Jaipur Meenakari Peacock Feast',
    description: 'Celebrate the traditional couple in absolute royalty. This elite bundle features the hand-enamelled Jaipur Meenakari Peacock Set, accompanied by saffron-infused motichoor ladoos and jumbo Iranian pistachios.',
    price: 52.50,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    rakhiName: 'Jaipur Meenakari Peacock Couple Set',
    sweetsName: 'Saffron Motichoor & Salted Pistachios',
    relation: 'couple',
    badge: 'Luxury Celebration'
  }
];

// Standalone Threads Collection (Normal vs Premium Options)
export const STANDALONE_THREADS: StandaloneThreadItem[] = [
  // NORMAL THREADS (Just threads, tilak, and small items)
  {
    id: 'normal-rudraksha',
    type: 'normal',
    name: 'Devotion Rudraksha Thread',
    description: 'An authentic Five-faced (Panchmukhi) Rudraksha centerpiece thread representing spiritual strength, peace, and longevity. Handcrafted with traditional holy red yarn.',
    madeOf: 'Natural small Panchmukhi Rudraksha beads, pure Varanasi red cotton Kalava yarn, and polished brass spacer beads.',
    whatsIncluded: [
      '1x Hand-selected Rudraksha Holy Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 3.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLuMI88DERaMMQurvHUY4Slt6Lx665Huxk2aLxUc_UNsqedJEr5mZOMHXYOZhS0k3QkaqM5qPnIPfNLUNXaqKEYsEX_B_MHUDXdtIn_z_MmVgL3qyG-rAfACHT8NPJQnmSW1OprU1NiQwGwg6RzFZXAPrFYVIckKOc4Z-suG72_Fr15pTk2dovYuZ5FpvjjyawtJct0h5EZAj3T-o9d3lfyf5t8V0QUClfMe6YkexYdBh67S2u1qFhFEGDE',
    badge: 'Traditional'
  },
  {
    id: 'normal-zardosi',
    type: 'normal',
    name: 'Royal Zardosi Peacock Rakhi',
    description: 'An exquisite hand-embroidered metallic wire Rakhi showcasing a classic Indian peacock motif. Perfectly matches festive sherwanis or traditional kurtas.',
    madeOf: 'Fine gold-plated metallic zari threads, vibrant royal blue silk floss, high-shine micro beads, and soft felt-backing.',
    whatsIncluded: [
      '1x Royal Zardosi Peacock Designer Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1628144541571-08f328f4ebbc?auto=format&fit=crop&q=80&w=400',
    badge: 'Bestseller'
  },
  {
    id: 'normal-kundan',
    type: 'normal',
    name: 'Kundan Flower & Pearl Heritage Thread',
    description: 'A timeless design centering a brilliant glass-cut Kundan blossom, surrounded by premium high-luster fresh-water replica pearls. Refined and elegant.',
    madeOf: 'Genuine glass Kundan stones in gilded frames, polished high-grade acrylic pearls, and twisted golden-crimson silk cords.',
    whatsIncluded: [
      '1x Kundan Flower & Pearl Heritage Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    badge: 'Premium Handcraft'
  },
  {
    id: 'normal-silver-om',
    type: 'normal',
    name: 'Silver-Plated Om Swastik Rakhi',
    description: 'Double the blessings. A delicate high-polish silver charm displaying the holy Om and Swastik symbols side-by-side, tied with traditional protection Kalava yarn.',
    madeOf: '925 Sterling silver-plated solid brass emblem, hand-spun red and yellow holy Kalava cotton yarn.',
    whatsIncluded: [
      '1x Silver-Plated Om Swastik Protection Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 5.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtIStvRbcgOcoyKH3WxxHIP-Yw_z9KX1Yv-eAb21dyHwU5GtvQv3QGBMhZGEznmFD82z8u_DFieaUR053Y9J_OPN9bNMlRLPJC6RkioNxMQXLxMI7w8J50mQn7h-vXd-6oYIYtWlOqfuETeZZMvK77stczwTkj16JjO8BHYLSpJt2ATuEMv-yScgMg3TsS7L7sB93tzrjv8BctcS7D_Jm40861KdzmyHJm9UUKwoOAZqYmzGOSwUjqefBX',
    badge: 'Spiritual'
  },
  {
    id: 'normal-kids-ganesha',
    type: 'normal',
    name: 'Bal Ganesha Caricature Thread',
    description: 'A fun, lightweight thread designed specifically for kids. Features a friendly, soft-touch Ganesha character that can be adjusted easily for small wrists.',
    madeOf: 'Hypoallergenic soft-touch silicone emblem, durable braided lightweight cotton thread, irritation-free backing.',
    whatsIncluded: [
      '1x Bal Ganesha Kids Adjustable Thread',
      '1x Miniature Kumkum Roli & Rice Tilak Packet',
      '1x Colorful Ganesha festive sticker card'
    ],
    price: 3.49,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa7YkVTQjsbbx_QwzBHvgkNEKzmFucfifaJ3_fv7Sz8GhXbbwihOIsyT8cgZjsHptcNBTVrVpwragl7scUD5kdtioTny95HZDYKEI4Fc9wctSqSyXa1fXT_jKYEq6uIE6b9w_DHTXabhI_QIlqohPmyvFma5mdmM7BEqS1rTEaDg2iGNWLifoNHhAAUi7Pstj_tOhcOaCagBA0yikwd5L44I5RimIgma57B1cGOpapdH8sTY9Zwtny2rBVaWXOZjS-1IqLq4xZSYwL',
    badge: 'Kids Special'
  },
  {
    id: 'normal-mauli',
    type: 'normal',
    name: 'Auspicious Kalava Mauli Protection Thread',
    description: 'A traditional and pure protection thread made of twisted red and yellow holy yarn, adorned with premium golden wooden accent beads. Elegant, humble, and auspicious.',
    madeOf: 'Hand-spun red and yellow sacred Mauli cotton thread, natural lacquered sandalwood beads, and golden metallic rings.',
    whatsIncluded: [
      '1x Traditional Mauli Sacred Protection Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Hand-made protective cotton pouch'
    ],
    price: 2.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLuMI88DERaMMQurvHUY4Slt6Lx665Huxk2aLxUc_UNsqedJEr5mZOMHXYOZhS0k3QkaqM5qPnIPfNLUNXaqKEYsEX_B_MHUDXdtIn_z_MmVgL3qyG-rAfACHT8NPJQnmSW1OprU1NiQwGwg6RzFZXAPrFYVIckKOc4Z-suG72_Fr15pTk2dovYuZ5FpvjjyawtJct0h5EZAj3T-o9d3lfyf5t8V0QUClfMe6YkexYdBh67S2u1qFhFEGDE',
    badge: 'Pure Kalava'
  },
  {
    id: 'normal-pearl-classic',
    type: 'normal',
    name: 'Classic Single Pearl Protection Thread',
    description: 'A minimalistic and highly elegant thread showcasing a single pure white replica pearl suspended in a traditional saffron-silk thread. Understated luxury.',
    madeOf: 'Shining replica glass pearl centerpiece, polished brass floral caps, and fine hand-woven saffron silk cords.',
    whatsIncluded: [
      '1x Single Pearl Minimalist Sacred Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    badge: 'Minimalist'
  },
  {
    id: 'normal-sandalwood-minimal',
    type: 'normal',
    name: 'Pure Sandalwood Bead Protection Thread',
    description: 'Embrace natural calmness. A sacred protection thread woven with authentic, fragrant sandalwood beads imported from Mysore, releasing a soothing woody aroma.',
    madeOf: 'Mysore sandalwood beads, scarlet cotton yarn, and traditional gold metallic spacer beads.',
    whatsIncluded: [
      '1x Pure Sandalwood Bead Sacred Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 4.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNwVUKf0EjqNJHRu_Rb501afJP4pXWugd6mh59X9zuEOXw8BLhx0PS9ev1FL2pLC1QUbhO0cDvg5LAt5gXxGPSWM2fiF0pMkUP7pj66rAP6WzV-Gc7TgN21Dn-Sy3GBKVWGRhFOFSRRIBJlIPVIBkYO_FQuU5JA5G3_l2erHWRUSSelu-C1NtZXZThPrXmhVsbDbMryNPNqbzFqs6FjnyimD_IGU8giIfvUfTUVqyzrYqAMoOvher-11zfUSdyPUpVXLNjQlLzG1LW',
    badge: 'Aromatic'
  },
  {
    id: 'normal-evil-eye',
    type: 'normal',
    name: 'Protective Turkish Evil Eye Rakhi',
    description: 'Ward off negative energies and bring protective positive vibes. Combines the sacred bonding of Raksha Bandhan with the powerful Turkish Nazar amulet.',
    madeOf: 'Hand-blown blue glass Evil Eye centerpiece charm, set in a polished silver-plated frame on a braided cotton cord.',
    whatsIncluded: [
      '1x Turkish Nazar Protective Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Blessing card explaining the Nazar charm'
    ],
    price: 4.25,
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=400',
    badge: 'Protection'
  },
  {
    id: 'normal-meenakari',
    type: 'normal',
    name: 'Meenakari Floral Enamel Thread',
    description: 'A glorious design featuring traditional Indian Meenakari hand-painted floral enamel work. Adds an authentic burst of colors to your sibling celebration.',
    madeOf: 'Solid brass base with hand-applied colorful enamel work, dangling small golden beads, and twisted silk yarns.',
    whatsIncluded: [
      '1x Meenakari Floral Enamelled Sacred Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 4.95,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLueSPyjwmWbtccJGh_Vusy4lGTcFYCerPQpfhpz3jZYLgsBwvZsf_-nwmk9a2b18VYn0ooDDcvqB8LNjfl5v8pTxcCNMeJJTqk2uod4mzCeBx_7nHE3b5CrH5qFaZLkk6I605J_ux9jZXjs7w4BYrfPuJz-agxfy1QjxkDu_NZKAu7wP19_jP2eDsVVEE7z6PGhQNxcMkMyICJA4QHshXqHY39FLGbr2uXTNDUhQ7FZSoG-JUUVpzSQpMlB',
    badge: 'Hand-painted'
  },
  {
    id: 'normal-ganesha-brass',
    type: 'normal',
    name: 'Traditional Brass Ganesha Motif Thread',
    description: 'Seek the blessings of Lord Ganesha, the remover of obstacles. A solid hand-crafted brass Ganesha emblem, tied with sacred golden and red threads.',
    madeOf: 'Antique-finish solid brass Ganesha casting, red holy kalava cord, and sparkling gold-painted wooden beads.',
    whatsIncluded: [
      '1x Brass Ganesha Sacred Symbol Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&q=80&w=400',
    badge: 'Auspicious'
  },
  {
    id: 'normal-designer-stone',
    type: 'normal',
    name: 'Floral Kundan & Zircon Thread',
    description: 'A glamorous, high-shine designer thread featuring brilliant glass-cut cubic zirconia and traditional Kundan stones arranged in an elegant floral mandala.',
    madeOf: 'Zircon crystal-cut gemstones, clear glass Kundan stones, set on gold-tone alloy with twisted pink and red silk threads.',
    whatsIncluded: [
      '1x Floral Kundan & Zircon Designer Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 5.25,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    badge: 'High Shine'
  },
  {
    id: 'normal-silk-tassel',
    type: 'normal',
    name: 'Vibrant Silk Tassel & Lumba Set',
    description: 'Traditional Punjabi-style silk tassels. Designed with highly vibrant multi-colored soft threads, bringing joy, festivity, and warmth to your wrist.',
    madeOf: 'Premium mulberry silk floss tassels, miniature silver bells, and handmade cotton thread rings.',
    whatsIncluded: [
      '1x Colorful Silk Tassel Sacred Protection Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Hand-made protective cotton pouch'
    ],
    price: 5.75,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkmRjnISlHXU_C92TgR_RSDIr4Aty1ooSHSmU3vU5zMRW_DtRICwK92sLvVCm-AFtQojt31J-hmiTPwumnOodOXTI7ZFLtzlOGlpHtyol7acFIg4nAsM_WTqBQizBEcVu9R-qxQ2pThduW7GGLZDlUjx-8WUv6po8mxHei3uUNVyPL8_Vx2EmLQb98eCXVtBYD7pAuDTlFZ-VIlWInnN-vxJi8SQOgQeb8N3AJW-8_2_WV5BY_p6UOIf9tgKhr8Pz4wUhcSCTJAnFu',
    badge: 'Festive Vibe'
  },
  {
    id: 'normal-designer-pearl',
    type: 'normal',
    name: 'Regal Freshwater Pearl Protection Thread',
    description: 'An premium string featuring multiple genuine-looking freshwater replica pearls linked together with shimmering golden thread. Fits perfectly on any wrist.',
    madeOf: 'AAA Grade replica freshwater white pearls, gold-coated metal flower spacers, and traditional red-orange silk thread.',
    whatsIncluded: [
      '1x Regal Pearl Strings Sacred Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 5.95,
    image: 'https://images.unsplash.com/photo-1627931313627-fe03db1ca865?auto=format&fit=crop&q=80&w=400',
    badge: 'Best Value'
  },
  {
    id: 'normal-crystal-shree',
    type: 'normal',
    name: 'Auspicious Crystal Shree Sacred Thread',
    description: 'A beautiful blend of spirituality and modernity. Features a crystal-embedded emblem of "Shree" representing goddess Lakshmi, representing wealth, peace, and abundance.',
    madeOf: 'Cut crystal diamonds, gold-tone metal Shree icon, and traditional protection Kalava thread.',
    whatsIncluded: [
      '1x Crystal Shree Auspicious Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-foiled floral greeting envelope'
    ],
    price: 5.20,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtIStvRbcgOcoyKH3WxxHIP-Yw_z9KX1Yv-eAb21dyHwU5GtvQv3QGBMhZGEznmFD82z8u_DFieaUR053Y9J_OPN9bNMlRLPJC6RkioNxMQXLxMI7w8J50mQn7h-vXd-6oYIYtWlOqfuETeZZMvK77stczwTkj16JjO8BHYLSpJt2ATuEMv-yScgMg3TsS7L7sB93tzrjv8BctcS7D_Jm40861KdzmyHJm9UUKwoOAZqYmzGOSwUjqefBX',
    badge: 'Auspicious'
  },
  {
    id: 'normal-bamboo-eco',
    type: 'normal',
    name: 'Sustainable Hand-Spun Bamboo Fiber Rakhi',
    description: 'Our environment-conscious choice. Hand-spun using purely natural bamboo fibers, naturally dyed with plant extracts. Minimalistic, sturdy, and highly sustainable.',
    madeOf: '100% Biodegradable organic bamboo-derived yarn, natural clay beads, and plant-based organic dyes.',
    whatsIncluded: [
      '1x Sustainable Eco-Friendly Bamboo Thread',
      '1x Organic Turmeric Roli & Rice Tilak Pack',
      '1x Recycled craft-paper packaging envelope'
    ],
    price: 3.80,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    badge: 'Eco-Friendly'
  },
  {
    id: 'normal-antique-coin',
    type: 'normal',
    name: 'Antique-Finish Copper Sun Coin Thread',
    description: 'A classic design showcasing a hand-carved copper medallion representing Surya, the sun god. Represents power, vitality, radiating positivity, and sibling guard.',
    madeOf: 'Solid copper coin charm with antique lacquer, tied on twisted crimson and golden silk threads.',
    whatsIncluded: [
      '1x Copper Sun Medallion Protection Thread',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Saffron protective velvet-lined pouch'
    ],
    price: 4.80,
    image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=400',
    badge: 'Heritage Coin'
  },

  // PREMIUM THREADS (Includes thread + small gift + sweet/chocolate)
  {
    id: 'premium-sandalwood',
    type: 'premium',
    name: 'Heritage Sandalwood & Mithai Luxury Pack',
    description: 'An ultimate traditional bundle pairing a fragrant Mysore Sandalwood Bead Rakhi with a fresh box of Silver Kaju Katli and an auspicious hand-cast brass Ganesha Diya token.',
    madeOf: 'Aromatic Mysore sandalwood beads thread, fresh cashew-paste silver-vark sweets, and solid polished copper-brass Ganesha token.',
    whatsIncluded: [
      '1x Aromatic Sandalwood Heritage Bead Thread',
      '1x Freshly Prepared Silver Kaju Katli (100g airtight pack)',
      '1x Hand-cast Solid Brass Ganesha Diya Token',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Gold-stamped rigid pine-wood presentation case'
    ],
    price: 16.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNwVUKf0EjqNJHRu_Rb501afJP4pXWugd6mh59X9zuEOXw8BLhx0PS9ev1FL2pLC1QUbhO0cDvg5LAt5gXxGPSWM2fiF0pMkUP7pj66rAP6WzV-Gc7TgN21Dn-Sy3GBKVWGRhFOFSRRIBJlIPVIBkYO_FQuU5JA5G3_l2erHWRUSSelu-C1NtZXZThPrXmhVsbDbMryNPNqbzFqs6FjnyimD_IGU8giIfvUfTUVqyzrYqAMoOvher-11zfUSdyPUpVXLNjQlLzG1LW',
    badge: 'Royalty Pack'
  },
  {
    id: 'premium-gold-ganesha',
    type: 'premium',
    name: '24K Gold-Plated Ganesha & Saffron Ladoo Set',
    description: 'Express your deep devotion with our highest-grade gold-plated Ganesha thread, combined with fresh saffron-infused Motichoor Ladoos and an auspicious sterling silver-plated Lakshmi-Ganesha coin.',
    madeOf: '24K Gold-plated brass centerpiece thread, pure cow-ghee saffron chickpea flour sweets, 999 fine silver-plated copper coin.',
    whatsIncluded: [
      '1x 24K Gold-Plated Ganesha Sacred Thread',
      '1x Saffron Motichoor Delight Ladoos (100g airtight pack)',
      '1x Auspicious Sterling Silver-Plated Lakshmi-Ganesha Coin',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Imperial maroon velvet-finished rigid case'
    ],
    price: 19.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLueSPyjwmWbtccJGh_Vusy4lGTcFYCerPQpfhpz3jZYLgsBwvZsf_-nwmk9a2b18VYn0ooDDcvqB8LNjfl5v8pTxcCNMeJJTqk2uod4mzCeBx_7nHE3b5CrH5qFaZLkk6I605J_ux9jZXjs7w4BYrfPuJz-agxfy1QjxkDu_NZKAu7wP19_jP2eDsVVEE7z6PGhQNxcMkMyICJA4QHshXqHY39FLGbr2uXTNDUhQ7FZSoG-JUUVpzSQpMlB',
    badge: 'Ultimate Devotion'
  },
  {
    id: 'premium-cashew-delight',
    type: 'premium',
    name: 'Kundan Flower & Roasted Cashew Delicacy',
    description: 'A classic and healthy combination pairing a brilliant Kundan Flower thread with giant slow-roasted masala cashews and a beautiful terracotta incense stand.',
    madeOf: 'Fine glass-cut Kundan flower thread, W320 jumbo roasted salted cashews, hand-molded red-clay terracotta.',
    whatsIncluded: [
      '1x Kundan Flower & Pearl Heritage Thread',
      '1x Jumbo Slow-Roasted Masala Cashews (100g air-sealed canister)',
      '1x Hand-molded Terracotta Incense Holder & 5 Scented Sticks',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Textured floral craft-paper sliding drawer case'
    ],
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ec82a897?auto=format&fit=crop&q=80&w=400',
    badge: 'Festive Gourmet'
  },
  {
    id: 'premium-bhaiya-bhabhi',
    type: 'premium',
    name: 'Majestic Bhaiya-Bhabhi Lumba & Chocolate Set',
    description: 'Perfect for the beloved couple. Features matching brother Rakhi and dangling sister-in-law Lumba, combined with luxury Belgian chocolate almond rocks and a polished brass Om keychain.',
    madeOf: 'Gold-twisted zari laces and freshwater pearl strings, 64% dark Belgian chocolate whole almond clusters, solid polished brass.',
    whatsIncluded: [
      '1x Bhaiya Designer Dial Holy Thread',
      '1x Bhabhi Pearlescent Dangling Lumba Charm',
      '1x Dark Belgian Chocolate Almond Rocks (100g fresh pouch)',
      '1x Auspicious Polished Brass Om Emblem Keychain',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Double-drawer floral printed presentation box'
    ],
    price: 23.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkmRjnISlHXU_C92TgR_RSDIr4Aty1ooSHSmU3vU5zMRW_DtRICwK92sLvVCm-AFtQojt31J-hmiTPwumnOodOXTI7ZFLtzlOGlpHtyol7acFIg4nAsM_WTqBQizBEcVu9R-qxQ2pThduW7GGLZDlUjx-8WUv6po8mxHei3uUNVyPL8_Vx2EmLQb98eCXVtBYD7pAuDTlFZ-VIlWInnN-vxJi8SQOgQeb8N3AJW-8_2_WV5BY_p6UOIf9tgKhr8Pz4wUhcSCTJAnFu',
    badge: 'Cherished Couple'
  },
  {
    id: 'premium-royal-kundan',
    type: 'premium',
    name: 'Royal Kundan & Dry Fruit Luxury Platter',
    description: 'Celebrate like kings. A dazzling Kundan flower centerpiece thread paired with a premium selection of high-grade roasted almonds and salted pistachios, and a mini brass incense bowl.',
    madeOf: 'Premium faceted glass stones, gold gilding, jumbo California almonds, green Iranian pistachios, and hand-cast solid brass bowl.',
    whatsIncluded: [
      '1x Kundan Flower & Pearl Heritage Thread',
      '1x Premium Salted Iranian Pistachios (80g canister)',
      '1x Jumbo Roasted California Almonds (80g canister)',
      '1x Sacred Hand-carved Brass Incense Dhoop Bowl',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Royal velvet-finished golden sliding box'
    ],
    price: 17.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDejWISbVURUCR-EcTDSZ2uXGnNjCe8GIUIMX8O5zKfClzrYMSGIA9fq_Qp883vdxs2_GnBorwjSw-xgJ7UvMEITGpe-Yj5pn75ZeJJBUQTDSqaiUxwUZauoP_WbSqH8i4bF_GA6_EdVgpU-89mfxaxhPyO-fGZCO861K3QNwLt2ruD2mO9fH6iWi-8U048turTbNtF7901onSxBJQ8YSh3yZ5PrnMun0j9r39Ii3s59zZEQN9K7HFfUm1vBeXDFH94GnJ9QYth32W',
    badge: 'High Luxury'
  },
  {
    id: 'premium-spiritual-rudraksha',
    type: 'premium',
    name: 'Spiritual Rudraksha & Roasted Pista Celebration',
    description: 'An auspicious combination of holiness and health. We pair our Panchmukhi Devotion Rudraksha thread with premium roasted salted pistachios and a copper Lakshmi-Ganesha coin.',
    madeOf: 'Five-faced natural Rudraksha beads, hand-twisted Kalava cord, high-grade salted pistachios, and real copper prayer coin.',
    whatsIncluded: [
      '1x Devotion Rudraksha Sacred Protection Thread',
      '1x Crunchy Roasted Salted Pistachios (100g fresh pack)',
      '1x Sacred Copper Lakshmi-Ganesha Holy Coin',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Eco-friendly handmade pine-wood slider box'
    ],
    price: 15.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLuMI88DERaMMQurvHUY4Slt6Lx665Huxk2aLxUc_UNsqedJEr5mZOMHXYOZhS0k3QkaqM5qPnIPfNLUNXaqKEYsEX_B_MHUDXdtIn_z_MmVgL3qyG-rAfACHT8NPJQnmSW1OprU1NiQwGwg6RzFZXAPrFYVIckKOc4Z-suG72_Fr15pTk2dovYuZ5FpvjjyawtJct0h5EZAj3T-o9d3lfyf5t8V0QUClfMe6YkexYdBh67S2u1qFhFEGDE',
    badge: 'Devout Healthy'
  },
  {
    id: 'premium-meenakari-kaju',
    type: 'premium',
    name: 'Meenakari Floral & Premium Kaju Katli Combo',
    description: 'Double the sweetness. Features our hand-painted Meenakari Floral thread, a freshly sealed tray of premium silver-vark Kaju Katli, and a traditional miniature clay Diya pair.',
    madeOf: 'Enamelled brass flower thread, fresh rich cashews and cane sugar sweets, and hand-painted clay lamps.',
    whatsIncluded: [
      '1x Meenakari Floral Enamelled Sacred Thread',
      '1x Traditional Fresh Kaju Katli (120g airtight tray)',
      '2x Hand-painted Clay Diya Festive Lamps',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Silk-lined handmade paper craft case'
    ],
    price: 18.25,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNwVUKf0EjqNJHRu_Rb501afJP4pXWugd6mh59X9zuEOXw8BLhx0PS9ev1FL2pLC1QUbhO0cDvg5LAt5gXxGPSWM2fiF0pMkUP7pj66rAP6WzV-Gc7TgN21Dn-Sy3GBKVWGRhFOFSRRIBJlIPVIBkYO_FQuU5JA5G3_l2erHWRUSSelu-C1NtZXZThPrXmhVsbDbMryNPNqbzFqs6FjnyimD_IGU8giIfvUfTUVqyzrYqAMoOvher-11zfUSdyPUpVXLNjQlLzG1LW',
    badge: 'Traditional Joy'
  },
  {
    id: 'premium-silver-coin-sweet',
    type: 'premium',
    name: 'Sacred Silver Charm & Milk Peda Festive Box',
    description: 'An elite bundle consisting of our 925 Silver-Plated Om Swastik thread, coupled with legendary melt-in-the-mouth Cardamom Milk Pedas and an aromatic sandalwood incense bundle.',
    madeOf: 'Silver-plated sacred Om symbol charm, condensed milk and cardamom sweets, and pure wood incense powders.',
    whatsIncluded: [
      '1x Silver-Plated Om Swastik Protection Thread',
      '1x Authentic Cardamom Infused Milk Pedas (120g fresh tray)',
      '1x Fragrant Sandalwood Incense Sticks Box (10 sticks)',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Elegant gold-embossed ivory paper drawer casket'
    ],
    price: 21.99,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtIStvRbcgOcoyKH3WxxHIP-Yw_z9KX1Yv-eAb21dyHwU5GtvQv3QGBMhZGEznmFD82z8u_DFieaUR053Y9J_OPN9bNMlRLPJC6RkioNxMQXLxMI7w8J50mQn7h-vXd-6oYIYtWlOqfuETeZZMvK77stczwTkj16JjO8BHYLSpJt2ATuEMv-yScgMg3TsS7L7sB93tzrjv8BctcS7D_Jm40861KdzmyHJm9UUKwoOAZqYmzGOSwUjqefBX',
    badge: 'Premium Devotion'
  },
  {
    id: 'premium-evil-eye-chocolate',
    type: 'premium',
    name: 'Protective Evil Eye & Roasted Hazelnut Chocolate',
    description: 'A contemporary festive gift. Combines our modern Turkish Evil Eye thread with an artisan chocolate bar of whole roasted Turkish Hazelnuts and custom protection-manifestation cards.',
    madeOf: 'Glass Nazar charm thread, 54% dark artisan cocoa mass, whole premium hazelnuts, and card stock.',
    whatsIncluded: [
      '1x Turkish Nazar Protective Thread',
      '1x Artisan Dark Hazelnut Chocolate Bar (80g single origin)',
      '1x Protective Mantra & Manifestation Booklet',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Minimalistic modern charcoal-grey slider drawer'
    ],
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=400',
    badge: 'Modern Chic'
  },
  {
    id: 'premium-luxury-lumba-sweet',
    type: 'premium',
    name: 'Royal Bhaiya-Bhabhi Pearl & Besan Ladoo Platter',
    description: 'Showcase your deep warmth to your brother and sister-in-law. Matching Kundan flower and pearly dangling Lumba threads paired with classic hand-rolled cow-ghee Besan Ladoos and auspicious red-painted wooden chopsticks.',
    madeOf: 'Fine seed pearls, golden zari chains, roasted chickpea flour sweets with pure cow ghee and pistachios.',
    whatsIncluded: [
      '1x Kundan Flower & Pearl Heritage Thread',
      '1x Pearlescent Dangling Lumba Sister-in-law Charm',
      '1x Pure Ghee Hand-rolled Besan Ladoos (120g fresh pack)',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Royal crimson and gold double-layered lacquer box'
    ],
    price: 24.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkmRjnISlHXU_C92TgR_RSDIr4Aty1ooSHSmU3vU5zMRW_DtRICwK92sLvVCm-AFtQojt31J-hmiTPwumnOodOXTI7ZFLtzlOGlpHtyol7acFIg4nAsM_WTqBQizBEcVu9R-qxQ2pThduW7GGLZDlUjx-8WUv6po8mxHei3uUNVyPL8_Vx2EmLQb98eCXVtBYD7pAuDTlFZ-VIlWInnN-vxJi8SQOgQeb8N3AJW-8_2_WV5BY_p6UOIf9tgKhr8Pz4wUhcSCTJAnFu',
    badge: 'Imperial Couple'
  },
  {
    id: 'premium-designer-brass-almond',
    type: 'premium',
    name: 'Brass Ganesha & Honey-Roasted Almond Gift Set',
    description: 'A robust and healthy choice centering the auspicious brass Ganesha thread. Bundled with crunchy premium honey-roasted almonds and custom copper-plated tilak cups.',
    madeOf: 'Lacquered brass Ganesha charm thread, whole roasted honey-glazed almonds, and solid spun-copper miniature bowls.',
    whatsIncluded: [
      '1x Brass Ganesha Sacred Symbol Thread',
      '1x Golden Honey-Roasted Crunchy Almonds (100g airtight jar)',
      '2x Auspicious Miniature Spun-Copper Tilak Cups',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Pine-wood textured rustic cardboard chest'
    ],
    price: 18.50,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLueSPyjwmWbtccJGh_Vusy4lGTcFYCerPQpfhpz3jZYLgsBwvZsf_-nwmk9a2b18VYn0ooDDcvqB8LNjfl5v8pTxcCNMeJJTqk2uod4mzCeBx_7nHE3b5CrH5qFaZLkk6I605J_ux9jZXjs7w4BYrfPuJz-agxfy1QjxkDu_NZKAu7wP19_jP2eDsVVEE7z6PGhQNxcMkMyICJA4QHshXqHY39FLGbr2uXTNDUhQ7FZSoG-JUUVpzSQpMlB',
    badge: 'Wellness Pack'
  },
  {
    id: 'premium-silk-zardosi-mithai',
    type: 'premium',
    name: 'Zardosi Peacock & Assorted Dry Fruit Mithai Thali',
    description: 'A sensory delight of traditional royalty. We pair our hand-embroidered metallic Zardosi Peacock thread with a delicious assorted box of premium cashew-fig rolls and pistachio sweets.',
    madeOf: 'Zari wire embroidered silk patch, dried figs, cashew paste, cardamom, rose petals, and silver leaf foil.',
    whatsIncluded: [
      '1x Royal Zardosi Peacock Designer Thread',
      '1x Artisan Cashew-Fig & Pista Rolled Sweets (120g tray)',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Imperial embroidered brocade fabric keepsake pouch',
      '1x Gold-foiled designer sliding presentation drawer'
    ],
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1548907040-4d42b52125ea?auto=format&fit=crop&q=80&w=400',
    badge: 'Artisanal Elite'
  },
  {
    id: 'premium-eco-friendly-seed',
    type: 'premium',
    name: 'Plantable Clay Rakhi & Organic Jaggery Sweet Box',
    description: 'Our most popular organic bundle. Features a handcrafted clay Ganesha Rakhi embedded with marigold seeds, paired with guilt-free organic jaggery-sweetened dry fruit bites.',
    madeOf: 'Terracotta seed clay, organic cotton cords, raw organic palm jaggery, walnuts, almonds, and dates.',
    whatsIncluded: [
      '1x Seed-Embedded Plantable Terracotta Rakhi',
      '1x Organic Jaggery & Dry Fruit Energy Bites (100g jar)',
      '1x Biodegradable coco-peat coin and miniature pot for planting',
      '1x Organic Turmeric Roli & Rice Tilak Pack',
      '1x 100% Recycled cardboard craft presentation gift chest'
    ],
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    badge: 'Go Green'
  },
  {
    id: 'premium-royal-om-saffron',
    type: 'premium',
    name: 'Royal Silver Om Thread & Premium Saffron Sweet Treat',
    description: 'An elegant premium pack marrying our silver-plated Om Swastik protection thread with rich saffron-milk Petha treats and a holy Ganga water miniature vial.',
    madeOf: 'Silver-plated brass charm, Varanasi holy Ganges water in glass, and pure saffron milk-infused winter melon sweets.',
    whatsIncluded: [
      '1x Silver-Plated Om Swastik Protection Thread',
      '1x Royal Saffron Infused Milk Petha Sweets (120g fresh pack)',
      '1x Auspicious Miniature Glass Vial of Holy Ganga Water',
      '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
      '1x Satin-padded imperial ivory paper presentation case'
    ],
    price: 20.50,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtIStvRbcgOcoyKH3WxxHIP-Yw_z9KX1Yv-eAb21dyHwU5GtvQv3QGBMhZGEznmFD82z8u_DFieaUR053Y9J_OPN9bNMlRLPJC6RkioNxMQXLxMI7w8J50mQn7h-vXd-6oYIYtWlOqfuETeZZMvK77stczwTkj16JjO8BHYLSpJt2ATuEMv-yScgMg3TsS7L7sB93tzrjv8BctcS7D_Jm40861KdzmyHJm9UUKwoOAZqYmzGOSwUjqefBX',
    badge: 'Auspicious Saffron'
  }
];
