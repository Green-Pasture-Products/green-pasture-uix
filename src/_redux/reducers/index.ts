import { combineReducers } from "@reduxjs/toolkit";
// import authReducer from "./auth.reducer";
import cartReducer from "./cart.reducer";
import productReducer from "./products.reducer";
import wishlistReducer from "./wishlist.reducer";
import searchReducer from "./search.reducer";

const rootReducer = combineReducers({
	// auth: authReducer,
	cart: cartReducer,
	product: productReducer,
	wishlist: wishlistReducer,
	search: searchReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
