// Fast & Robust Devanagari to Romanized Hinglish Phonetic Transliterator
// Enables any English TTS engine (Microsoft David, Zira, Heera, etc.) to speak Hindi text
// instead of silently skipping Devanagari characters and only speaking numbers.

const vowels = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
};

const matras = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

const consonants = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy'
};

// Common Indian words with clean phonetic spelling for TTS engines
const wordOverrides = {
  'दक्षिण': 'Dakshin',
  'हरियाणा': 'Haryana',
  'बिजली': 'bijli',
  'वितरण': 'vitran',
  'निगम': 'nigam',
  'आधिकारिक': 'official',
  'घरेलू': 'gharelu',
  'खपत': 'khapat',
  'बिल': 'bill',
  'उपभोक्ता': 'upbhokta',
  'का': 'ka',
  'की': 'ki',
  'के': 'ke',
  'को': 'ko',
  'नाम': 'naam',
  'श्री': 'Shri',
  'श्रीमती': 'Shrimati',
  'है': 'hai',
  'हैं': 'hain',
  'और': 'aur',
  'संख्या': 'sankhya',
  'तारीख': 'tareekh',
  'जारी': 'jaari',
  'कुल': 'total',
  'देय': 'deya',
  'राशि': 'rashi',
  'दो': 'do',
  'हजार': 'hazaar',
  'चार': 'chaar',
  'सौ': 'sau',
  'पचास': 'pachaas',
  'रुपये': 'rupaye',
  'भरने': 'bharne',
  'अंतिम': 'antim',
  'तिथि': 'tithi',
  'यदि': 'agar',
  'आप': 'aap',
  'नियत': 'due',
  'पूर्व': 'pehle',
  'भुगतान': 'payment',
  'करते': 'karte',
  'तो': 'to',
  'विशेष': 'special',
  'छूट': 'discount rebate',
  'प्रदान': 'pradaan',
  'जाएगी': 'jaayegi',
  'पहले': 'pehle',
  'करने': 'karne',
  'पर': 'par',
  'आपको': 'aapko',
  'केवल': 'sirf',
  'देने': 'dene',
  'होंगे': 'honge',
  'बाद': 'baad',
  'विलंब': 'late',
  'शुल्क': 'fee charge',
  'लगेगा': 'lagega',
  'फोन-पे': 'PhonePe',
  'गूगल-पे': 'Google Pay',
  'या': 'ya',
  'नजदीकी': 'paas ke',
  'सब-डिवीजन': 'sub-division',
  'ऑफिस': 'office',
  'में': 'me',
  'नकद': 'cash',
  'किया': 'kiya',
  'जा': 'jaa',
  'सकता': 'sakta',
  'नवंबर': 'November',
  'दिसंबर': 'December',
  'जनवरी': 'January',
  'फरवरी': 'February',
  'मार्च': 'March',
  'अप्रैल': 'April',
  'मई': 'May',
  'जून': 'June',
  'जुलाई': 'July',
  'अगस्त': 'August',
  'सितंबर': 'September',
  'अक्टूबर': 'October',
  'राशन': 'ration',
  'पर्ची': 'parchi',
  'कार्ड': 'card',
  'मुफ्त': 'free',
  'किलोग्राम': 'kilogram',
  'गेहूं': 'gehun',
  'चावल': 'chawal',
  'लोन': 'loan',
  'स्वीकृति': 'approval',
  'पत्र': 'letter',
  'बैंक': 'bank',
  'शाखा': 'branch',
  'मासिक': 'monthly',
  'किस्त': 'EMI instalment',
  'दवा': 'medicine',
  'दवाएं': 'medicines',
  'डॉक्टर': 'doctor',
  'मरीज': 'patient',
  'अस्पताल': 'hospital'
};

export const hasDevanagari = (text) => {
  return /[\u0900-\u097F]/.test(text);
};

export const transliterateDevanagariToHinglish = (text) => {
  if (!text || typeof text !== 'string') return '';
  if (!hasDevanagari(text)) return text;

  // 1. Clean symbols
  let processed = text.replace(/₹/g, ' rupees ').replace(/#/g, ' number ');

  // 2. Word by word replacement with smart overrides
  const words = processed.split(/(\s+|[.,!?:;।()\-]+)/);
  
  return words.map(w => {
    const cleanWord = w.trim();
    if (!cleanWord) return w;

    // Check direct dictionary override
    if (wordOverrides[cleanWord]) {
      return wordOverrides[cleanWord];
    }

    if (!hasDevanagari(cleanWord)) {
      return w;
    }

    // Phonetic character by character transliteration
    let result = '';
    const chars = Array.from(cleanWord);
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const next = chars[i + 1];

      if (vowels[ch]) {
        result += vowels[ch];
      } else if (consonants[ch]) {
        const cPhonetic = consonants[ch];
        if (next && matras[next]) {
          result += cPhonetic + matras[next];
          i++; // skip matra
        } else if (next === '्') {
          result += cPhonetic;
          i++; // skip halant (half letter)
        } else if (next === 'ं') {
          result += cPhonetic + 'an';
          i++; // skip anusvara
        } else {
          // In Hindi, trailing consonant usually drops short 'a'
          const isLast = (i === chars.length - 1);
          result += cPhonetic + (isLast ? '' : 'a');
        }
      } else if (matras[ch]) {
        result += matras[ch];
      } else if (ch === 'ं') {
        result += 'n';
      } else if (ch === 'ः') {
        result += 'h';
      } else if (ch === '।') {
        result += '.';
      } else {
        result += ch;
      }
    }

    return result || w;
  }).join('');
};

