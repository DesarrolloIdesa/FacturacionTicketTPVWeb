import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enableMockApiIfNeeded } from "./mocks/mockApi.ts";

// Mock local solo para desarrollo. Se activa con VITE_USE_MOCK_API=true.
// En build/produccion no se ejecuta porque el bootstrap lo protege con import.meta.env.DEV.
enableMockApiIfNeeded();

createRoot(document.getElementById("root")!).render(<App />);
