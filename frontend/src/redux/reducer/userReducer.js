import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
  role: "",
  leadId:null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLeadId: (state, action) => {
      state.leadId = action.payload;
    },
  },
});

// ✅ Correct way to export actions
export const { setUserId, setRole,setLeadId } = userSlice.actions;

// ✅ Correct way to export reducer
export default userSlice.reducer;
