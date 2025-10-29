// LIBRARY COMPONENTS
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
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
import storage, { encryptionTransform } from "@/_utils/storage";

const persistConfig = {
	key: `${appConstants.ROOT_STORAGE}`,
	storage,
	whitelist: ["auth"],
	// whitelist: ["product", "wishlist", "cart", "search", "user"],
	// transforms: [encryptionTransform], // encryption layer
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
