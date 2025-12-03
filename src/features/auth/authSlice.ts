import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  User,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchProfile,
  updateHeadline as apiUpdateHeadline,
  updateAvatar as apiUpdateAvatar,
  updateEmail as apiUpdateEmail,
  updatePhone as apiUpdatePhone,
  updateZipcode as apiUpdateZipcode,
  updatePassword as apiUpdatePassword,
} from "../../services/api";

export interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loginError: string | null;
  registrationError: string | null;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  zipcode?: string;
  password?: string;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  loginError: null,
  registrationError: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: any, { rejectWithValue }) => {
    try {
      await apiLogin(username, password);
      const user = await fetchProfile();
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: any, { rejectWithValue }) => {
    try {
      await apiRegister(payload);
      // Auto login after register? Or just return success?
      // The backend register returns { result: 'success', username }
      // We might need to login separately or the backend sets cookie on register?
      // Backend register does NOT set cookie.
      // So we need to login.
      await apiLogin(payload.username, payload.password);
      const user = await fetchProfile();
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await apiLogout();
});

export const updateHeadline = createAsyncThunk(
  "auth/updateHeadline",
  async (headline: string, { rejectWithValue }) => {
    try {
      const res = await apiUpdateHeadline(headline);
      return res.headline;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await apiUpdateAvatar(formData);
      return res.avatar;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEmail = createAsyncThunk(
  "auth/updateEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await apiUpdateEmail(email);
      return res.email;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePhone = createAsyncThunk(
  "auth/updatePhone",
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await apiUpdatePhone(phone);
      return res.phone;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateZipcode = createAsyncThunk(
  "auth/updateZipcode",
  async (zipcode: string, { rejectWithValue }) => {
    try {
      const res = await apiUpdateZipcode(zipcode);
      return res.zipcode;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (password: string, { rejectWithValue }) => {
    try {
      const res = await apiUpdatePassword(password);
      return res.result;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: ProfileUpdatePayload, { rejectWithValue }) => {
    try {
      if (payload.email) await apiUpdateEmail(payload.email);
      if (payload.phone) await apiUpdatePhone(payload.phone);
      if (payload.zipcode) await apiUpdateZipcode(payload.zipcode);
      if (payload.password) await apiUpdatePassword(payload.password);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Check if user is already logged in (e.g. on refresh)
// We can try to fetch profile. If it fails (401), we are not logged in.
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await fetchProfile();
      return user;
    } catch (err) {
      return rejectWithValue("Not logged in");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthErrors(state) {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.loginError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.loginError = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.loginError = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.registrationError = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.registrationError = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.registrationError = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.status = "failed";
      })
      .addCase(updateHeadline.fulfilled, (state, action) => {
        if (state.user) {
          state.user.headline = action.payload;
        }
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload;
        }
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.payload;
        }
      })
      .addCase(updatePhone.fulfilled, (state, action) => {
        if (state.user) {
          state.user.phone = action.payload;
        }
      })
      .addCase(updateZipcode.fulfilled, (state, action) => {
        if (state.user) {
          state.user.zipcode = action.payload;
        }
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        // Password updated
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          if (action.payload.email) state.user.email = action.payload.email;
          if (action.payload.phone) state.user.phone = action.payload.phone;
          if (action.payload.zipcode)
            state.user.zipcode = action.payload.zipcode;
        }
      });
  },
});

export const { resetAuthErrors } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectHeadline = (state: { auth: AuthState }) =>
  state.auth.user?.headline;
export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;
export const selectLoginError = (state: { auth: AuthState }) =>
  state.auth.loginError;
export const selectRegistrationError = (state: { auth: AuthState }) =>
  state.auth.registrationError;

export default authSlice.reducer;
