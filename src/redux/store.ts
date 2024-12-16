import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/redux/slice/cart.slice";
import clientCheckoutDataReducer from "@/redux/slice/checkout.slice";
import clientReservationDataReducer from "@/redux/slice/reservation.slice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    clientCheckoutData: clientCheckoutDataReducer,
    clientReservationData: clientReservationDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
