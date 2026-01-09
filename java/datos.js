(() => {
  const storageKey = 'products';

  const defaultProducts = [
    {
      id: 1,
      name: 'Whisky Blue Label',
      price: 120000,
      category: 'Whisky',
      stock: 10,
      image: 'whiskey.jpg',
      description: 'Conocido por su suavidad aterciopelada y sabor excepcionalmente complejo, logrado a partir de whiskies muy raros y selectos; ofrece notas de frutos secos, miel, especias y un distintivo final ahumado, siendo ideal para ocasiones especiales y para degustar solo o con agua helada. ',
    },
    {
      id: 2,
      name: 'Ron Cacique',
      price: 70000,
      category: 'Ron',
      stock: 14,
      image: 'ron_cacique.jpg',
      description: ' Conocido por su suavidad y notas de frutas maduras, vainilla y madera, resultado de una mezcla de rones añejados en barricas de roble y destilados con métodos tradicionales, garantizando un sabor equilibrado y natural, ideal para disfrutar solo o en coctelería'
    },
    {
      id: 3,
      name: 'Vodka Bajo 0',
      price: 50000,
      category: 'Vodka',
      stock: 9,
      image: 'vodka.jpg',
      description: 'Extractos de frutos del bosque (fresa, frambuesa, mora), de color azul, con un 30% de alcohol, que ofrece un sabor natural y ligeramente dulce, ideal para tomar solo, con hielo o en cócteles refrescantes. '
    },
    {
      id: 4,
      name: 'Sangria Caroreña',
      price: 34000,
      category: 'Sangria',
      stock: 11,
      image: 'sangria.jpg',
      description: ' Ligera, refrescante y baja en alcohol (9.5° GL), elaborada por Cervecería Polar con vino y extractos de uvas y frutas naturales, ideal para el clima cálido, disponible en versiones tinta, blanca y rosada, y muy popular por su sabor equilibrado y facilidad para compartir. '
    },
    {
      id: 5,
      name: 'Tequila Don Julio',
      price: 45000,
      category: 'Tequila',
      stock: 18,
      image: 'tequila.jpg',
      description: ' Es un tequila premium mexicano, famoso por su suavidad y calidad, elaborado artesanalmente con 100% agave azul en Jalisco desde 1942, ofreciendo perfiles que van desde el fresco y cítrico Blanco hasta el complejo añejo, con versiones como el Reposado (vainilla, cítricos), Añejo (caramelo, roble) y 1942 (chocolate, caramelo), ideal para disfrutar solo o en cocteles de alta gama. '
    },
    {
      id: 6,
      name: 'Ron 5 Estrellas',
      price: 25000,
      category: 'Ron',
      stock: 20,
      image: 'ron_5_estrellas.jpg',
      description: 'Conocido por su dulzor a vainilla y caramelo, fácil de tomar solo o en cocteles como Cuba Libre, siendo una opción económica ideal para barras libres y mezclas, disponible en versiones Dorado y Blanco, y se caracteriza por ser un producto base de ron añejo con un sabor dulce y notas de caramelo.'
    },
    {
      id: 7,
      name: 'Ron Canaima',
      price: 30000,
      category: 'Ron',
      stock: 15,
      image: 'ron_canaima.jpg',
      description: 'Licor seco venezolano popular, conocido por ser una bebida jovial y versátil, ideal para coctelería, con versiones Blanca (más seca) y Dorada (con notas de vainilla y roble). Destaca por su sabor exótico y su capacidad para inspirar aventura, siendo una bebida de consumo masivo que se percibe suave y con cuerpo, aunque perdió su Denominación de Origen Controlada por no cumplir los requisitos mínimos de añejamiento para ser considerado "ron" tradicionalmente.'
    },
    {
      id: 8,
      name: 'Old Parr',
      price: 100000,
      category: 'Whisky',
      stock: 12,
      image: 'old parr.jpg',
      description: ' Whisky escocés blended de 12 años, famoso por su suavidad, equilibrio y notas dulces y especiadas, con un ligero toque ahumado, ideal para beber solo, con hielo o mezclado, destacando por su botella cuadrada y su nombre en honor a Thomas Parr, el hombre más longevo, y su popularidad en Latinoamérica y Japón. '

    }
  ];

  const safeParseJSON = (value, fallback) => {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getStoredProducts = () => {
    return safeParseJSON(localStorage.getItem(storageKey), null);
  };

  const seedProductsIfMissing = () => {
    const stored = getStoredProducts();
    if (Array.isArray(stored) && stored.length > 0) return stored;
    localStorage.setItem(storageKey, JSON.stringify(defaultProducts));
    return defaultProducts;
  };

  window.StoreData = {
    storageKey,
    defaultProducts,
    safeParseJSON,
    getStoredProducts,
    seedProductsIfMissing
  };
})();