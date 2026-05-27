"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Company, Store } from "@/types/database";
import { STORAGE_KEYS } from "@/lib/constants";

interface CompanyStoreContextValue {
  currentCompany: Company | null;
  currentStore: Store | null;
  companies: Company[];
  stores: Store[];
  setCurrentCompany: (company: Company) => Promise<void>;
  setCurrentStore: (store: Store) => void;
  isLoading: boolean;
  refreshStores: () => Promise<void>;
}

const CompanyStoreContext = createContext<
  CompanyStoreContextValue | undefined
>(undefined);

export function CompanyStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [currentCompany, setCurrentCompanyState] =
    useState<Company | null>(null);
  const [currentStore, setCurrentStoreState] = useState<Store | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const savedCompanyId = localStorage.getItem(
        STORAGE_KEYS.COMPANY_ID,
      );
      const savedStoreId = localStorage.getItem(
        STORAGE_KEYS.STORE_ID,
      );

      // Usa RPC security definer para evitar recursão infinita no RLS
      const { data: userCompanies } = await supabase
        .rpc("get_user_companies");

      const companiesList = ((userCompanies ?? []) as any[]).map(
        (c: any) =>
          ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            document: null,
            phone: null,
            email: null,
            logo_url: null,
            is_active: true,
            settings: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }) as Company,
      );
      setCompanies(companiesList);

      if (savedCompanyId && companiesList.length > 0) {
        const match = companiesList.find(
          (c) => c.id === savedCompanyId,
        );
        if (match) {
          setCurrentCompanyState(match);
          const { data: storeData } = await supabase
            .rpc("get_company_stores", {
              p_company_id: match.id,
            });

          const storeList = (storeData ?? []) as Store[];
          setStores(storeList);

          if (savedStoreId) {
            const storeMatch = storeList.find(
              (s) => s.id === savedStoreId,
            );
            if (storeMatch)
              setCurrentStoreState(storeMatch);
          }
        }
      }

      setIsLoading(false);
    }

    load();
  }, [supabase]);

  const setCurrentCompany = useCallback(
    async (company: Company) => {
      setCurrentCompanyState(company);
      setCurrentStoreState(null);
      localStorage.setItem(
        STORAGE_KEYS.COMPANY_ID,
        company.id,
      );
      localStorage.removeItem(STORAGE_KEYS.STORE_ID);
      const { data: storeData } = await supabase
        .rpc("get_company_stores", {
          p_company_id: company.id,
        });
      setStores((storeData ?? []) as Store[]);
      router.push("/select-store");
    },
    [router, supabase],
  );

  const setCurrentStore = useCallback(
    (store: Store) => {
      setCurrentStoreState(store);
      localStorage.setItem(STORAGE_KEYS.STORE_ID, store.id);
      router.push("/dashboard");
    },
    [router],
  );

  const refreshStores = useCallback(async () => {
    if (!currentCompany) return;
    const { data } = await supabase
      .rpc("get_company_stores", {
        p_company_id: currentCompany.id,
      });
    setStores((data ?? []) as Store[]);
  }, [currentCompany, supabase]);

  return (
    <CompanyStoreContext.Provider
      value={{
        currentCompany,
        currentStore,
        companies,
        stores,
        setCurrentCompany,
        setCurrentStore,
        isLoading,
        refreshStores,
      }}
    >
      {children}
    </CompanyStoreContext.Provider>
  );
}

export function useCompanyStore() {
  const ctx = useContext(CompanyStoreContext);
  if (!ctx)
    throw new Error(
      "useCompanyStore must be used within CompanyStoreProvider",
    );
  return ctx;
}
