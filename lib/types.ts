export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
  icon?: string;
  image?: string;
}

export interface Review {
  _id: string;
  name?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  images?: string[];
  stock?: number;
  reviewsList?: Review[];
  category: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  benefit: string;
  energyLevel: 'High' | 'Medium' | 'Very High';
  isEnergized: boolean;
  material?: string;
  size?: string;
  isTrending?: boolean;
  isBestseller?: boolean;
  description: string;
  howToUse?: string;
  features: string[];
  specifications: Record<string, string>;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  crystals?: Array<{ name: string; benefit?: string }>;
  gstRate?: number;
  meta_title?: string;
  meta_description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId?: string;
}

export interface Address {
  _id?: string;
  id?: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderId?: string;
  date: string;
  items: CartItem[];
  subtotal?: number;
  shipping?: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: ShippingAddress;
  timeline?: OrderTimeline[];
  awbCode?: string;
  courierName?: string;
  shipmentId?: string;
  shiprocketOrderId?: string;
  edd?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  karmaPoints: number;
  isDivineMember: boolean;
  avatar?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  date: string;
  image: string;
  category?: string;
  author?: string;
  isActive?: boolean;
  createdAt?: string;
  taggedProduct?: {
    _id: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    slug?: string;
    rating?: number;
    reviewCount?: number;
    benefit?: string;
  };
  meta_title?: string;
  meta_description?: string;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  materials: string[];
  sizes: string[];
  isEnergized: boolean | null;
  minRating: number;
}
