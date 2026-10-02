import type { CartItem, Order, Product, User } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any -- these adapters take raw backend JSON */

/** Map MongoDB _id → id and backend field names → frontend field names */
export function normalizeProduct(p: any): Product {
  const specs = p.specifications;
  const reviewsArray = Array.isArray(p.reviews) ? p.reviews : [];
  return {
    ...p,
    id: p._id ?? p.id,
    slug: p.slug ?? undefined,
    category: p.category?.name ?? p.category ?? '',
    // Backend uses reviewCount; frontend Product type uses reviews as a number
    reviews: p.reviewCount ?? reviewsArray.length ?? 0,
    // Preserve the full reviews array under a separate key for detail pages
    reviewsList: reviewsArray,
    rating: Number(p.rating) || 0,
    price: Number(p.price) || 0,
    // Mongoose Map serialises to plain object in JSON — keep as-is, fallback to {}
    specifications: (specs && typeof specs === 'object' && !Array.isArray(specs)) ? specs : {},
    features: Array.isArray(p.features) ? p.features : [],
    benefit: p.benefit ?? '',
    subCategory: p.subCategory ?? '',
    description: p.description ?? '',
    stockStatus: p.stockStatus ?? 'In Stock',
    energyLevel: p.energyLevel ?? 'Medium',
    crystals: Array.isArray(p.crystals) ? p.crystals : [],
  };
}

export function mapApiUser(u: any): User {
  return {
    id: u._id ?? u.id,
    name: u.name,
    email: u.email,
    karmaPoints: u.karmaPoints ?? 0,
    isDivineMember: u.isDivineMember ?? false,
    avatar: u.avatar,
  };
}

export function mapApiCartItem(item: any): CartItem {
  const p = item.product ?? item;
  return {
    ...normalizeProduct(p),
    quantity: item.quantity ?? 1,
    cartItemId: item._id, // subdocument _id used for DELETE/PUT
  };
}

/** Map backend order → frontend Order shape */
export function normalizeOrder(o: any): Order {
  return {
    id: o.orderId || o._id,
    _id: o._id,
    orderId: o.orderId,
    date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: (o.items || []).map((item: any) => ({
      id: item.product?._id || item.product || item._id || '',
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '',
      category: '',
      subCategory: '',
      rating: 0,
      reviews: 0,
      benefit: '',
      energyLevel: 'Medium' as const,
      isEnergized: false,
      description: '',
      features: [],
      specifications: {},
      stockStatus: 'In Stock' as const,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    shippingAddress: o.shippingAddress,
    timeline: o.timeline || [],
    awbCode: o.awbCode || '',
    courierName: o.courierName || '',
    shipmentId: o.shipmentId || '',
    shiprocketOrderId: o.shiprocketOrderId || '',
    edd: o.edd || '',
  };
}
