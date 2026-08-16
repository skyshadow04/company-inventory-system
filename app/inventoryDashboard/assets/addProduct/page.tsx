import { redirect } from "next/navigation";

export default function AddProductPage() {
  redirect("/inventoryDashboard/assets/addAsset");
  return null;
}
