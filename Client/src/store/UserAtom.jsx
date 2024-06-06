import { atom, selector, useRecoilState, useSetRecoilState } from "recoil";
import axios from "axios";
import { useEffect } from "react";

// Define the UserAtom to store user data
export const UserAtom = atom({
  key: "UserAtom",
  default: null,
});

// Define a selector to fetch user data
export const UserSelector = selector({
  key: "UserSelector",
  get: async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCALHOST}/auth/user/me`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
});

// Component to fetch and set the user data
const FetchUser = () => {
  const setUser = useSetRecoilState(UserAtom);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await UserSelector.get();
      setUser(user);
    };
    fetchUser();
  }, []);

  return null;
};

export default FetchUser;
