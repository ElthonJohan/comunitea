/**
 * PictogramAssetCatalog.ts
 *
 * Mapa de vocabularyId → require() del PNG local en assets/pictogramas.
 * Solo se incluyen los ítems para los que existe un PNG con correspondencia clara.
 * El resto sigue mostrando emoji (comportamiento anterior).
 *
 * Uso:
 *   import { PICTOGRAM_ASSETS } from '../constants/PictogramAssetCatalog';
 *   const src = PICTOGRAM_ASSETS['manzana']; // ImageSourcePropType | undefined
 */
import { ImageSourcePropType } from 'react-native';

export const PICTOGRAM_ASSETS: Record<string, ImageSourcePropType> = {
  // ── FRUTAS ──────────────────────────────────────────────────────────────
  manzana:    require('../../../assets/pictogramas/Fruta 1.png'),
  platano:    require('../../../assets/pictogramas/Fruta 2.png'),
  fresas:     require('../../../assets/pictogramas/Fruta 3.png'),
  naranja:    require('../../../assets/pictogramas/Fruta 4.png'),
  mandarina:  require('../../../assets/pictogramas/Fruta 5.png'),
  pera:       require('../../../assets/pictogramas/Fruta 6.png'),
  uvas:       require('../../../assets/pictogramas/Fruta 7.png'),
  pina:       require('../../../assets/pictogramas/Fruta 8.png'),
  mango:      require('../../../assets/pictogramas/Fruta 9.png'),
  durazno:    require('../../../assets/pictogramas/Fruta 10.png'),
  sandia:     require('../../../assets/pictogramas/Fruta 11.png'),
  limon:      require('../../../assets/pictogramas/Fruta 12.png'),

  // ── VERDURAS ────────────────────────────────────────────────────────────
  lechuga:    require('../../../assets/pictogramas/Verdura 1.png'),
  zanahoria:  require('../../../assets/pictogramas/Verdura 2.png'),
  tomate:     require('../../../assets/pictogramas/Verdura 3.png'),
  pepino:     require('../../../assets/pictogramas/Verdura 4.png'),
  cebolla:    require('../../../assets/pictogramas/Verdura 5.png'),
  espinaca:   require('../../../assets/pictogramas/Verdura 6.png'),
  palta:      require('../../../assets/pictogramas/Verdura 7.png'),
  brocoli:    require('../../../assets/pictogramas/Verdura 8.png'),

  // ── TUBÉRCULOS ──────────────────────────────────────────────────────────
  'papa-vegetal': require('../../../assets/pictogramas/Tubérculo 1.png'),  // id 'papa' colisiona con persona
  yuca:       require('../../../assets/pictogramas/Tubérculo 2.png'),
  camote:     require('../../../assets/pictogramas/Tubérculo 3.png'),
  choclo:     require('../../../assets/pictogramas/Tubérculo 4.png'),

  // ── BEBIDAS ─────────────────────────────────────────────────────────────
  agua:           require('../../../assets/pictogramas/Bebidas 1.png'),
  jugo:           require('../../../assets/pictogramas/Bebidas 2.png'),
  chocolatada:    require('../../../assets/pictogramas/Bebidas 3.png'),
  limonada:       require('../../../assets/pictogramas/Bebidas 4.png'),
  gaseosa:        require('../../../assets/pictogramas/Bebidas 5.png'),
  'caja-de-jugo': require('../../../assets/pictogramas/Bebidas 6.png'),

  // ── LÁCTEOS ─────────────────────────────────────────────────────────────
  leche:          require('../../../assets/pictogramas/Lácteo 1.png'),
  mantequilla:    require('../../../assets/pictogramas/Lácteo 2.png'),
  queso:          require('../../../assets/pictogramas/Lácteo 3.png'),
  manjar:         require('../../../assets/pictogramas/Lácteo 5.png'),
  yogurt:         require('../../../assets/pictogramas/Lácteo 6.png'),

  // ── ALIMENTOS VARIOS ────────────────────────────────────────────────────
  pan:     require('../../../assets/pictogramas/Alimentos 1.png'),
  galleta: require('../../../assets/pictogramas/Alimentos 2.png'),
  gelatina:require('../../../assets/pictogramas/Alimentos 3.png'),

  // ── VESTIMENTA ──────────────────────────────────────────────────────────
  polo:       require('../../../assets/pictogramas/Vestimenta 1.png'),
  pantalon:   require('../../../assets/pictogramas/Vestimenta 2.png'),
  short:      require('../../../assets/pictogramas/Vestimenta 3.png'),
  vestido:    require('../../../assets/pictogramas/Vestimenta 4.png'),
  chompa:     require('../../../assets/pictogramas/Vestimenta 5.png'),
  falda:      require('../../../assets/pictogramas/Vestimenta 6.png'),
  medias:     require('../../../assets/pictogramas/Vestimenta 7.png'),
  gorro:      require('../../../assets/pictogramas/Vestimenta 8.png'),
  zapatillas: require('../../../assets/pictogramas/Vestimenta 9.png'),
  zapatos:    require('../../../assets/pictogramas/Vestimenta 10.png'),

  // ── IDENTIDAD / PERSONAS ────────────────────────────────────────────────
  nino:    require('../../../assets/pictogramas/Identidad 1.png'),
  nina:    require('../../../assets/pictogramas/Identidad 2.png'),
  papa:    require('../../../assets/pictogramas/Identidad 3.png'),
  mama:    require('../../../assets/pictogramas/Identidad 4.png'),
  familia: require('../../../assets/pictogramas/Identidad 5.png'),

  // ── EMOCIONES ───────────────────────────────────────────────────────────
  // Se usa la variante "niño" para todos; el adulto puede overridearlo.
  alegria:   require('../../../assets/pictogramas/Emociones 1.png'),
  tristeza:  require('../../../assets/pictogramas/Emociones 3.png'),
  enojo:     require('../../../assets/pictogramas/Emociones 5.png'),
  sorpresa:  require('../../../assets/pictogramas/Emociones 7.png'),
  miedo:     require('../../../assets/pictogramas/Emociones 9.png'),
  cansancio: require('../../../assets/pictogramas/Emociones 11.png'),
  // IDs usados en INTERMEDIO/AVANZADO
  feliz:     require('../../../assets/pictogramas/Emociones 1.png'),
  triste:    require('../../../assets/pictogramas/Emociones 3.png'),
  enojado:   require('../../../assets/pictogramas/Emociones 5.png'),
  asustado:  require('../../../assets/pictogramas/Emociones 9.png'),
  cansado:   require('../../../assets/pictogramas/Emociones 11.png'),

  // ── JUGUETES ────────────────────────────────────────────────────────────
  pelota:      require('../../../assets/pictogramas/Juguetes 1.png'),
  osito:       require('../../../assets/pictogramas/Juguetes 2.png'),
  carro:       require('../../../assets/pictogramas/Juguetes 3.png'),
  legos:       require('../../../assets/pictogramas/Juguetes 4.png'),
  dinosaurio:  require('../../../assets/pictogramas/Juguetes 5.png'),
  muneca:      require('../../../assets/pictogramas/Juguetes 6.png'),
  tren:        require('../../../assets/pictogramas/Juguetes 7.png'),
  plastilina:  require('../../../assets/pictogramas/Juguetes 8.png'),

  // ── RUTINAS ─────────────────────────────────────────────────────────────
  levantarse:      require('../../../assets/pictogramas/Rutina 1.png'),
  'cepillar-dientes': require('../../../assets/pictogramas/Rutina 2.png'),
  bano:            require('../../../assets/pictogramas/Rutina 3.png'),
  'lavar-cara':    require('../../../assets/pictogramas/Rutina 4.png'),
  vestirse:        require('../../../assets/pictogramas/Rutina 5.png'),
  desayunar:       require('../../../assets/pictogramas/Rutina 6.png'),
  colegio:         require('../../../assets/pictogramas/Rutina 7.png'),
  tarea:           require('../../../assets/pictogramas/Rutina 8.png'),
  'llegar-casa':   require('../../../assets/pictogramas/Rutina 9.png'),
  'bano-tina':     require('../../../assets/pictogramas/Rutina 10.png'),
  banarse:         require('../../../assets/pictogramas/Rutina 11.png'),
  'bañarse':       require('../../../assets/pictogramas/Rutina 11.png'),  // alias con tilde (id en VocabularyData)
  pijama:          require('../../../assets/pictogramas/Rutina 12.png'),
  dormir:          require('../../../assets/pictogramas/Rutina 13.png'),
  jugar:           require('../../../assets/pictogramas/Rutina 14.png'),

  // ── OBJETOS ─────────────────────────────────────────────────────────────
  libro:  require('../../../assets/pictogramas/Objeto 1.png'),
  tablet: require('../../../assets/pictogramas/Objeto 2.png'),
};

// Referencia informativa del catálogo original (no usada en la UI)
const pictogramas = [
  // BEBIDAS
  { picto: "Agua", descripcion: "Vaso con agua cristalina", archivo: "Bebidas 1.png" },
  { picto: "Jugo", descripcion: "Vaso con jugo de naranja", archivo: "Bebidas 2.png" },
  { picto: "Chocolatada", descripcion: "Taza de chocolatada caliente con un malvavisco", archivo: "Bebidas 3.png" },
  { picto: "Limonada", descripcion: "Vaso de limonada con rodajas de limón y popote", archivo: "Bebidas 4.png" },
  { picto: "Gaseosa", descripcion: "Botella de gaseosa o refresco de cola", archivo: "Bebidas 5.png" },
  { picto: "Caja de Jugo", descripcion: "Envase de cartón de jugo de naranja con popote", archivo: "Bebidas 6.png" },

  // EMOCIONES
  { picto: "Feliz (Niño)", descripcion: "Niño con expresión de alegría", archivo: "Emociones 1.png" },
  { picto: "Feliz (Niña)", descripcion: "Niña con expresión de alegría", archivo: "Emociones 2.png" },
  { picto: "Triste (Niño)", descripcion: "Niño con expresión de tristeza", archivo: "Emociones 3.png" },
  { picto: "Triste (Niña)", descripcion: "Niña con expresión de tristeza", archivo: "Emociones 4.png" },
  { picto: "Enojado (Niño)", descripcion: "Niño con expresión de enfado o molestia", archivo: "Emociones 5.png" },
  { picto: "Enojado (Niña)", descripcion: "Niña con expresión de enfado o molestia", archivo: "Emociones 6.png" },
  { picto: "Sorprendido (Niño)", descripcion: "Niño con expresión de asombro", archivo: "Emociones 7.png" },
  { picto: "Sorprendido (Niña)", descripcion: "Niña con expresión de asombro", archivo: "Emociones 8.png" },
  { picto: "Asustado (Niño)", descripcion: "Niño con expresión de temor o miedo", archivo: "Emociones 9.png" },
  { picto: "Asustado (Niña)", descripcion: "Niña con expresión de temor o miedo", archivo: "Emociones 10.png" },
  { picto: "Cansado (Niño)", descripcion: "Niño con expresión de agotamiento o sueño", archivo: "Emociones 11.png" },
  { picto: "Cansado (Niña)", descripcion: "Niña con expresión de agotamiento o sueño", archivo: "Emociones 12.png" },

  // FRUTAS
  { picto: "Manzana", descripcion: "Manzana roja madura con una hoja", archivo: "Fruta 1.png" },
  { picto: "Plátano", descripcion: "Fruta de plátano o banana amarilla", archivo: "Fruta 2.png" },
  { picto: "Fresa", descripcion: "Fresa roja con pequeñas semillas y hojas verdes", archivo: "Fruta 3.png" },
  { picto: "Naranja", descripcion: "Fruta de naranja entera con una hoja", archivo: "Fruta 4.png" },
  { picto: "Mandarina", descripcion: "Mandarina entera junto a un gajo suelto", archivo: "Fruta 5.png" },
  { picto: "Pera", descripcion: "Pera verde con dos hojas en el tallo", archivo: "Fruta 6.png" },
  { picto: "Uvas", descripcion: "Racimo de uvas moradas", archivo: "Fruta 7.png" },
  { picto: "Piña", descripcion: "Piña madura con sus hojas características", archivo: "Fruta 8.png" },
  { picto: "Mango", descripcion: "Mango maduro de color anaranjado con hojas", archivo: "Fruta 9.png" },
  { picto: "Durazno", descripcion: "Durazno o melocotón con hojas", archivo: "Fruta 10.png" },
  { picto: "Sandía", descripcion: "Sandía entera junto a una rebanada roja", archivo: "Fruta 11.png" },
  { picto: "Limón", descripcion: "Limón verde entero", archivo: "Fruta 12.png" },

  // IDENTIDAD
  { picto: "Niño", descripcion: "Niño con camiseta celeste", archivo: "Identidad 1.png" },
  { picto: "Niña", descripcion: "Niña con flor en su camiseta", archivo: "Identidad 2.png" },
  { picto: "Papá", descripcion: "Hombre joven con barba", archivo: "Identidad 3.png" },
  { picto: "Mamá", descripcion: "Mujer joven de cabello ondulado", archivo: "Identidad 4.png" },
  { picto: "Familia", descripcion: "Grupo familiar compuesto por papá, mamá e hijo", archivo: "Identidad 5.png" },

  // JUGUETES
  { picto: "Pelota", descripcion: "Pelota de colores (azul, rojo, amarillo, verde)", archivo: "Juguetes 1.png" },
  { picto: "Osito", descripcion: "Oso de peluche clásico de color café", archivo: "Juguetes 2.png" },
  { picto: "Carro", descripcion: "Carro deportivo de color rojo", archivo: "Juguetes 3.png" },
  { picto: "Legos", descripcion: "Cuatro bloques de construcción de diferentes colores", archivo: "Juguetes 4.png" },
  { picto: "Dinosaurio", descripcion: "Juguete de dinosaurio verde (cuello largo)", archivo: "Juguetes 5.png" },
  { picto: "Muñeca", descripcion: "Muñeca de trapo con vestido celeste", archivo: "Juguetes 6.png" },
  { picto: "Tren", descripcion: "Locomotora de juguete roja con vagones", archivo: "Juguetes 7.png" },
  { picto: "Masa Play-Doh", descripcion: "Bote de plastilina amarilla con tapa roja", archivo: "Juguetes 8.png" },

  // LÁCTEOS
  { picto: "Leche", descripcion: "Tarro o lata de leche con imagen de vaca", archivo: "Lácteo 1.png" },
  { picto: "Mantequilla", descripcion: "Barra de mantequilla en su empaque", archivo: "Lácteo 2.png" },
  { picto: "Queso", descripcion: "Trozo de queso amarillo con agujeros", archivo: "Lácteo 3.png" },
  { picto: "Mantequilla", descripcion: "Barra de mantequilla servida en un plato", archivo: "Lácteo 4.png" },
  { picto: "Manjar Blanco", descripcion: "Tazón con dulce de leche y una cuchara", archivo: "Lácteo 5.png" },
  { picto: "Yogurt", descripcion: "Envase de yogurt de fresa con cuchara", archivo: "Lácteo 6.png" },

  // OBJETOS
  { picto: "Libro", descripcion: "Libro abierto con ilustraciones infantiles", archivo: "Objeto 1.png" },
  { picto: "Tablet", descripcion: "Dispositivo tablet con iconos en pantalla", archivo: "Objeto 2.png" },

  // RUTINAS
  { picto: "Levantarse", descripcion: "Niño estirándose en la cama al amanecer", archivo: "Rutina 1.png" },
  { picto: "Cepillarse", descripcion: "Niño cepillándose los dientes frente al espejo", archivo: "Rutina 2.png" },
  { picto: "Baño", descripcion: "Niño sentado en el inodoro usando un taburete", archivo: "Rutina 3.png" },
  { picto: "Lavarse la cara", descripcion: "Niño lavándose la cara en el lavabo", archivo: "Rutina 4.png" },
  { picto: "Vestirse", descripcion: "Niño poniéndose su camiseta", archivo: "Rutina 5.png" },
  { picto: "Desayunar", descripcion: "Niño comiendo pan y plátano en la mesa", archivo: "Rutina 6.png" },
  { picto: "Ir al Colegio", descripcion: "Niño caminando con mochila hacia la escuela", archivo: "Rutina 7.png" },
  { picto: "Hacer Tarea", descripcion: "Niño escribiendo en su escritorio con mochila", archivo: "Rutina 8.png" },
  { picto: "Llegar a Casa", descripcion: "Niño entrando a su casa con mochila", archivo: "Rutina 9.png" },
  { picto: "Bañarse (Tina)", descripcion: "Niño dentro de una tina con agua y jabón", archivo: "Rutina 10.png" },
  { picto: "Bañarse (Ducha)", descripcion: "Niño bañándose bajo la regadera", archivo: "Rutina 11.png" },
  { picto: "Ponerse Pijama", descripcion: "Niño vistiéndose para dormir", archivo: "Rutina 12.png" },
  { picto: "Dormir", descripcion: "Niño durmiendo plácidamente de noche", archivo: "Rutina 13.png" },
  { picto: "Jugar", descripcion: "Niño sentado en el suelo jugando con bloques", archivo: "Rutina 14.png" },

  // VEGETALES (TUBÉRCULOS Y VERDURAS)
  { picto: "Papa", descripcion: "Papa marrón con un pequeño brote verde", archivo: "Tubérculo 1.png" },
  { picto: "Yuca", descripcion: "Raíz de yuca entera y una sección cortada", archivo: "Tubérculo 2.png" },
  { picto: "Camote", descripcion: "Camote morado entero y una sección naranja", archivo: "Tubérculo 3.png" },
  { picto: "Choclo", descripcion: "Mazorca de maíz tierno con hojas", archivo: "Tubérculo 4.png" },
  { picto: "Lechuga", descripcion: "Cabeza de lechuga verde fresca", archivo: "Verdura 1.png" },
  { picto: "Zanahoria", descripcion: "Zanahoria naranja con sus hojas verdes", archivo: "Verdura 2.png" },
  { picto: "Tomate", descripcion: "Tomate rojo redondo con tallo verde", archivo: "Verdura 3.png" },
  { picto: "Pepino", descripcion: "Pepino verde entero y una rodaja", archivo: "Verdura 4.png" },
  { picto: "Cebolla", descripcion: "Cebolla roja o morada entera", archivo: "Verdura 5.png" },
  { picto: "Espinaca", descripcion: "Manojo de hojas de espinaca verde", archivo: "Verdura 6.png" },
  { picto: "Palta", descripcion: "Palta o aguacate entero y una mitad con semilla", archivo: "Verdura 7.png" },
  { picto: "Brócoli", descripcion: "Cabeza de brócoli verde", archivo: "Verdura 8.png" },

  // ALIMENTOS VARIOS
  { picto: "Pan", descripcion: "Bollo de pan horneado", archivo: "Alimentos 1.png" },
  { picto: "Galleta", descripcion: "Galleta redonda con chispas de chocolate", archivo: "Alimentos 2.png" },
  { picto: "Gelatina", descripcion: "Porción de gelatina roja en tazón de vidrio", archivo: "Alimentos 3.png" },

  // VESTIMENTA
  { picto: "Polo", descripcion: "Camiseta de manga corta color azul", archivo: "Vestimenta 1.png" },
  { picto: "Pantalón", descripcion: "Pantalón largo de color beige", archivo: "Vestimenta 2.png" },
  { picto: "Short", descripcion: "Pantalón corto de color celeste", archivo: "Vestimenta 3.png" },
  { picto: "Vestido", descripcion: "Vestido de color rosa para niña", archivo: "Vestimenta 4.png" },
  { picto: "Chompa", descripcion: "Suéter amarillo con tejido de trenzas", archivo: "Vestimenta 5.png" },
  { picto: "Falda", descripcion: "Falda de color rojo", archivo: "Vestimenta 6.png" },
  { picto: "Medias", descripcion: "Par de calcetines de color verde agua", archivo: "Vestimenta 7.png" },
  { picto: "Gorro", descripcion: "Gorro de lana verde azulado con pompón", archivo: "Vestimenta 8.png" },
  { picto: "Zapatillas", descripcion: "Calzado deportivo de color durazno", archivo: "Vestimenta 9.png" },
  { picto: "Zapatos", descripcion: "Par de zapatos marrones de vestir", archivo: "Vestimenta 10.png" }
];