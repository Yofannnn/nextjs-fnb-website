import { Product } from "@/types/product.type";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Menus extends Product {
  quantity: number;
}

interface ClientReservationDetails {
  customerName: string;
  customerEmail: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  seatingPreference: "indoor" | "outdoor" | "";
  specialRequest: string;
  menus: Menus[] | [];
  reservationType: "table-only" | "include-food";
  paymentStatus: "downPayment" | "paid";
}

const STORAGE_KEY = "clientReservationData";

const defaultClientReservationDetails: ClientReservationDetails = {
  customerName: "",
  customerEmail: "",
  reservationDate: "",
  reservationTime: "",
  partySize: 0,
  seatingPreference: "",
  specialRequest: "",
  menus: [],
  reservationType: "table-only",
  paymentStatus: "downPayment",
};

const fetchClientReservationFromStorage = (): ClientReservationDetails => {
  return JSON.parse(
    sessionStorage.getItem(STORAGE_KEY) ||
      defaultClientReservationDetails.toString()
  );
};

const saveClientReservationToStorage = (
  reservation: ClientReservationDetails
) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservation));
};

export const fetchClientReservationDetails = createAsyncThunk(
  "clientReservation/fetchDetails",
  (): ClientReservationDetails => fetchClientReservationFromStorage()
);

export const saveClientReservationDetails = createAsyncThunk(
  "clientReservation/saveDetails",
  (reservation: ClientReservationDetails): ClientReservationDetails => {
    saveClientReservationToStorage(reservation);
    return reservation;
  }
);

export const clearClientReservationDetails = createAsyncThunk(
  "clientReservation/clearDetails",
  (): ClientReservationDetails => {
    sessionStorage.removeItem(STORAGE_KEY);
    return defaultClientReservationDetails;
  }
);

const initialState: ClientReservationDetails = defaultClientReservationDetails;

const clientReservationDataSlice = createSlice({
  name: "clientReservationData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchClientReservationDetails.fulfilled,
        (state, action: PayloadAction<ClientReservationDetails>) => {
          return action.payload;
        }
      )
      .addCase(
        saveClientReservationDetails.fulfilled,
        (state, action: PayloadAction<ClientReservationDetails>) => {
          return action.payload;
        }
      );
  },
});

export default clientReservationDataSlice.reducer;
