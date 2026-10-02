// Fallback hero slides, used only if the admin hasn't configured any (Homepage Manager > Hero).
export const HERO_SLIDES = [
  {
    title: 'Breathe Divine Spirituality',
    subtitle: 'Curated sacred artifacts, meticulously energized through ancient Vedic rituals.',
    image: 'https://images.unsplash.com/photo-1545061930-bc9945f74234?auto=format&fit=crop&q=80&w=1920',
    mobileImage: 'https://images.unsplash.com/photo-1545061930-bc9945f74234?auto=format&fit=crop&q=80&w=768&h=1366&crop=center',
    tagline: 'Authentic Sanatan Artifacts',
  },
  {
    title: 'Awaken Your Inner Power',
    subtitle: 'Himalayan Rudraksha seeds hand-knotted by elders for spiritual resonance.',
    image: 'https://images.unsplash.com/photo-1626125342332-d3b3619069c6?auto=format&fit=crop&q=80&w=1920',
    mobileImage: 'https://images.unsplash.com/photo-1626125342332-d3b3619069c6?auto=format&fit=crop&q=80&w=768&h=1366&crop=center',
    tagline: 'Energized Rudraksha Collections',
  },
  {
    title: 'Sacred Spaces, Timeless Joy',
    subtitle: 'Temple-grade brass idols and gold-plated yantras for your home sanctuary.',
    image: 'https://images.unsplash.com/photo-1609139006217-c1d7cc6a6291?auto=format&fit=crop&q=80&w=1920',
    mobileImage: 'https://images.unsplash.com/photo-1609139006217-c1d7cc6a6291?auto=format&fit=crop&q=80&w=768&h=1366&crop=center',
    tagline: 'Elite Divine Collection',
  },
];

export const FAQS = [
  {
    question: 'Are your products authentically energized?',
    answer: "Yes, all our 'Energized' artifacts undergo a traditional Prana Pratishta ritual performed by Vedic scholars. This involves specific mantra chanting and rituals to invoke the divine essence into the item.",
  },
  {
    question: 'How do I choose the right Rudraksha for me?',
    answer: 'Selecting a Rudraksha depends on your birth chart and current life goals. 5 Mukhi is generally suitable for everyone, while specific Mukhis (1-21) target unique planetary influences. We recommend a consultation with our Vedic experts.',
  },
  {
    question: 'What is your return policy on sacred items?',
    answer: "Due to the spiritual and energized nature of our products, we typically do not accept returns once a ritual has been performed in the customer's name. However, we ensure 100% replacement for any items damaged during transit.",
  },
];

export const TESTIMONIALS = [
  { name: 'Rajesh Kumar',     location: 'Delhi',      text: 'The brass Ganesha idol is exceptional. It has brought such a peaceful energy to my home temple. Truly authentic craftsmanship!' },
  { name: 'Priya Sharma',     location: 'Mumbai',     text: 'My 5 Mukhi Rudraksha mala arrived beautifully packed and energized. I can feel the difference in my morning meditation. Highly recommended.' },
  { name: 'Anand Verma',      location: 'Bengaluru',  text: 'The Shree Yantra is pure gold-plated perfection. Our family puja room feels completely transformed. Divine quality!' },
  { name: 'Meera Iyer',       location: 'Chennai',    text: 'Fast delivery, excellent packaging and the crystals were exactly as described. The rose quartz brought such calm to my workspace.' },
  { name: 'Suresh Nair',      location: 'Kochi',      text: 'Ordered the Navgraha kit for my father. The quality is temple-grade, every item energized properly. He was extremely pleased.' },
  { name: 'Kavya Reddy',      location: 'Hyderabad',  text: 'The copper Kalash set is absolutely stunning. Customer support was patient with all my questions. Will definitely order again!' },
  { name: 'Amit Joshi',       location: 'Pune',       text: 'Received my Himalayan singing bowl and it produces the most resonant, pure sound. The vibrations during meditation are incredible.' },
  { name: 'Deepa Menon',      location: 'Kolkata',    text: 'The rudraksha bracelet I gifted my mother brought her to tears — she said it felt like it was already blessed. Superb quality.' },
  { name: 'Vikram Singh',     location: 'Jaipur',     text: 'The panchaloha idol is a masterpiece. I compared it with other stores and this is by far the most authentic and finest finish.' },
  { name: 'Sunita Agarwal',   location: 'Lucknow',    text: 'Crystaura is my go-to for all spiritual products. Every item I have bought has been genuine, well-energized and beautifully presented.' },
];

// Emoji override maps ensure correct rendering on all Android versions.
// Zodiac symbols need U+FE0F (variation selector-16) to force emoji presentation
// instead of rendering as filled text glyphs. Shield (🛡️) is absent from older
// Android system fonts so we substitute 🔐 which has been supported since Unicode 6.0.
export const PURPOSE_ICON_MAP: Record<string, string> = {
  Wealth: '💰',
  Love: '❤️',
  Health: '🌿',
  Luck: '🍀',
  Protection: '🔐',
  Peace: '🕊️',
  Courage: '🦁',
  Balance: '⚖️',
};

export const RASHI_ICON_MAP: Record<string, string> = {
  Aries: '♈️',
  Taurus: '♉️',
  Gemini: '♊️',
  Cancer: '♋️',
  Leo: '♌️',
  Virgo: '♍️',
  Libra: '♎️',
  Scorpio: '♏️',
  Sagittarius: '♐️',
  Capricorn: '♑️',
  Aquarius: '♒️',
  Pisces: '♓️',
};
