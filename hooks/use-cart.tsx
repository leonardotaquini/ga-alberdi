"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Product {
  categoria: string
  producto: string
  dolares: number
  guaranies: number
  pesos: number
}

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productName: string) => void
  updateQuantity: (productName: string, quantity: number) => void
  clearCart: () => void
  getTotal: (currency: "dolares" | "guaranies" | "pesos") => number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to load cart", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.producto === product.producto)
      if (existingItem) {
        return currentItems.map((item) =>
          item.producto === product.producto ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productName: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.producto !== productName))
  }

  const updateQuantity = (productName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productName)
      return
    }
    setItems((currentItems) =>
      currentItems.map((item) => (item.producto === productName ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = (currency: "dolares" | "guaranies" | "pesos") => {
    return items.reduce((total, item) => total + item[currency] * item.quantity, 0)
  }

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
