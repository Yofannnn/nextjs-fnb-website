import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/redux/slice/cart.slice";
import productsCheckoutReducer from "@/redux/slice/products-checkout.slice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    productsCheckout: productsCheckoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
