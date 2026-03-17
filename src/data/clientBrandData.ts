// Base de Identidade Visual dos Clientes
// Banco de dados de marca – Agência

export interface BrandColor {
  hex: string;
  label: string;
}

export interface BrandFont {
  name: string;
  weights?: string[];
  note?: string;
}

export interface ClientBrandIdentity {
  typography: {
    primary?: BrandFont;
    secondary?: BrandFont;
    note?: string;
  };
  colors: BrandColor[];
  colorsNote?: string;
  brandConcept?: string[];
  slogan?: string;
  photoStyle?: string[];
  graphicElements?: string[];
  notes?: string;
  instagram?: string;
}

// Mapeamento por nome do cliente (normalizado em uppercase)
export const clientBrandDatabase: Record<string, ClientBrandIdentity> = {
  'SKX': {
    typography: {
      primary: {
        name: 'Chetta Vissto',
      },
      secondary: {
        name: 'Poppins',
        weights: ['Regular', 'Semibold', 'Bold'],
      },
    },
    colors: [
      { hex: '#132b58', label: 'Cor Primária' },
      { hex: '#ffffff', label: 'Cor Secundária' },
      { hex: '#f5f20e', label: 'Cor Destaque' },
    ],
    instagram: 'https://www.instagram.com/skxengenharia/',
  },

  'INSTITUTO DO ESPÍRITO': {
    typography: {
      primary: {
        name: 'Helvetica Neue',
        weights: ['Light', 'Bold'],
      },
      secondary: {
        name: 'IvyOra Text',
        weights: ['Medium Italic'],
      },
    },
    colors: [
      { hex: '#163ff', label: 'Cor Primária' },
      { hex: '#ffffff', label: 'Cor Secundária' },
    ],
    instagram: 'https://www.instagram.com/institutodoespiritoan/',
  },

  'ARA KETU': {
    typography: {
      note: 'A tipografia varia de acordo com o evento ou show.',
    },
    colors: [
      { hex: '#4169E1', label: 'Azul' },
      { hex: '#9370DB', label: 'Lilás' },
      { hex: '#ffffff', label: 'Branco' },
    ],
    colorsNote: 'A aplicação pode variar conforme identidade visual de cada evento.',
    instagram: 'https://www.instagram.com/araketu/',
  },

  'DURVAL': {
    typography: {
      primary: {
        name: 'Fontes pesadas / condensadas',
        note: 'A tipografia varia de acordo com o evento ou peça gráfica.',
      },
      secondary: {
        name: 'Poppins',
        note: 'Fontes leves',
      },
    },
    colors: [],
    colorsNote: 'A paleta varia de acordo com o evento ou campanha.',
    instagram: 'https://www.instagram.com/durvallelys/',
  },

  'AVA CLIN': {
    typography: {
      primary: {
        name: 'Catalina Village',
      },
      secondary: {
        name: 'Poppins',
        weights: ['Light', 'Semibold'],
      },
    },
    colors: [
      { hex: '#fde7d5', label: 'Cor Primária' },
      { hex: '#a86c37', label: 'Cor Secundária' },
    ],
    instagram: 'https://www.instagram.com/ava.clin/',
  },

  'BOO BURGER': {
    typography: {
      primary: {
        name: 'Arial',
        note: 'Tipografia sob responsabilidade do designer gráfico: Rafael Resende.',
      },
    },
    colors: [
      { hex: '#030100', label: 'Cor Primária' },
      { hex: '#e55601', label: 'Cor Secundária' },
      { hex: '#ffffff', label: 'Cor de Apoio' },
      { hex: '#cfa86d', label: 'Cor Complementar' },
    ],
    instagram: 'https://www.instagram.com/booburger.ba/',
  },

  'OLA MUSIC': {
    typography: {
      primary: {
        name: 'SF Display',
        weights: ['Regular', 'Bold'],
      },
    },
    colors: [
      { hex: '#3B82F6', label: 'Azul' },
      { hex: '#ffffff', label: 'Branco' },
    ],
    instagram: 'https://www.instagram.com/olamusicshows/',
  },

  'MARTOLI': {
    typography: {
      primary: {
        name: 'SF Display',
        weights: ['Regular', 'Bold'],
      },
    },
    colors: [
      { hex: '#066ba6', label: 'Cor Primária' },
      { hex: '#ffffff', label: 'Cor Secundária' },
      { hex: '#fc3138', label: 'Cor Destaque' },
    ],
    instagram: 'https://www.instagram.com/martoliprotecaoveicular/',
  },

  'BB STORE': {
    typography: {
      primary: {
        name: 'Poppins',
        weights: ['Light', 'Bold'],
      },
    },
    colors: [
      { hex: '#fd3a85', label: 'Cor Primária' },
      { hex: '#ffffff', label: 'Cor Secundária' },
    ],
    instagram: 'https://www.instagram.com/bbstore.online/',
  },

  'BB BRINDES': {
    typography: {
      primary: {
        name: 'Poppins',
        weights: ['Light', 'Bold'],
      },
    },
    colors: [
      { hex: '#1b4436', label: 'Cor Primária' },
      { hex: '#ffffff', label: 'Cor Secundária' },
    ],
    instagram: 'https://www.instagram.com/grupobbbrindes/',
  },

  'PURPLE HOUSE': {
    typography: {
      primary: {
        name: 'Redonda',
        note: 'Para títulos e chamadas',
      },
      secondary: {
        name: 'Outfit',
        note: 'Para textos e apoio',
      },
    },
    colors: [
      { hex: '#7c216f', label: 'Roxo (Principal)' },
      { hex: '#b0cf4d', label: 'Verde (Principal)' },
      { hex: '#eeb927', label: 'Amarelo (Apoio)' },
      { hex: '#f2f2f2', label: 'Off-white (Apoio)' },
    ],
    brandConcept: [
      'O símbolo da marca representa o açaí (produto principal), a mistura artesanal, e uma casa, representando conforto e identidade da marca.',
    ],
    slogan: 'Muito mais cremoso. Muito mais saboroso.',
    photoStyle: [
      'Reforçar desejo de consumo',
      'Destacar textura e cremosidade do produto',
      'Valorizar ingredientes e experiência do açaí',
    ],
    graphicElements: [
      'Pattern derivado do símbolo',
      'Grafismos orgânicos',
      'Backgrounds construídos a partir do símbolo',
    ],
    instagram: 'https://www.instagram.com/purplehouse.acai/',
  },
};

// Aliases de palavras-chave para cada entrada (toLowerCase, sem acentos)
const brandKeywordAliases: Record<string, string[]> = {
  'SKX':                   ['skx'],
  'INSTITUTO DO ESPÍRITO': ['instituto', 'espirito', 'espírito'],
  'ARA KETU':              ['ara ketu', 'araketu'],
  'DURVAL':                ['durval'],
  'AVA CLIN':              ['ava clin', 'avaclin', 'ava.clin'],
  'BOO BURGER':            ['boo burger', 'booburger', 'boo burguer', 'booburguer'],
  'OLA MUSIC':             ['ola music', 'olamusic', 'olá music', 'ola'],
  'MARTOLI':               ['martoli'],
  'BB STORE':              ['bb store', 'bbstore', 'bb store online'],
  'BB BRINDES':            ['bb brindes', 'bbbrindes', 'grupo bb', 'brindes'],
  'PURPLE HOUSE':          ['purple house', 'purplehouse'],
};

/**
 * Busca dados de identidade visual por nome do cliente.
 * Usa aliases de palavras-chave para matching flexível.
 */
export function getClientBrandIdentity(clientName: string): ClientBrandIdentity | null {
  const normalized = clientName.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove acentos

  // 1. Busca exata (sem acento, lowercase)
  for (const key of Object.keys(clientBrandDatabase)) {
    const keyNorm = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized === keyNorm) return clientBrandDatabase[key];
  }

  // 2. Busca por aliases
  for (const [dbKey, aliases] of Object.entries(brandKeywordAliases)) {
    for (const alias of aliases) {
      const aliasNorm = alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(aliasNorm) || aliasNorm.includes(normalized)) {
        return clientBrandDatabase[dbKey] ?? null;
      }
    }
  }

  return null;
}
