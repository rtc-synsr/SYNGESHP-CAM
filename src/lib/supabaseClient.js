/**
 * Client & Adaptateur Supabase pour l'écosystème RTC (SYNSR, SYNDEC, SYNREC, SYNGESE, SYNCRM)
 * Gère la connexion PostgreSQL/Supabase, l'authentification, le mode déconnecté et la synchronisation.
 */
import { createClient } from "@supabase/supabase-js";

// Clés de stockage local pour la configuration dynamique
const STORAGE_KEY_URL = "rtc_supabase_url";
const STORAGE_KEY_KEY = "rtc_supabase_anon_key";

/**
 * Récupère les identifiants Supabase actifs (soit depuis localStorage, soit depuis les variables d'environnement Vite)
 */
export function getSupabaseCredentials() {
  const customUrl = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const customKey = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const envUrl = import.meta.env?.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

  const url = customUrl || envUrl;
  const anonKey = customKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes("your-project-id") &&
    !anonKey.includes("your-anon-key") &&
    url.startsWith("https://")
  );

  return { url, anonKey, isConfigured, source: customUrl ? "custom" : "env" };
}

/**
 * Sauvegarde des identifiants personnalisés dans le navigateur
 */
export function saveCustomCredentials(url, key) {
  if (typeof window !== "undefined") {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

/**
 * Réinitialise les identifiants personnalisés
 */
export function clearCustomCredentials() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

/**
 * Crée ou réutilise l'instance du client Supabase
 */
let cachedClient = null;
let lastUrl = "";
let lastKey = "";

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: "public",
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.warn("Erreur lors de l'initialisation du client Supabase:", error);
    return null;
  }
}

/**
 * Teste la connectivité vers l'instance Supabase
 */
export async function testSupabaseConnection(overrideUrl = null, overrideKey = null) {
  try {
    const creds = getSupabaseCredentials();
    const url = overrideUrl || creds.url;
    const key = overrideKey || creds.anonKey;

    if (!url || !key || url.includes("your-project-id")) {
      return { success: false, message: "Identifiants Supabase non configurés." };
    }

    const tempClient = createClient(url, key);
    // Vérification de l'accès à l'API Rest / Auth
    const { data, error } = await tempClient.from("syncrm_contacts").select("count", { count: "exact", head: true });

    if (error) {
      // Si la table n'existe pas encore ou permission
      if (error.code === "PGRST116" || error.code === "42P01" || error.message.includes("relation")) {
        return {
          success: true,
          connected: true,
          tablesMissing: true,
          message: "Connecté à Supabase avec succès ! Note : Exécutez le script SQL dans Supabase pour créer les tables.",
        };
      }
      return {
        success: false,
        message: `Erreur Supabase (${error.code || "ERR"}): ${error.message}`,
      };
    }

    return {
      success: true,
      connected: true,
      tablesMissing: false,
      count: data ?? 0,
      message: "Connexion établie avec succès et schéma vérifié !",
    };
  } catch (err) {
    return {
      success: false,
      message: `Échec de connexion : ${err.message || "Serveur injoignable"}`,
    };
  }
}

/**
 * Utilitaires d'authentification Supabase
 */
export const supabaseAuth = {
  async signIn(email, password) {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase non connecté (mode local actif)");
    return await client.auth.signInWithPassword({ email, password });
  },

  async signUp(email, password, metadata = {}) {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase non connecté (mode local actif)");
    return await client.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
  },

  async signOut() {
    const client = getSupabaseClient();
    if (!client) return { error: null };
    return await client.auth.signOut();
  },

  async getSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async signInWithGoogle() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase non connecté");
    return await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
  },
};

/**
 * Utilitaires de synchronisation des données CRM <-> Supabase
 */
export const syncrmDatabase = {
  async fetchAll(tableName) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from(tableName).select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn(`[Supabase] Erreur fetchAll sur ${tableName}:`, error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn(`[Supabase] Exception fetchAll sur ${tableName}:`, e);
      return null;
    }
  },

  async insert(tableName, record) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from(tableName).insert([record]).select();
      if (error) {
        console.warn(`[Supabase] Erreur insert sur ${tableName}:`, error);
        return null;
      }
      return data?.[0] || null;
    } catch (e) {
      console.warn(`[Supabase] Exception insert sur ${tableName}:`, e);
      return null;
    }
  },

  async update(tableName, id, updates) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from(tableName).update(updates).eq("id", id).select();
      if (error) {
        console.warn(`[Supabase] Erreur update sur ${tableName}:`, error);
        return null;
      }
      return data?.[0] || null;
    } catch (e) {
      console.warn(`[Supabase] Exception update sur ${tableName}:`, e);
      return null;
    }
  },

  async delete(tableName, id) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from(tableName).delete().eq("id", id);
      return !error;
    } catch (e) {
      console.warn(`[Supabase] Exception delete sur ${tableName}:`, e);
      return false;
    }
  },
};
