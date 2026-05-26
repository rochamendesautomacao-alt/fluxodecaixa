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
  setCurrentCompany: (company: Company) => void;
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

      const { data: userCompanies } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      const companiesList = (userCompanies ??
        []) as Company[];
      setCompanies(companiesList);

      if (savedCompanyId && companiesList.length > 0) {
        const match = companiesList.find(
          (c) => c.id === savedCompanyId,
        );
        if (match) {
          setCurrentCompanyState(match);
          const { data: storeData } = await supabase
            .from("stores")
            .select("*")
            .eq("company_id", match.id)
            .order("name");

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
    (company: Company) => {
      setCurrentCompanyState(company);
      setCurrentStoreState(null);
      setStores([]);
      localStorage.setItem(
        STORAGE_KEYS.COMPANY_ID,
        company.id,
      );
      localStorage.removeItem(STORAGE_KEYS.STORE_ID);
      router.push("/select-store");
    },
    [router],
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
      .from("stores")
      .select("*")
      .eq("company_id", currentCompany.id)
      .order("name");
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
