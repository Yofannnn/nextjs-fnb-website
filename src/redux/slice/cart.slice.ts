import { Cart } from "@/types/cart.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const localStorageName = "cart";

const getLocalStorageCart = () => {
  return JSON.parse(localStorage.getItem(localStorageName) || "[]");
};

const setLocalStorageCart = (cartItems: Cart[]) => {
  localStorage.setItem(localStorageName, JSON.stringify(cartItems));
};

export const loadCartFromLocal = createAsyncThunk(
  "cart/loadCartFromLocal",
  () => getLocalStorageCart()
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  (idProduct: string) => {
    const cart: Cart[] = getLocalStorageCart();
    const productInCartIndex = cart.findIndex(
      (product: Cart) => product.productId === idProduct
    );

    if (productInCartIndex !== -1) {
      const updatedCart = cart.map((product, index) =>
        index === productInCartIndex
          ? { ...product, quantity: product.quantity + 1 }
          : product
      );
      setLocalStorageCart(updatedCart);
      return updatedCart;
    } else {
      const updatedCart = [...cart, { productId: idProduct, quantity: 1 }];
      setLocalStorageCart(updatedCart);
      return updatedCart;
    }
  }
);

export const decrementItemInCart = createAsyncThunk(
  "cart/decrementItemInCart",
  (idProduct: string) => {
    const cart: Cart[] = getLocalStorageCart();
    const productInCartIndex = cart.findIndex(
      (product: Cart) => product.productId === idProduct
    );
    if (productInCartIndex !== -1) {
      const updatedCart = cart
        .map((product, index) =>
          index === productInCartIndex
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0);
      setLocalStorageCart(updatedCart);
      return updatedCart;
    }
  }
);

export const incrementItemInCart = createAsyncThunk(
  "cart/incrementItemInCart",
  (idProduct: string) => {
    const cart: Cart[] = getLocalStorageCart();
    const productInCartIndex = cart.findIndex(
      (product: Cart) => product.productId === idProduct
    );
    if (productInCartIndex !== -1) {
      const updatedCart = cart.map((product, index) =>
        index === productInCartIndex
          ? { ...product, quantity: product.quantity + 1 }
          : product
      );
      setLocalStorageCart(updatedCart);
      return updatedCart;
    }
  }
);

export const deleteItemInCart = createAsyncThunk(
  "cart/deleteItemInCart",
  (idProduct: string) => {
    const cart: Cart[] = getLocalStorageCart();
    const updatedCart = cart.filter((product) => product.productId !== idProduct);
    setLocalStorageCart(updatedCart);
    return updatedCart;
  }
);

const initialState: Cart[] = [];

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCartFromLocal.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(decrementItemInCart.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(incrementItemInCart.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(deleteItemInCart.fulfilled, (state, action) => {
        return action.payload;
      });
  },
});

export default cartSlice.reducer;
