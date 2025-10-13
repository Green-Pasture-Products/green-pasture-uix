// LIBRARY COMPONENTS
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// CUSTOM COMPONENTS
import rootReducer from "./reducers";
import { appConstants } from "./constants";

const persistConfig = {
	key: `${appConstants.ROOT_STORAGE}`,
	storage,
	// ✅ CRITICAL: Exclude auth and user from persistence - cookies handle this
	blacklist: ["auth", "user"],
	// Only persist non-sensitive data like UI preferences, cart, etc.
	whitelist: ["product", "wishlist", "cart", "search"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;
