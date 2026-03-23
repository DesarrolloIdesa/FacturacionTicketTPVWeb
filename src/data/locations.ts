export interface Country {
  code: string;
  name: string;
}

export const countries: Country[] = [
  { code: "ES", name: "España" }
];

// 🔹 Respuesta real del backend
interface ProvinceApi {
  codigoProvincia: string;
  provincia: string;
}

// 🔹 Modelo que usa el frontend
export interface Province {
  code: string;
  name: string;
  countryCode: string;
}

export interface Municipality {
  code: string;
  name: string;
  provinceCode: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Provincias desde API
export const getProvincesByCountry = async (
  countryCode: string
): Promise<Province[]> => {
  const response = await fetch(`${API_BASE_URL}/api/domicilio/provincias`);

  console.log("URL provincias:", response.url);

  if (!response.ok) {
    const text = await response.text();
    console.error("Error API provincias:", text);
    throw new Error("Error cargando provincias");
  }

  const data: ProvinceApi[] = await response.json();

  return data.map((p) => ({
    code: p.codigoProvincia,
    name: p.provincia,
    countryCode: countryCode,
  }));
};

// ✅ Municipios desde API
export const getMunicipalitiesByProvince = async (
  provinceCode: string
): Promise<Municipality[]> => {
  const response = await fetch(`${API_BASE_URL}/api/domicilio/municipios/${provinceCode}`);

  if (!response.ok) {
    const text = await response.text();
    console.error("Error API municipios:", text);
    throw new Error("Error cargando municipios");
  }

  const data: { codigoMunicipio: string; municipio: string }[] = await response.json();

  return data.map((m) => ({
    code: m.codigoMunicipio,
    name: m.municipio,
    provinceCode: provinceCode,
  }));
};
