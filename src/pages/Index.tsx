import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { TicketForm } from "@/components/TicketForm";
import { ClientForm } from "@/components/ClientForm";

interface Company {
  codigoEmpresa: number;
  nombre: string;
  anagrama: string;
  cifDni: string;
  email: string;
}

const normalizeCompanyValue = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

const Index = () => {
  const [ticketDate, setTicketDate] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketSeries, setTicketSeries] = useState("");
  const [ticketAmount, setTicketAmount] = useState("");
  const [nombreEmpresaParam, setNombreEmpresaParam] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);

      const fecha = params.get("fecha");
      const serie = params.get("Serie");
      const numTicket = params.get("NumTicket");
      const nombreEmpresa = params.get("nombreEmpresa");

      if (nombreEmpresa) {
        setNombreEmpresaParam(nombreEmpresa);
      }

      if (fecha) {
        if (fecha.includes("/")) {
          const parts = fecha.split("/");
          if (parts.length === 3) {
            setTicketDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        } else {
          setTicketDate(fecha);
        }
      }

      if (serie) setTicketSeries(serie);
      if (numTicket) setTicketNumber(numTicket);

      try {
        const res = await fetch(`${API_BASE_URL}/api/Empresa`);
        const data: Company[] = await res.json();
        setCompanies(data);

        if (data.length === 0) return;

        const normalizedParam = normalizeCompanyValue(nombreEmpresa);
        const matchedCompany = data.find((company) =>
          [company.nombre, company.anagrama, company.cifDni].some(
            (value) => normalizeCompanyValue(value) === normalizedParam,
          ),
        );

        setSelectedCompany((matchedCompany ?? data[0]).codigoEmpresa);
      } catch (err) {
        console.error("Error cargando empresas", err);
      }
    };

    init();
  }, [API_BASE_URL]);

  const empresaActual = useMemo(
    () => companies.find((company) => company.codigoEmpresa === selectedCompany) ?? null,
    [companies, selectedCompany],
  );

  const nombreEmpresa = empresaActual?.nombre ?? nombreEmpresaParam;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-4xl mx-auto px-4 pb-12">
          <div className="space-y-6">
            {companies.length > 0 && (
              <div className="card-elevated p-6 animate-fade-in-up">
                <label htmlFor="company" className="block font-medium mb-1">
                  Empresa
                </label>
                <select
                  id="company"
                  value={selectedCompany ?? ""}
                  onChange={(e) => setSelectedCompany(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {companies.map((company) => (
                    <option key={company.codigoEmpresa} value={company.codigoEmpresa}>
                      {company.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <TicketForm
              ticketDate={ticketDate}
              ticketNumber={ticketNumber}
              ticketSeries={ticketSeries}
              ticketAmount={ticketAmount}
              nombreEmpresa={nombreEmpresa}
              onTicketDateChange={setTicketDate}
              onTicketNumberChange={setTicketNumber}
              onTicketSeriesChange={setTicketSeries}
              onTicketAmountChange={setTicketAmount}
            />

            <ClientForm
              ticketDate={ticketDate}
              ticketNumber={ticketNumber}
              ticketSeries={ticketSeries}
              ticketAmount={ticketAmount}
              codigoEmpresa={empresaActual?.codigoEmpresa ?? null}
              nombreEmpresa={nombreEmpresa}
              cifDniEmpresa={empresaActual?.cifDni ?? ""}
              emailEmpresa={empresaActual?.email ?? ""}
            />
          </div>
        </main>

        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>Idesa © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
