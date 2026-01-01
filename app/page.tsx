import { ProductCatalog } from "@/components/product-catalog"
import { CartDrawer } from "@/components/cart-drawer"

export default function Home() {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <CartDrawer />
      </div>
      <ProductCatalog />
    </>
  )
}
