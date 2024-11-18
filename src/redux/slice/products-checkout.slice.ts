import { Cart } from "@/types/cart.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const sessionStorageName = "products-checkout";

const getSessionStorageProductsCheckout = (): Cart[] => {
  return JSON.parse(sessionStorage.getItem(sessionStorageName) || "[]");
};

const setSessionStorageProductsCheckout = (products: Cart[]) => {
  sessionStorage.setItem(sessionStorageName, JSON.stringify(products));
};

export const loadProductsCheckout = createAsyncThunk(
  "productsCheckout/loadProductsCheckout",
  () => getSessionStorageProductsCheckout()
);

export const updateProductsCheckout = createAsyncThunk(
  "productsCheckout/updateProductsCheckout",
  ({ remove, product }: { remove: boolean; product: Cart }) => {
    const productsCheckout = getSessionStorageProductsCheckout();
    if (remove) {
      const updated = productsCheckout.filter(
        (item) => item.productId !== product.productId
      );
      setSessionStorageProductsCheckout(updated);
      return updated;
    }

    const productIndex = productsCheckout.findIndex(
      (item) => item.productId === product.productId
    );
    const updated =
      productIndex !== -1
        ? productsCheckout.map((item, index) =>
            index === productIndex ? product : item
          )
        : [...productsCheckout, product];
    setSessionStorageProductsCheckout(updated);
    return updated;
  }
);

const initialState: Cart[] = [];

export const productsCheckoutSlice = createSlice({
  name: "products-checkout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadProductsCheckout.fulfilled,
        (state, action) => action.payload
      )
      .addCase(
        updateProductsCheckout.fulfilled,
        (state, action) => action.payload
      );
  },
});

export default productsCheckoutSlice.reducer;
