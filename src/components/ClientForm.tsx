import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "lucide-react";
import {
  countries,
  getProvincesByCountry,
  getMunicipalitiesByProvince,
  Province,
  Municipality,
} from "@/data/locations";

export const validateDniCif = (
  value: string
): { valid: boolean; message?: string } => {
  if (!value) return { valid: false, message: "El DNI/CIF es obligatorio" };

  const v = value.trim().toUpperCase();

  if (/^\d{8}[A-Z]$/.test(v)) return validarDNI(v);
  if (/^[XYZ]\d{7}[A-Z]$/.test(v)) return validarNIE(v);
  if (/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) return validarCIF(v);

  return { valid: false, message: "Formato no valido" };
};

const validarDNI = (dni: string) => {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  return dni[8] === letras[parseInt(dni.substring(0, 8)) % 23]
    ? { valid: true }
    : { valid: false, message: "Letra de DNI incorrecta" };
};

const validarNIE = (nie: string) => {
  const map: Record<string, string> = { X: "0", Y: "1", Z: "2" };
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const num = parseInt(map[nie[0]] + nie.substring(1, 8));
  return nie[8] === letras[num % 23]
    ? { valid: true }
    : { valid: false, message: "Letra de NIE incorrecta" };
};

const validarCIF = (cif: string) => {
  const letras = "JABCDEFGHI";
  let suma = 0;

  for (let i = 1; i <= 7; i++) {
    let n = parseInt(cif[i]);
    if (i % 2 !== 0) {
      n *= 2;
      n = Math.floor(n / 10) + (n % 10);
    }
    suma += n;
  }

  const control = (10 - (suma % 10)) % 10;
  return cif[8] === control.toString() || cif[8] === letras[control]
    ? { valid: true }
    : { valid: false, message: "CIF invalido" };
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ClientFormProps {
  ticketDate: string;
  ticketNumber: string;
  ticketSeries: string;
  ticketAmount: string;
  codigoEmpresa: number | null;
  nombreEmpresa: string;
  cifDniEmpresa: string;
  emailEmpresa: string;
}

export const ClientForm = ({
  ticketDate,
  ticketNumber,
  ticketSeries,
  ticketAmount,
  codigoEmpresa,
  nombreEmpresa,
  cifDniEmpresa,
  emailEmpresa,
}: ClientFormProps) => {
  const [dni, setDni] = useState("");
  const [dniError, setDniError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("ES");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  const hasCompanyData = Boolean(
    codigoEmpresa !== null && nombreEmpresa && cifDniEmpresa && emailEmpresa,
  );

  const clausulaLegal = useMemo(() => {
    if (!hasCompanyData) {
      return "Selecciona una empresa valida para cargar la clausula legal.";
    }

    return (
      `En cumplimiento del RGPD (UE) 679/2016, la LOPDGDD 3/2018 y la LSSI-CE 34/2002, ` +
      `le informamos que sus datos son tratados por ${nombreEmpresa} (NIF ${cifDniEmpresa}) ` +
      `para la gestion de relaciones comerciales y administrativas. ` +
      `Puede ejercer sus derechos de acceso, rectificacion, supresion, oposicion, limitacion ` +
      `y portabilidad enviando un correo a ${emailEmpresa} con el asunto ` +
      `"Derechos Ley Proteccion de Datos" y copia de su DNI.`
    );
  }, [hasCompanyData, nombreEmpresa, cifDniEmpresa, emailEmpresa]);

  useEffect(() => {
    getProvincesByCountry(country).then(setProvinces);
  }, [country]);

  useEffect(() => {
    if (province) {
      getMunicipalitiesByProvince(province).then(setMunicipalities);
    }
  }, [province]);

  useEffect(() => {
    setRgpdAccepted(false);
  }, [codigoEmpresa, nombreEmpresa, cifDniEmpresa, emailEmpresa]);

  const isFormValid = useMemo(() => {
    return Boolean(
      validateDniCif(dni).valid &&
        name &&
        address &&
        postalCode &&
        email &&
        country &&
        province &&
        municipality &&
        ticketDate &&
        ticketNumber &&
        ticketAmount &&
        hasCompanyData
    );
  }, [
    dni,
    name,
    address,
    postalCode,
    email,
    country,
    province,
    municipality,
    ticketDate,
    ticketNumber,
    ticketSeries,
    ticketAmount,
    hasCompanyData,
  ]);

  const handleGenerateInvoice = async () => {
    setApiError(null);

    const dniValidation = validateDniCif(dni);
    if (!dniValidation.valid) {
      setDniError(dniValidation.message!);
      return;
    }

    if (!hasCompanyData || codigoEmpresa === null) {
      setApiError("Debes seleccionar una empresa valida");
      return;
    }

    if (!isFormValid) {
      setApiError("Debes rellenar todos los campos");
      return;
    }

    if (!rgpdAccepted) {
      setApiError("Debes aceptar la politica de privacidad");
      return;
    }

    const selectedProvince = provinces.find((p) => p.code === province);
    const selectedMunicipality = municipalities.find((m) => m.code === municipality);

    const payload = {
      codigoEmpresa,
      serieAlbaran: ticketSeries,
      tpvNumeroFactura: Number(ticketNumber),
      fechaAlbaran: new Date(ticketDate).toISOString(),
      importeTotal: parseFloat(ticketAmount),
      cifDniEmpresa,
      dni,
      siglaNacion: country,
      razonSocial: name,
      domicilio: address,
      codigoPostal: postalCode,
      municipio: selectedMunicipality?.name,
      codigoMunicipio: selectedMunicipality?.code,
      provincia: selectedProvince?.name,
      codigoProvincia: selectedProvince?.code,
      nacion: "ESPAÑA",
      codigoNacion: 108,
      email,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/abono/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || "Error inesperado");
      }

      setSuccessOpen(true);
    } catch (e: any) {
      setApiError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated p-6 space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Datos del Cliente</h2>
      </div>

      <Input placeholder="CIF / DNI" value={dni} onChange={(e) => setDni(e.target.value.toUpperCase())} />
      {dniError && <p className="text-red-600 text-sm">{dniError}</p>}

      <Input placeholder="Nombre / Razon Social" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Correo electronico" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Domicilio" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Input placeholder="Codigo Postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />

      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={province} onValueChange={setProvince}>
        <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
        <SelectContent>
          {provinces.map((p) => (
            <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={municipality} onValueChange={setMunicipality}>
        <SelectTrigger><SelectValue placeholder="Municipio" /></SelectTrigger>
        <SelectContent>
          {municipalities.map((m) => (
            <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-start">
        <div className="flex items-start gap-2 flex-1">
          <Checkbox
            id="rgpd-checkbox"
            checked={rgpdAccepted}
            onCheckedChange={(checked) => setRgpdAccepted(checked === true)}
            className="mt-1 shrink-0"
          />
          <Label
            htmlFor="rgpd-checkbox"
            className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
          >
            {clausulaLegal}
          </Label>
        </div>

        <div className="shrink-0 md:self-end">
          <Button
            disabled={!rgpdAccepted || loading}
            onClick={handleGenerateInvoice}
          >
            {loading ? "Generando..." : "Generar factura"}
          </Button>
        </div>
      </div>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Factura generada</AlertDialogTitle>
            <AlertDialogDescription>
              La factura llegara al correo electronico indicado en menos de 24 horas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!apiError} onOpenChange={() => setApiError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {apiError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setApiError(null)}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
