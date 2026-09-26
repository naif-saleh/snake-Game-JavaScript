// Game Stages / Challenges (المراحل والتحديات)
// Guaranteed Safe Runway: Center column x=9,10,11 from y=8 to y=18 is always 100% free of obstacles!

export const STAGES = [
  {
    id: 1,
    titleEn: 'Cyber Bootcamp',
    titleAr: 'التدريب السيبراني',
    subtitleEn: 'Master your steering and gather basic energy cores.',
    subtitleAr: 'أتقن مهارات القيادة والمناورة واجمع كبسولات الطاقة الأولية.',
    targetCores: 6,
    timeLimit: null, // No timer
    speedInterval: 240, // Very comfortable starting speed
    themeColor: '#00f2fe',
    skin: 'cyber',
    foodTheme: 'apple',
    wallMode: 'solid',
    obstacles: [] // Completely open arena
  },
  {
    id: 2,
    titleEn: 'Laser Grid Outpost',
    titleAr: 'حقول الليزر المضيئة',
    subtitleEn: 'Avoid solid laser barrier pylons in the 4 corners.',
    subtitleAr: 'تجنب أعمدة وحواجز الليزر في زوايا الميدان.',
    targetCores: 8,
    timeLimit: null,
    speedInterval: 220,
    themeColor: '#10b981',
    skin: 'emerald',
    foodTheme: 'apple',
    wallMode: 'solid',
    obstacles: [
      [4, 4], [4, 5],
      [15, 4], [15, 5],
      [4, 14], [4, 15],
      [15, 14], [15, 15]
    ]
  },
  {
    id: 3,
    titleEn: 'Turbo Overdrive',
    titleAr: 'سباق السرعة الخارق',
    subtitleEn: 'Race against the clock! Gather 10 cores before time runs out.',
    subtitleAr: 'سباق مع الوقت! اجمع 10 كبسولات قبل نفاد 60 ثانية.',
    targetCores: 10,
    timeLimit: 60, // 60 seconds
    speedInterval: 190,
    themeColor: '#ffb703',
    skin: 'gold',
    foodTheme: 'golden',
    wallMode: 'solid',
    obstacles: [
      [5, 8], [6, 8],
      [13, 8], [14, 8],
      [5, 12], [6, 12],
      [13, 12], [14, 12]
    ]
  },
  {
    id: 4,
    titleEn: 'Virus Quarantine',
    titleAr: 'المنطقة الفيروسية',
    subtitleEn: 'Infiltrate the bio-hazard zone and neutralize infected spores.',
    subtitleAr: 'اخترق منطقة الحجر الصحي الفيروسي واجمع الأبواغ المشعة.',
    targetCores: 12,
    timeLimit: null,
    speedInterval: 200,
    themeColor: '#a855f7',
    skin: 'cyber',
    foodTheme: 'virus',
    wallMode: 'solid',
    obstacles: [
      // Flank barriers, center runway is 100% open
      [5, 6], [6, 6],
      [13, 6], [14, 6],
      [3, 10], [4, 10],
      [15, 10], [16, 10],
      [5, 14], [6, 14],
      [13, 14], [14, 14]
    ]
  },
  {
    id: 5,
    titleEn: 'Dual Labyrinth',
    titleAr: 'المتاهة المزدوجة',
    subtitleEn: 'Navigate tight dual-corridor barriers with precision.',
    subtitleAr: 'ناور بدقة فائقة عبر ممرات المتاهة المزدوجة.',
    targetCores: 14,
    timeLimit: null,
    speedInterval: 190,
    themeColor: '#10b981',
    skin: 'palestine',
    foodTheme: 'palestine',
    wallMode: 'solid',
    obstacles: [
      // Left Corridor
      [4, 4], [4, 5], [4, 6], [4, 7],
      // Right Corridor
      [15, 4], [15, 5], [15, 6], [15, 7],
      // Bottom side wings
      [4, 12], [4, 13], [5, 13],
      [15, 12], [15, 13], [14, 13]
    ]
  },
  {
    id: 6,
    titleEn: 'The Cyber Core',
    titleAr: 'قلب النظام السيبراني',
    subtitleEn: 'Final Boss Arena: Overload the central core with 16 golden energy units!',
    subtitleAr: 'المرحلة النهائية: دمّر قلب النظام السيبراني بجمع 16 وحدة طاقة ذهبية!',
    targetCores: 16,
    timeLimit: 90,
    speedInterval: 185, // Smooth, agile boss speed
    themeColor: '#ff0055',
    skin: 'magma',
    foodTheme: 'golden',
    wallMode: 'solid',
    obstacles: [
      // The Central Core is high in the Far North (y=2..3), leaving columns 6..13 completely open!
      [9, 2], [10, 2],
      [9, 3], [10, 3],
      // Defense Satellite nodes along outer boundaries
      [3, 4], [16, 4],
      [3, 10], [16, 10],
      [3, 16], [16, 16],
      [6, 6], [13, 6]
    ]
  }
];
