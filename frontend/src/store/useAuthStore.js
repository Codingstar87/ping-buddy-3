import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // generateOTP: async (data) => {
  //   set({ isSigningUp: true });cd
  //   try {
  //     const res = await axiosInstance.post("/auth/forgot-password", data);
  //     // set({ authUser: res.data });
  //     toast.success("OTP Generated successfully");
  //     // get().connectSocket();
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isSigningUp: false });
  //   }
  // },


  generateOTP: async (data, onSuccess) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      onSuccess()
      toast.success("OTP Generated successfully. Please check your email.");
    } catch (error) {
      // Handle specific and generic errors
      if (error.response) {
        toast.error(error.response.data.message || "Failed to generate OTP. Please try again.");
      } else if (error.request) {
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error("Error in generateOTP:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // VerifyOTP: async (data) => {
  //   set({ isSigningUp: true });
  //   try {
  //     const res = await axiosInstance.post("/auth/verify-otp", data);
  //     set({ authUser: res.data });
  //     toast.success("OTP Verified successfully");
  //     toast.success("Login successfully");
  //     get().connectSocket();
  //   } catch (error) {
  //     console.log("error sending otp");
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isSigningUp: false });
  //   }
  // },


  VerifyOTP: async (data, onSuccess) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ authUser: res.data });
      toast.success("OTP Verified successfully.");
      toast.success("Login successful!");
      get().connectSocket();
      onSuccess();
    } catch (error) {
      // Handle specific and generic errors
      if (error.response) {
        toast.error(error.response.data.message || "Failed to verify OTP. Please try again.");
      } else if (error.request) {
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error("Error in VerifyOTP:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));