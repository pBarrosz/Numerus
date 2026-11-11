import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DADOS_EXEMPLO, type Dados } from "./data";
import { carregarDadosPluggy, pluggyConfigurado, PERIODOS, type Periodo } from "./pluggy";

const KEY_ITEM = "numerus.pluggy.itemId";
const KEY_DIAS = "numerus.pluggy.dias";

type Estado = "exemplo" | "carregando" | "conectado" | "erro";

type Financas = {
  dados: Dados;
  estado: Estado;
  erro: string | null;
  configurado: boolean; // server has pluggy credentials
  itemId: string | null;
  dias: Periodo;
  setDias: (d: Periodo) => void;
  conectar: (itemId: string) => void;
  desconectar: () => void;
  atualizar: () => void;
};

const Ctx = createContext<Financas | null>(null);

function lerItem(): string | null {
  try {
    return localStorage.getItem(KEY_ITEM);
  } catch {
    return null;
  }
}

function lerDias(): Periodo {
  try {
    const v = Number(localStorage.getItem(KEY_DIAS));
    return (PERIODOS as readonly number[]).includes(v) ? (v as Periodo) : 30;
  } catch {
    return 30;
  }
}

function gravarItem(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY_ITEM, id);
    else localStorage.removeItem(KEY_ITEM);
  } catch {
    // storage unavailable — connection just won't survive a reload
  }
}

export function FinancasProvider({ children }: { children: ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(lerItem);
  const [dados, setDados] = useState<Dados>(DADOS_EXEMPLO);
  const [estado, setEstado] = useState<Estado>(itemId ? "carregando" : "exemplo");
  const [erro, setErro] = useState<string | null>(null);
  const [configurado, setConfigurado] = useState(false);
  const [versao, setVersao] = useState(0);
  const [dias, setDiasState] = useState<Periodo>(lerDias);

  const setDias = useCallback((d: Periodo) => {
    try {
      localStorage.setItem(KEY_DIAS, String(d));
    } catch {
      // ignore
    }
    setDiasState(d);
  }, []);

  useEffect(() => {
    pluggyConfigurado().then(setConfigurado);
  }, []);

  useEffect(() => {
    if (!itemId) {
      setDados(DADOS_EXEMPLO);
      setEstado("exemplo");
      return;
    }
    let ativo = true;
    setEstado("carregando");
    setErro(null);
    carregarDadosPluggy(itemId, dias)
      .then((d) => {
        if (!ativo) return;
        setDados(d);
        setEstado("conectado");
      })
      .catch((e: Error) => {
        if (!ativo) return;
        setDados(DADOS_EXEMPLO);
        setErro(e.message);
        setEstado("erro");
      });
    return () => {
      ativo = false;
    };
  }, [itemId, dias, versao]);

  const conectar = useCallback((id: string) => {
    gravarItem(id);
    setItemId(id);
    setVersao((v) => v + 1);
  }, []);

  const desconectar = useCallback(() => {
    gravarItem(null);
    setItemId(null);
    setErro(null);
  }, []);

  const atualizar = useCallback(() => setVersao((v) => v + 1), []);

  return <Ctx.Provider value={{ dados, estado, erro, configurado, itemId, dias, setDias, conectar, desconectar, atualizar }}>{children}</Ctx.Provider>;
}

export function useFinancas(): Financas {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinancas precisa do FinancasProvider");
  return ctx;
}
