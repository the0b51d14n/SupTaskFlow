import { createContext, useContext } from "react";

type UserStore = {
  user: string | null;
  setUser: (u: string | null) => void;
};

export const UserContext = createContext<UserStore>({
  user: null,
  setUser: () => {},
});

export const useUserStore = () => useContext(UserContext);