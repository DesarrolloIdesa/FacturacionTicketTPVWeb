type MockCompany = {
  codigoEmpresa: number;
  nombre: string;
  anagrama: string | null;
  cifDni: string;
  email: string;
};

type MockProvinceApi = {
  codigoProvincia: string;
  provincia: string;
};

type MockMunicipalityApi = {
  codigoMunicipio: string;
  municipio: string;
};

type CreateInvoicePayload = {
  codigoEmpresa?: number | null;
  serieAlbaran?: string;
  tpvNumeroFactura?: number;
  fechaAlbaran?: string;
  importeTotal?: number;
  cifDniEmpresa?: string;
  dni?: string;
  siglaNacion?: string;
  razonSocial?: string;
  domicilio?: string;
  codigoPostal?: string;
  municipio?: string;
  codigoMunicipio?: string;
  provincia?: string;
  codigoProvincia?: string;
  nacion?: string;
  codigoNacion?: number;
  email?: string;
};

type StoredMockInvoice = CreateInvoicePayload & {
  id: string;
  createdAt: string;
};

const MOCK_STORAGE_KEY = "facturacion-ticket-tpv.mock.invoices";
const MOCK_LATENCY_MS = 300;

const MOCK_COMPANIES: MockCompany[] = [
  {
    codigoEmpresa: 1,
    nombre: "Empresa demo TPV",
    anagrama: "Demo TPV",
    cifDni: "B12345678",
    email: "rgpd@empresademotpv.local",
  },
  {
    codigoEmpresa: 2,
    nombre: "Bodegas Campos",
    anagrama: "Campos",
    cifDni: "B87654321",
    email: "privacidad@bodegascampos.local",
  },
  {
    codigoEmpresa: 3,
    nombre: "Supermercados Sierra Norte",
    anagrama: "Sierra Norte",
    cifDni: "A13579246",
    email: "datos@sierranorte.local",
  },
];

const MOCK_PROVINCES: MockProvinceApi[] = [
  { codigoProvincia: "14", provincia: "Cordoba" },
  { codigoProvincia: "28", provincia: "Madrid" },
  { codigoProvincia: "41", provincia: "Sevilla" },
];

const MOCK_MUNICIPALITIES: Record<string, MockMunicipalityApi[]> = {
  "14": [
    { codigoMunicipio: "14021", municipio: "Cordoba" },
    { codigoMunicipio: "14043", municipio: "Lucena" },
    { codigoMunicipio: "14054", municipio: "Montilla" },
  ],
  "28": [
    { codigoMunicipio: "28079", municipio: "Madrid" },
    { codigoMunicipio: "28148", municipio: "Pozuelo de Alarcon" },
    { codigoMunicipio: "28006", municipio: "Alcobendas" },
  ],
  "41": [
    { codigoMunicipio: "41091", municipio: "Sevilla" },
    { codigoMunicipio: "41038", municipio: "Dos Hermanas" },
    { codigoMunicipio: "41087", municipio: "Tomares" },
  ],
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const buildJsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    statusText: init?.statusText,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

const getRequestUrl = (input: RequestInfo | URL) => {
  if (input instanceof URL) return input;
  if (input instanceof Request) return new URL(input.url);
  return new URL(input.toString(), window.location.origin);
};

const getNormalizedPathname = (pathname: string) =>
  pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

const readStoredInvoices = (): StoredMockInvoice[] => {
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredMockInvoice[]) : [];
  } catch {
    return [];
  }
};

const writeStoredInvoices = (invoices: StoredMockInvoice[]) => {
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(invoices));
};

const parseJsonBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.clone().json()) as T;
  } catch {
    return null;
  }
};

const handleCreateInvoice = async (request: Request) => {
  const payload = await parseJsonBody<CreateInvoicePayload>(request);

  if (!payload) {
    return buildJsonResponse(
      { mensaje: "Mock API: cuerpo JSON invalido" },
      { status: 400 },
    );
  }

  const requiredFields = [
    payload.codigoEmpresa,
    payload.tpvNumeroFactura,
    payload.fechaAlbaran,
    payload.importeTotal,
    payload.cifDniEmpresa,
    payload.dni,
    payload.razonSocial,
    payload.domicilio,
    payload.codigoPostal,
    payload.codigoProvincia,
    payload.codigoMunicipio,
    payload.email,
  ];

  if (requiredFields.some((value) => value === null || value === undefined || value === "")) {
    return buildJsonResponse(
      { mensaje: "Mock API: faltan campos obligatorios para generar la factura" },
      { status: 400 },
    );
  }

  // Regla de error forzado para probar el popup de fallo sin tocar codigo:
  // si el numero de ticket es 999999, el mock responde con error de negocio.
  if (payload.tpvNumeroFactura === 999999) {
    return buildJsonResponse(
      { mensaje: "Mock API: numero de ticket reservado para probar errores" },
      { status: 409 },
    );
  }

  const storedInvoices = readStoredInvoices();
  const duplicate = storedInvoices.find(
    (invoice) =>
      invoice.codigoEmpresa === payload.codigoEmpresa &&
      invoice.serieAlbaran === payload.serieAlbaran &&
      invoice.tpvNumeroFactura === payload.tpvNumeroFactura,
  );

  if (duplicate) {
    return buildJsonResponse(
      { mensaje: "Mock API: ya existe una factura para ese ticket y empresa" },
      { status: 409 },
    );
  }

  const createdInvoice: StoredMockInvoice = {
    ...payload,
    id: `MOCK-${payload.codigoEmpresa}-${payload.serieAlbaran || "SIN-SERIE"}-${payload.tpvNumeroFactura}`,
    createdAt: new Date().toISOString(),
  };

  storedInvoices.push(createdInvoice);
  writeStoredInvoices(storedInvoices);

  return buildJsonResponse({
    mensaje: "Factura mock generada correctamente",
    idFactura: createdInvoice.id,
    createdAt: createdInvoice.createdAt,
  });
};

const handleMockRequest = async (request: Request) => {
  const url = getRequestUrl(request);
  const pathname = getNormalizedPathname(url.pathname);

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  await delay(MOCK_LATENCY_MS);

  if (request.method === "GET" && pathname === "/api/Empresa") {
    return buildJsonResponse(MOCK_COMPANIES);
  }

  if (request.method === "GET" && pathname === "/api/domicilio/provincias") {
    return buildJsonResponse(MOCK_PROVINCES);
  }

  if (request.method === "GET" && pathname.startsWith("/api/domicilio/municipios/")) {
    const provinceCode = pathname.split("/").pop() ?? "";
    return buildJsonResponse(MOCK_MUNICIPALITIES[provinceCode] ?? []);
  }

  if (request.method === "POST" && pathname === "/api/abono/crear") {
    return handleCreateInvoice(request);
  }

  return null;
};

export const enableMockApiIfNeeded = () => {
  const mocksEnabled =
    import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true";

  if (!mocksEnabled) return;

  const globalScope = window as Window & {
    __facturacionTicketMockApiEnabled?: boolean;
  };

  if (globalScope.__facturacionTicketMockApiEnabled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const mockedResponse = await handleMockRequest(request);

    if (mockedResponse) {
      return mockedResponse;
    }

    return originalFetch(input, init);
  };

  globalScope.__facturacionTicketMockApiEnabled = true;

  // Log breve para que el equipo vea claramente que esta trabajando contra mocks.
  console.info(
    "[mock-api] Mock local activo. Cambia VITE_USE_MOCK_API=false para volver a la API real.",
  );
};
