import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Hash, FileText } from "lucide-react";

interface TicketFormProps {
  ticketDate: string;
  ticketNumber: string;
  ticketSeries: string;
  ticketAmount: string;
  nombreEmpresa: string;
  onTicketDateChange: (value: string) => void;
  onTicketNumberChange: (value: string) => void;
  onTicketSeriesChange: (value: string) => void;
  onTicketAmountChange: (value: string) => void;
}

export const TicketForm = ({
  ticketDate,
  ticketNumber,
  ticketSeries,
  ticketAmount,
  nombreEmpresa,
  onTicketAmountChange,
}: TicketFormProps) => {
  return (
    <div className="card-elevated p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Datos del Ticket
        </h2>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="nombreEmpresa"
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          Nombre Empresa
        </Label>
        <Input
          id="nombreEmpresa"
          type="text"
          value={nombreEmpresa}
          readOnly
          className="transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="space-y-2">
          <Label htmlFor="ticketDate" className="text-sm font-medium text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            Fecha del Ticket
          </Label>
          <Input
            id="ticketDate"
            type="date"
            value={ticketDate}
            readOnly
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketSeries" className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Serie del Ticket
          </Label>
          <Input
            id="ticketSeries"
            type="text"
            value={ticketSeries}
            readOnly
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketNumber" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            Numero del Ticket
          </Label>
          <Input
            id="ticketNumber"
            type="text"
            value={ticketNumber}
            readOnly
            className="transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="ticketAmount"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            Importe
          </Label>
          <Input
            id="ticketAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej: 25,50"
            value={ticketAmount}
            onChange={(e) => {
              const value = e.target.value;

              if (/^\d*\.?\d{0,2}$/.test(value)) {
                onTicketAmountChange(value);
              }
            }}
            className="transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};
