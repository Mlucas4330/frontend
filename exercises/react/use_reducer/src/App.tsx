import { useReducer } from "react"

export default function App() {
  interface Product {
    id: string
    name: string
    price: number
  }

  interface CartItem {
    id: string
    product: Product
    quantity: number
  }

  interface Cart {
    id: string
    items: CartItem[]
  }

  const products: Product[] = [
    { id: "p1", name: "Mechanical Keyboard", price: 249.99 },
    { id: "p2", name: "USB-C Hub", price: 59.90 },
    { id: "p3", name: "Monitor Stand", price: 89.00 },
  ]

  const cart = { id: "c1", items: [] }

  enum ProductActionKind {
    ADD_ITEM = 'add_item',
    REMOVE_ITEM = 'remove_item',
    UPDATE_QUANTITY = 'update_quantity',
    CLEAR_CART = 'clear_cart'
  }

  // Define action interface
  type ProductAction =
    | { type: ProductActionKind.ADD_ITEM; payload: { product: Product } }
    | { type: ProductActionKind.REMOVE_ITEM; payload: { id: string } }
    | { type: ProductActionKind.UPDATE_QUANTITY; payload: { id: string; quantity: number } }
    | { type: ProductActionKind.CLEAR_CART }

  function reducer(state: Cart, action: ProductAction): Cart {
    switch (action.type) {

      case ProductActionKind.ADD_ITEM: {
        const existing = state.items.find(i => i.id === action.payload.product.id);
        if (existing) {
          return {
            ...state,
            items: state.items.map(i =>
              i.id === action.payload.product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          };
        }
        return {
          ...state,
          items: [...state.items, { id: action.payload.product.id, product: action.payload.product, quantity: 1 }]
        };
      }

      case ProductActionKind.REMOVE_ITEM:
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.payload.id)
        };

      case ProductActionKind.UPDATE_QUANTITY:
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.max(1, action.payload.quantity) }
              : i
          )
        };

      case ProductActionKind.CLEAR_CART:
        return { ...state, items: [] };

      default:
        throw Error('Unknown action');
    }
  }

  const [state, dispatch] = useReducer(reducer, cart);

  //     30. ADD_ITEM — add product or increment quantity if already in cart
  //     31. REMOVE_ITEM — remove the item entirely
  //     32. UPDATE_QUANTITY — set a specific quantity (min 1)
  //     33. CLEAR_CART — empty the cart

  // Write the reducer only — no UI. Then write 4 plain assertions to verify each action.

  return (
    <>
      <button onClick={() => {
        dispatch({ type: ProductActionKind.ADD_ITEM, payload: { product: products[0] } })
      }}>Add Item</button>
      <button onClick={() => { dispatch({ type: ProductActionKind.REMOVE_ITEM, payload: { id: "p1" } }) }}>Remove Item</button>
      <button onClick={() => { dispatch({ type: ProductActionKind.UPDATE_QUANTITY, payload: { id: "p1", quantity: 3 } }) }}>Update Quantity</button>
      <button onClick={() => { dispatch({ type: ProductActionKind.CLEAR_CART }) }}>Clear Cart</button>
    </>
  );
}