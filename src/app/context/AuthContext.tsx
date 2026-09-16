import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../types";
import { authService, type LoginRequest, type RegisterRequest, type User } from "../services/auth.service";
import { SESSION_EXPIRED_EVENT, tokenStorage } from "../services/api";
import { clientService, type ClienteResponse, type UpdateClientRequest } from "../services/client.service";
import { planDiarioService } from "../services/plan-diario.service";
import { setNotificationUser } from "../services/notifications";

function mergeClientProfile(currentUser: User, cliente: ClienteResponse): User {
  return {
    ...currentUser,
    clienteId: cliente.id,
    edad: cliente.edad,
    sexo: cliente.sexo,
    sexoBiologico: cliente.sexo,
    pesoKg: cliente.pesoKg,
    alturaCm: cliente.alturaCm,
    imc: cliente.imc,
    objetivoFisico: cliente.objetivoFisico,
    tipoObjetivoFisico: cliente.tipoObjetivoFisico,
    realizaActividadFisica: cliente.realizaActividadFisica,
    diasEntrenamientoSemana: cliente.diasEntrenamientoSemana,
    tipoActividadFisica: cliente.tipoActividadFisica,
    tipoEntrenamiento: cliente.tipoEntrenamiento,
    duracionPromedioSesionMinutos: cliente.duracionPromedioSesionMinutos,
    objetivoEnergetico: cliente.objetivoEnergetico,
  };
}

async function hydrateClientProfile(currentUser: User): Promise<User> {
  if (currentUser.rol !== "CLIENTE" || !currentUser.clienteId) return currentUser;
  const cliente = await clientService.get(currentUser.clienteId);
  return mergeClientProfile(currentUser, cliente);
}

interface AuthContextType {
  role: Role | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  profileComplete: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  completeProfile: (data: UpdateClientRequest) => Promise<void>;
  updateProfile: (data: UpdateClientRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function isClientProfileComplete(user: User | null | undefined) {
  return Boolean(
    user?.rol !== "CLIENTE" ||
    (user?.edad != null && user.edad > 0 && user?.pesoKg != null && user.pesoKg > 0 &&
      user?.alturaCm != null && user.alturaCm > 0 && user?.objetivoFisico?.trim() &&
      (user?.sexo ?? user?.sexoBiologico) && user?.realizaActividadFisica != null &&
      (!user.realizaActividadFisica || (
        user.diasEntrenamientoSemana != null && user.diasEntrenamientoSemana >= 1 &&
        Boolean(user.tipoActividadFisica?.trim()) && Boolean(user.tipoEntrenamiento?.trim()) &&
        user.duracionPromedioSesionMinutos != null && user.duracionPromedioSesionMinutos >= 1
      ))),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  const establishSession = useCallback((token: string, authenticatedUser: User, redirect = true) => {
    tokenStorage.set(token);
    setNotificationUser(authenticatedUser.id);
    setUser(authenticatedUser);
    setSessionExpired(false);
    if (redirect) navigate(
      authenticatedUser.rol === "ADMIN"
        ? "/admin/dashboard"
        : isClientProfileComplete(authenticatedUser) ? "/client/home" : "/client/profile",
      { replace: true },
    );
  }, [navigate]);

  const loadAuthenticatedUser = useCallback(async (token: string, redirect = true) => {
    tokenStorage.set(token);
    try {
      const authenticatedUser = await hydrateClientProfile(await authService.me());
      establishSession(token, authenticatedUser, redirect);
    } catch (error) {
      tokenStorage.clear();
      throw error;
    }
  }, [establishSession]);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    await loadAuthenticatedUser(response.token);
  }, [loadAuthenticatedUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authService.register(data);
    await loadAuthenticatedUser(response.token, false);
  }, [loadAuthenticatedUser]);

  const completeProfile = useCallback(async (data: UpdateClientRequest) => {
    if (!user?.clienteId) throw new Error("No se encontró el perfil de cliente.");
    const updatedClient = await clientService.update(user.clienteId, data);
    await planDiarioService.inicializar(
      user.clienteId,
      new Date().toLocaleDateString("sv-SE"),
    );
    const currentUser = await authService.me();
    setUser(mergeClientProfile(currentUser, updatedClient));
  }, [user]);

  const updateProfile = useCallback(async (data: UpdateClientRequest) => {
    if (!user?.clienteId) throw new Error("No se encontró el perfil de cliente.");
    const updatedClient = await clientService.update(user.clienteId, data, false);
    const currentUser = await authService.me();
    setUser(mergeClientProfile(currentUser, updatedClient));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user?.clienteId) return;
    const currentUser = await authService.me();
    const cliente = await clientService.get(user.clienteId);
    setUser(mergeClientProfile(currentUser, cliente));
  }, [user?.clienteId]);

  const logout = useCallback(async () => {
    setNotificationUser(null);
    tokenStorage.clear();
    setUser(null);
    setSessionExpired(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      if (!tokenStorage.get()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await hydrateClientProfile(await authService.me());
        if (active) { setNotificationUser(currentUser.id); setUser(currentUser); }
      } catch {
        tokenStorage.clear();
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const expire = () => {
      setNotificationUser(null);
      setUser(null);
      setSessionExpired(true);
      navigate("/login", { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      role: user?.rol ?? null,
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      sessionExpired,
      profileComplete: isClientProfileComplete(user),
      login,
      register,
      completeProfile,
      updateProfile,
      refreshProfile,
      logout,
      clearSessionExpired: () => setSessionExpired(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
