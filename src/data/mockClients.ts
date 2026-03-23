export interface Client {
  cif: string;
  name: string;
  address: string;
  postalCode: string;
  country: string;
  province: string;
  municipality: string;
  email: string;
}

// Mock database of existing clients
/* export const mockClients: Client[] = [
  {
    cif: "B12345678",
    name: "Restaurante Voltereta S.L.",
    address: "Calle Mayor 123",
    postalCode: "28001",
    country: "ES",
    province: "ES-M",
    municipality: "ES-M-001",
    email: "info@voltereta.com",
  },
  {
    cif: "A87654321",
    name: "Empresa Ejemplo S.A.",
    address: "Avenida Principal 456",
    postalCode: "08001",
    country: "ES",
    province: "ES-B",
    municipality: "ES-B-001",
    email: "contacto@ejemplo.es",
  },
  {
    cif: "12345678A",
    name: "Juan García López",
    address: "Plaza España 7",
    postalCode: "46001",
    country: "ES",
    province: "ES-V",
    municipality: "ES-V-001",
    email: "juan.garcia@email.com",
  },
  {
    cif: "98765432B",
    name: "María Fernández Ruiz",
    address: "Calle Sierpes 45",
    postalCode: "41001",
    country: "ES",
    province: "ES-SE",
    municipality: "ES-SE-001",
    email: "maria.fernandez@email.com",
  },
];

export const findClientByCif = (cif: string): Client | undefined => {
  return mockClients.find(
    (client) => client.cif.toUpperCase() === cif.toUpperCase()
  );
};*/
