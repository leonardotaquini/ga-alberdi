"use client"

import { useState } from "react"
import { ShoppingCart, X, Plus, Minus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal, itemCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    moneda: "dolares" as "dolares" | "guaranies" | "pesos" | "usdt",
    entrega: "retiro" as "retiro" | "domicilio",
  })

  const formatPrice = (price: number, currency: "dolares" | "guaranies" | "pesos") => {
    const symbols = { dolares: "USD $", guaranies: "₲", pesos: "AR$" }
    return `${symbols[currency]} ${price.toLocaleString("es-PY", { minimumFractionDigits: 2 })}`
  }

  const handleCheckout = () => {
    if (!formData.nombre || !formData.apellido) {
      alert("Por favor completa tu nombre y apellido")
      return
    }

    // Build WhatsApp message
    const currency = formData.moneda === "usdt" ? "dolares" : formData.moneda
    const total = getTotal(currency)
    const monedaDisplay = {
      dolares: "USD",
      guaranies: "Guaraníes",
      pesos: "Pesos Argentinos",
      usdt: "USDT (Crypto)",
    }

    let message = `🛒 *NUEVO PEDIDO*\n\n`
    message += `👤 *Cliente:* ${formData.nombre} ${formData.apellido}\n\n`
    message += `📦 *Productos:*\n`

    items.forEach((item) => {
      const price = item[currency]
      message += `• ${item.producto}\n`
      message += `  Cantidad: ${item.quantity}\n`
      message += `  Precio: ${formatPrice(price, currency)} c/u\n`
      message += `  Subtotal: ${formatPrice(price * item.quantity, currency)}\n\n`
    })

    message += `💰 *Total: ${formatPrice(total, currency)}*\n`
    message += `💳 *Moneda de pago:* ${monedaDisplay[formData.moneda]}\n`
    message += `🚚 *Entrega:* ${formData.entrega === "domicilio" ? "A domicilio" : "Retiro en local de Norma Cáceres"}\n`

    const whatsappNumber = "5493704320838"
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    clearCart()
    setIsOpen(false)
    setShowCheckout(false)
    setFormData({
      nombre: "",
      apellido: "",
      moneda: "dolares",
      entrega: "retiro",
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" size="lg" className="relative rounded-md">
          <ShoppingCart className="h-5 w-5" />
          
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-green-700">{itemCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{showCheckout ? "Finalizar Compra" : "Carrito de Compras"}</SheetTitle>
          <SheetDescription>
            {showCheckout
              ? "Completa tus datos para finalizar"
              : itemCount === 0
                ? "Tu carrito está vacío"
                : `${itemCount} ${itemCount === 1 ? "producto" : "productos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {!showCheckout ? (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.producto} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.producto}</h4>
                          <p className="text-xs text-muted-foreground">{item.categoria}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.producto)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.producto, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.producto, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatPrice(item.dolares * item.quantity, "dolares")}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(item.dolares, "dolares")} c/u
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-1 p-4">
                  <div className="flex justify-between text-sm">
                    <span>Total (USD):</span>
                    <span className="font-bold">{formatPrice(getTotal("dolares"), "dolares")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total (Guaraníes):</span>
                    <span>{formatPrice(getTotal("guaranies"), "guaranies")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total (Pesos AR):</span>
                    <span>{formatPrice(getTotal("pesos"), "pesos")}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 px-4 pb-4">
                  <Button variant="outline" onClick={clearCart} className="flex-1 bg-transparent">
                    Vaciar
                  </Button>
                  <Button onClick={() => setShowCheckout(true)} className="flex-1">
                    Continuar
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Tu apellido"
                />
              </div>

              <div className="space-y-2">
                <Label>Moneda de pago</Label>
                <RadioGroup
                  value={formData.moneda}
                  onValueChange={(value) => setFormData({ ...formData, moneda: value as typeof formData.moneda })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dolares" id="dolares" />
                    <Label htmlFor="dolares" className="font-normal cursor-pointer">
                      Dólares (USD)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="guaranies" id="guaranies" />
                    <Label htmlFor="guaranies" className="font-normal cursor-pointer">
                      Guaraníes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pesos" id="pesos" />
                    <Label htmlFor="pesos" className="font-normal cursor-pointer">
                      Pesos Argentinos (AR$)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="usdt" id="usdt" />
                    <Label htmlFor="usdt" className="font-normal cursor-pointer">
                      USDT (Crypto)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Método de entrega</Label>
                <RadioGroup
                  value={formData.entrega}
                  onValueChange={(value) => setFormData({ ...formData, entrega: value as typeof formData.entrega })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retiro" id="retiro" />
                    <Label htmlFor="retiro" className="font-normal cursor-pointer">
                      Retiro en local de Norma Cáceres
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="domicilio" id="domicilio" />
                    <Label htmlFor="domicilio" className="font-normal cursor-pointer">
                      Entrega a domicilio
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Resumen del pedido</h4>
                <div className="space-y-1 text-sm">
                  {items.map((item) => (
                    <div key={item.producto} className="flex justify-between">
                      <span>
                        {item.producto} x{item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-bold">
                    Total:{" "}
                    {formatPrice(
                      getTotal(formData.moneda === "usdt" ? "dolares" : formData.moneda),
                      formData.moneda === "usdt" ? "dolares" : formData.moneda,
                    )}
                    {formData.moneda === "usdt" && " USDT"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex gap-2">
              <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                Volver
              </Button>
              <Button onClick={handleCheckout} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
