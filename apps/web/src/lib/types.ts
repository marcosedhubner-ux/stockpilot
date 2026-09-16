export type StaffRole = "ADMIN" | "STAFF";
export type MovementType = "RECEIVED" | "SOLD" | "ADJUSTED" | "RETURNED";
export type PurchaseOrderStatus = "DRAFT" | "SUBMITTED" | "RECEIVED" | "CANCELLED";

export interface AuthenticatedStaff {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: string;
  quantityOnHand: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier: Supplier | null;
  isBelowReorderPoint: boolean;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  note: string | null;
  recordedBy: { id: string; fullName: string };
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
  submittedAt: string | null;
  receivedAt: string | null;
}

export interface InventorySummary {
  totalSkus: number;
  totalInventoryValue: number;
  lowStockCount: number;
  reorderSuggestions: {
    productId: string;
    name: string;
    sku: string;
    quantityOnHand: number;
    reorderPoint: number;
    suggestedQuantity: number;
    supplierName: string | null;
  }[];
}
