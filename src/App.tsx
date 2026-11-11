import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Painel from "./pages/Painel";
import Transacoes from "./pages/Transacoes";
import Categorias from "./pages/Categorias";
import Metas from "./pages/Metas";
import Assistente from "./pages/Assistente";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Painel />} />
        <Route path="transacoes" element={<Transacoes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="metas" element={<Metas />} />
        <Route path="assistente" element={<Assistente />} />
      </Route>
    </Routes>
  );
}
