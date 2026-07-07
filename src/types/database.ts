export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AnyRecord = Record<string, unknown>;

export type DashboardSummary = {
  totalClients: number;
  totalProjects: number;
  totalOnlineOrders: number;
  pendingOnlineOrders: number;
  workingOnlineOrders: number;
  readyOnlineOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  readyForPickupOrders: number;
  completedOrders: number;
  unpaidOrders: number;
  todaySales: number;
  monthlySales: number;
  totalExpenses: number;
  estimatedNetProfit: number;
  lowStockItems: number;
};

export type RelationOption = {
  value: string;
  label: string;
  description?: string;
};
