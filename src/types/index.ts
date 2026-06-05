export type JarColor = "white" | "green" | "red";

export interface Scent {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  profile: string;
  profileEn: string;
  jarColor: JarColor;
  waxColor: string;
  image: string;
  burnTime: string;
  price: string;
  tags: string[];
  /** Ambient page tint colour for fluid background gradient */
  ambientColor?: string;
}

export interface CartItem {
  id: string;
  jarColor: JarColor;
  quantities: Record<string, number>;
}

export interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  wantsDelivery: boolean;
  wantsPersonalMessage: boolean;
  personalMessage: string;
}

export interface ConfiguratorState {
  jar: JarColor;
  quantities: Record<string, number>;
  message: string;
}

export interface StoreState {
  config: ConfiguratorState;
  cart: CartItem[];
  modalScent: Scent | null;
  lang: "fi" | "en";
  setJar: (jar: JarColor) => void;
  setQuantity: (scentId: string, qty: number) => void;
  setMessage: (message: string) => void;
  openModal: (scent: Scent) => void;
  closeModal: () => void;
  contactOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
  toggleLang: () => void;
  totalQty: () => number;
  totalPrice: () => number;
  addToCart: (jarColor: JarColor, quantities: Record<string, number>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotalQty: () => number;
  cartTotalPrice: () => number;
  /* ─── Cursor & Audio ─── */
  cursorType: "default" | "pointer" | "magnetic";
  setCursorType: (type: "default" | "pointer" | "magnetic") => void;
  isMuted: boolean;
  toggleMute: () => void;
}
