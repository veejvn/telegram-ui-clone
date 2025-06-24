import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RegistrationStore {
  registrationData: {
    username: string;
    password: string;
    email: string;
    client_secret?: string;
  } | null;
  setRegistrationData: (data: any) => void;
  clearRegistrationData: () => void;
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),
      clearRegistrationData: () => set({ registrationData: null }),
    }),
    {
      name: "registration-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

