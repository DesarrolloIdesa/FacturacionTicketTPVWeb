import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TicketForm } from "@/components/TicketForm";
import { ClientForm } from "@/components/ClientForm";

const Index = () => {

  interface Company {
  codigoEmpresa: number;
  nombre: string;
  anagrama: string;
  cifDni: string;
}


  // Ticket data
  const [ticketDate, setTicketDate] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketSeries, setTicketSeries] = useState("");
  const [ticketAmount, setTicketAmount] = useState("");
  const [cifDNI, setCifDNI] = useState("");

  // Empresas
const [companies, setCompanies] = useState<Company[]>([]);
const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Cargar empresas desde la API al montar
useEffect(() => {
  const init = async () => {
    // 1️⃣ Leer parámetros URL
    const params = new URLSearchParams(window.location.search);

    const fecha = params.get("fecha");
    const serie = params.get("Serie");
    const numTicket = params.get("NumTicket");
    const cif = params.get("nombreEmpresa");
          if (cif) {
            setCifDNI(cif);
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

    // 2️⃣ Cargar empresas
    try {
      const res = await fetch(`${API_BASE_URL}/api/Empresa`);
      const data = await res.json();
      setCompanies(data);
      if (data.length > 0) setSelectedCompany(data[0].codigoEmpresa);
    } catch (err) {
      console.error("Error cargando empresas", err);
    }
  };

  init();
}, []);

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

            {/* Selector de empresa */}
           {/* <div>
              <label htmlFor="company" className="block font-medium mb-1">
                Empresa
              </label>
              <select
                id="company"
                value={selectedCompany ?? ""}
                onChange={(e) => setSelectedCompany(Number(e.target.value))}
                className="border rounded p-2 w-full"
              >
                {companies.map((c) => (
                  <option key={c.codigoEmpresa} value={c.codigoEmpresa}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div> */}


            {/* Ticket */}
            <TicketForm
              ticketDate={ticketDate}
              ticketNumber={ticketNumber}
              ticketSeries={ticketSeries}
              ticketAmount={ticketAmount}
              cifDNI={cifDNI}
              onTicketDateChange={setTicketDate}
              onTicketNumberChange={setTicketNumber}
              onTicketSeriesChange={setTicketSeries}
              onTicketAmountChange={setTicketAmount}
            />

            

            {/* Cliente + Generar factura */}
            <ClientForm
              ticketDate={ticketDate}
              ticketNumber={ticketNumber}
              ticketSeries={ticketSeries}
              ticketAmount={ticketAmount}
              cifDNI={cifDNI}
              //companyCode={selectedCompany} // <-- Pasamos la empresa seleccionada
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
