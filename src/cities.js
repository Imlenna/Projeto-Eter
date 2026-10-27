// Cidades sugeridas no campo "Cidade", agrupadas por país. Coordenadas em graus decimais.
// Para acrescentar uma cidade, basta incluir { name, lat, lon } no país certo (ou criar um novo país).
// Cidades da lista não precisam de internet; qualquer outro texto digitado é buscado no geocodificador.
export const CITY_GROUPS = [
  { country: 'Brasil', cities: [
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 }, { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
    { name: 'Brasília', lat: -15.7939, lon: -47.8828 }, { name: 'Salvador', lat: -12.9777, lon: -38.5016 },
    { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 }, { name: 'Fortaleza', lat: -3.7319, lon: -38.5267 },
    { name: 'Curitiba', lat: -25.4284, lon: -49.2733 }, { name: 'Porto Alegre', lat: -30.0346, lon: -51.2177 },
    { name: 'Recife', lat: -8.0476, lon: -34.877 }, { name: 'Manaus', lat: -3.119, lon: -60.0217 },
    { name: 'Belém', lat: -1.4558, lon: -48.4902 }, { name: 'Florianópolis', lat: -27.5954, lon: -48.548 }
  ] },
  { country: 'Argentina', cities: [
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 }, { name: 'Córdoba', lat: -31.4201, lon: -64.1888 },
    { name: 'Mendoza', lat: -32.8895, lon: -68.8458 }, { name: 'Ushuaia', lat: -54.8019, lon: -68.303 }
  ] },
  { country: 'Chile', cities: [
    { name: 'Santiago', lat: -33.4489, lon: -70.6693 }, { name: 'Valparaíso', lat: -33.0472, lon: -71.6127 },
    { name: 'San Pedro de Atacama', lat: -22.9087, lon: -68.2002 }
  ] },
  { country: 'Uruguai', cities: [{ name: 'Montevidéu', lat: -34.9011, lon: -56.1645 }] },
  { country: 'Paraguai', cities: [{ name: 'Assunção', lat: -25.2637, lon: -57.5759 }] },
  { country: 'Bolívia', cities: [
    { name: 'La Paz', lat: -16.4897, lon: -68.1193 }, { name: 'Santa Cruz de la Sierra', lat: -17.7833, lon: -63.1821 }
  ] },
  { country: 'Peru', cities: [{ name: 'Lima', lat: -12.0464, lon: -77.0428 }, { name: 'Cusco', lat: -13.5319, lon: -71.9675 }] },
  { country: 'Colômbia', cities: [{ name: 'Bogotá', lat: 4.711, lon: -74.0721 }, { name: 'Medellín', lat: 6.2442, lon: -75.5812 }] },
  { country: 'Venezuela', cities: [{ name: 'Caracas', lat: 10.4806, lon: -66.9036 }] },
  { country: 'Equador', cities: [{ name: 'Quito', lat: -0.1807, lon: -78.4678 }] },
  { country: 'México', cities: [
    { name: 'Cidade do México', lat: 19.4326, lon: -99.1332 }, { name: 'Guadalajara', lat: 20.6597, lon: -103.3496 },
    { name: 'Cancún', lat: 21.1619, lon: -86.8515 }
  ] },
  { country: 'Cuba', cities: [{ name: 'Havana', lat: 23.1136, lon: -82.3666 }] },
  { country: 'Costa Rica', cities: [{ name: 'San José', lat: 9.9281, lon: -84.0907 }] },
  { country: 'Panamá', cities: [{ name: 'Cidade do Panamá', lat: 8.9824, lon: -79.5199 }] },
  { country: 'Estados Unidos', cities: [
    { name: 'Nova York', lat: 40.7128, lon: -74.006 }, { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298 }, { name: 'Miami', lat: 25.7617, lon: -80.1918 },
    { name: 'São Francisco', lat: 37.7749, lon: -122.4194 }, { name: 'Washington', lat: 38.9072, lon: -77.0369 },
    { name: 'Houston', lat: 29.7604, lon: -95.3698 }, { name: 'Honolulu', lat: 21.3069, lon: -157.8583 },
    { name: 'Anchorage', lat: 61.2181, lon: -149.9003 }
  ] },
  { country: 'Canadá', cities: [
    { name: 'Toronto', lat: 43.6532, lon: -79.3832 }, { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
    { name: 'Montreal', lat: 45.5017, lon: -73.5673 }
  ] },
  { country: 'Portugal', cities: [{ name: 'Lisboa', lat: 38.7223, lon: -9.1393 }, { name: 'Porto', lat: 41.1579, lon: -8.6291 }] },
  { country: 'Espanha', cities: [
    { name: 'Madri', lat: 40.4168, lon: -3.7038 }, { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
    { name: 'Sevilha', lat: 37.3891, lon: -5.9845 }
  ] },
  { country: 'França', cities: [
    { name: 'Paris', lat: 48.8566, lon: 2.3522 }, { name: 'Marselha', lat: 43.2965, lon: 5.3698 },
    { name: 'Lyon', lat: 45.764, lon: 4.8357 }
  ] },
  { country: 'Reino Unido', cities: [
    { name: 'Londres', lat: 51.5074, lon: -0.1278 }, { name: 'Edimburgo', lat: 55.9533, lon: -3.1883 },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426 }
  ] },
  { country: 'Irlanda', cities: [{ name: 'Dublin', lat: 53.3498, lon: -6.2603 }] },
  { country: 'Alemanha', cities: [
    { name: 'Berlim', lat: 52.52, lon: 13.405 }, { name: 'Munique', lat: 48.1351, lon: 11.582 },
    { name: 'Hamburgo', lat: 53.5511, lon: 9.9937 }
  ] },
  { country: 'Itália', cities: [
    { name: 'Roma', lat: 41.9028, lon: 12.4964 }, { name: 'Milão', lat: 45.4642, lon: 9.19 },
    { name: 'Veneza', lat: 45.4408, lon: 12.3155 }
  ] },
  { country: 'Países Baixos', cities: [{ name: 'Amsterdã', lat: 52.3676, lon: 4.9041 }] },
  { country: 'Bélgica', cities: [{ name: 'Bruxelas', lat: 50.8503, lon: 4.3517 }] },
  { country: 'Suíça', cities: [{ name: 'Zurique', lat: 47.3769, lon: 8.5417 }, { name: 'Genebra', lat: 46.2044, lon: 6.1432 }] },
  { country: 'Áustria', cities: [{ name: 'Viena', lat: 48.2082, lon: 16.3738 }] },
  { country: 'Suécia', cities: [{ name: 'Estocolmo', lat: 59.3293, lon: 18.0686 }] },
  { country: 'Noruega', cities: [{ name: 'Oslo', lat: 59.9139, lon: 10.7522 }, { name: 'Tromsø', lat: 69.6492, lon: 18.9553 }] },
  { country: 'Dinamarca', cities: [{ name: 'Copenhague', lat: 55.6761, lon: 12.5683 }] },
  { country: 'Finlândia', cities: [{ name: 'Helsinque', lat: 60.1699, lon: 24.9384 }] },
  { country: 'Islândia', cities: [{ name: 'Reykjavik', lat: 64.1466, lon: -21.9426 }] },
  { country: 'Polônia', cities: [{ name: 'Varsóvia', lat: 52.2297, lon: 21.0122 }] },
  { country: 'Grécia', cities: [{ name: 'Atenas', lat: 37.9838, lon: 23.7275 }] },
  { country: 'Turquia', cities: [{ name: 'Istambul', lat: 41.0082, lon: 28.9784 }, { name: 'Ancara', lat: 39.9334, lon: 32.8597 }] },
  { country: 'Rússia', cities: [{ name: 'Moscou', lat: 55.7558, lon: 37.6173 }, { name: 'São Petersburgo', lat: 59.9311, lon: 30.3609 }] },
  { country: 'Ucrânia', cities: [{ name: 'Kiev', lat: 50.4501, lon: 30.5234 }] },
  { country: 'Egito', cities: [{ name: 'Cairo', lat: 30.0444, lon: 31.2357 }] },
  { country: 'Marrocos', cities: [{ name: 'Marrakech', lat: 31.6295, lon: -7.9811 }, { name: 'Casablanca', lat: 33.5731, lon: -7.5898 }] },
  { country: 'África do Sul', cities: [{ name: 'Cidade do Cabo', lat: -33.9249, lon: 18.4241 }, { name: 'Joanesburgo', lat: -26.2041, lon: 28.0473 }] },
  { country: 'Nigéria', cities: [{ name: 'Lagos', lat: 6.5244, lon: 3.3792 }] },
  { country: 'Quênia', cities: [{ name: 'Nairóbi', lat: -1.2921, lon: 36.8219 }] },
  { country: 'Angola', cities: [{ name: 'Luanda', lat: -8.839, lon: 13.2894 }] },
  { country: 'Moçambique', cities: [{ name: 'Maputo', lat: -25.9692, lon: 32.5732 }] },
  { country: 'Israel', cities: [{ name: 'Jerusalém', lat: 31.7683, lon: 35.2137 }, { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818 }] },
  { country: 'Emirados Árabes Unidos', cities: [{ name: 'Dubai', lat: 25.2048, lon: 55.2708 }, { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773 }] },
  { country: 'Arábia Saudita', cities: [{ name: 'Riad', lat: 24.7136, lon: 46.6753 }, { name: 'Meca', lat: 21.3891, lon: 39.8579 }] },
  { country: 'Índia', cities: [
    { name: 'Nova Délhi', lat: 28.6139, lon: 77.209 }, { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 }
  ] },
  { country: 'China', cities: [
    { name: 'Pequim', lat: 39.9042, lon: 116.4074 }, { name: 'Xangai', lat: 31.2304, lon: 121.4737 },
    { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 }
  ] },
  { country: 'Japão', cities: [
    { name: 'Tóquio', lat: 35.6762, lon: 139.6503 }, { name: 'Quioto', lat: 35.0116, lon: 135.7681 },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023 }
  ] },
  { country: 'Coreia do Sul', cities: [{ name: 'Seul', lat: 37.5665, lon: 126.978 }] },
  { country: 'Tailândia', cities: [{ name: 'Bangkok', lat: 13.7563, lon: 100.5018 }] },
  { country: 'Singapura', cities: [{ name: 'Singapura', lat: 1.3521, lon: 103.8198 }] },
  { country: 'Indonésia', cities: [{ name: 'Jacarta', lat: -6.2088, lon: 106.8456 }, { name: 'Bali (Denpasar)', lat: -8.6705, lon: 115.2126 }] },
  { country: 'Filipinas', cities: [{ name: 'Manila', lat: 14.5995, lon: 120.9842 }] },
  { country: 'Vietnã', cities: [{ name: 'Hanói', lat: 21.0285, lon: 105.8542 }] },
  { country: 'Austrália', cities: [
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 }, { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
    { name: 'Perth', lat: -31.9505, lon: 115.8605 }
  ] },
  { country: 'Nova Zelândia', cities: [{ name: 'Auckland', lat: -36.8485, lon: 174.7633 }, { name: 'Wellington', lat: -41.2866, lon: 174.7756 }] }
];

// Sem acentos, minúsculo e sem espaços nas pontas, para comparar texto digitado com a lista.
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const cityLabel = (city, country) => `${city.name}, ${country}`;

// Procura uma cidade da lista a partir do texto do campo ("Tóquio", "Tóquio, Japão", "São Paulo, SP, Brasil"...).
export function findCity(text) {
  const n = norm(text);
  if (!n) return null;
  for (const g of CITY_GROUPS) {
    const country = norm(g.country);
    for (const c of g.cities) {
      const name = norm(c.name);
      if (n === name || n === `${name}, ${country}` || (n.startsWith(`${name},`) && n.endsWith(country))) {
        return { ...c, country: g.country };
      }
    }
  }
  return null;
}
