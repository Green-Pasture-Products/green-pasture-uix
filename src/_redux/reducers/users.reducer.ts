import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAllStaff } from "../actions/user.action";
import { UsersProp, User } from "@/types";

const initialState: UsersProp = {
	isLoading: false,
	staff: null,
};

const usersSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAllStaff.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(
				getAllStaff.fulfilled,
				(state, action: PayloadAction<User | null>) => {
					state.staff = action.payload;
					state.isLoading = false;
				}
			)
			.addCase(getAllStaff.rejected, (state) => {
				state.isLoading = false;
			});
	},
});

export const { setLoading } = usersSlice.actions;
export default usersSlice.reducer;
