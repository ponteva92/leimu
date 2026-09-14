export type JarColor = "white" | "green" | "red";
export type Lang = "fi" | "en";
export type CheckoutStep = "configure" | "checkout" | "summary" | "thankyou";
export type DeliveryMode = "pickup" | "post";
export type PaymentMethod = "mobilepay" | "siirto" | "cash";

export interface LocalizedTag {
  fi: string;
  en: string;
}

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
  tags: LocalizedTag[];
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
  delivery: DeliveryMode;
  wantsPersonalMessage: boolean;
  personalMessage: string;
  paymentMethod: PaymentMethod | "";
}

export interface OrderLineInput {
  scentId: string;
  jarColor: JarColor;
  qty: number;
}

export interface LastOrder {
  formData: CheckoutData;
  items: CartItem[];
  total: number;
}

export interface ConfiguratorState {
  jar: JarColor;
  quantities: Record<string, number>;
  message: string;
}

export interface PriceOk {
  ok: true;
  totalCandles: number;
  basePrice: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  codeApplied: boolean;
}

export interface PriceErr {
  ok: false;
  error: string;
}

export type PriceResult = PriceOk | PriceErr;

export interface StoreState {
  config: ConfiguratorState;
  cart: CartItem[];
  modalScent: Scent | null;
  lang: Lang;
  setJar: (jar: JarColor) => void;
  setQuantity: (scentId: string, qty: number) => void;
  setMessage: (message: string) => void;
  openModal: (scent: Scent) => void;
  closeModal: () => void;
  contactOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  totalQty: () => number;
  totalPrice: () => number;
  addToCart: (jarColor: JarColor, quantities: Record<string, number>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotalQty: () => number;
  cartTotalPrice: () => number;
  cursorType: "default" | "pointer" | "magnetic";
  setCursorType: (type: "default" | "pointer" | "magnetic") => void;
  isMuted: boolean;
  toggleMute: () => void;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  lastOrder: LastOrder | null;
  setLastOrder: (order: LastOrder | null) => void;
  navMenuOpen: boolean;
  setNavMenuOpen: (open: boolean) => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}
