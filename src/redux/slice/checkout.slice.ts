import { Product } from "@/types/product.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "checkoutData";

interface ProductCheckout extends Product {
  quantity: number;
}

interface CheckoutData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryDate: string;
  note: string;
  productsCheckout: ProductCheckout[] | [];
}

const defaultCheckoutData: CheckoutData = {
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  deliveryDate: "",
  note: "",
  productsCheckout: [],
};

const fetchCheckoutDataFromStorage = (): CheckoutData => {
  const storedData = sessionStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : defaultCheckoutData;
};

const saveCheckoutDataToStorage = (checkoutData: CheckoutData) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutData));
};

export const loadCheckoutData = createAsyncThunk(
  "checkout/loadCheckoutData",
  (): CheckoutData => fetchCheckoutDataFromStorage()
);

export const updateProductsCheckout = ({
  remove,
  increase,
  newProduct,
}: {
  remove: boolean;
  increase: boolean;
  newProduct: ProductCheckout;
}): ProductCheckout[] => {
  const localProductsCheckout = fetchCheckoutDataFromStorage().productsCheckout;

  if (remove) {
    const updated = localProductsCheckout.filter(
      (item) => item._id !== newProduct._id
    );
    return updated;
  }

  const productIndex = localProductsCheckout.findIndex(
    (item) => item._id === newProduct._id
  );

  const updated =
    productIndex !== -1
      ? localProductsCheckout.map((item, index) =>
          index === productIndex
            ? {
                ...item,
                quantity: increase ? item.quantity + 1 : item.quantity - 1,
              }
            : item
        )
      : [...localProductsCheckout, newProduct];

  return updated;
};

export const saveCheckoutData = createAsyncThunk(
  "checkout/saveCheckoutData",
  (checkoutData: CheckoutData): CheckoutData => {
    saveCheckoutDataToStorage(checkoutData);
    return checkoutData;
  }
);

export const clearCheckoutData = createAsyncThunk(
  "checkout/clearCheckoutData",
  (): CheckoutData => {
    sessionStorage.removeItem(STORAGE_KEY);
    return defaultCheckoutData;
  }
);

const initialState: CheckoutData = defaultCheckoutData;

export const clientCheckoutSlice = createSlice({
  name: "clientCheckoutData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCheckoutData.fulfilled, (state, action) => action.payload)
      .addCase(saveCheckoutData.fulfilled, (state, action) => action.payload)
      .addCase(clearCheckoutData.fulfilled, (state, action) => action.payload);
  },
});

export default clientCheckoutSlice.reducer;
