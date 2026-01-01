"use client"

import { useState, useMemo, useRef } from "react"
import { Search, DollarSign, Package, ChevronLeft, ChevronRight, ShoppingCart, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import { useCart } from "@/hooks/use-cart"
import Image from "next/image"
import logoSrc from "@/public/1.svg"
interface Product {
  categoria: string
  producto: string
  dolares: number
  guaranies: number
  pesos: number
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products")
  if (!response.ok) throw new Error("Failed to fetch products")
  return response.json()
}

export function ProductCatalog() {
  const { data: products, error, isLoading } = useSWR<Product[]>("products", fetchProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<"dolares" | "guaranies" | "pesos">("dolares")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false) // Added state for mobile category dropdown
  const productsPerPage = 10
  const { addToCart } = useCart()
  const productsRef = useRef<HTMLDivElement>(null) // Added ref for scrolling to products

  const categories = useMemo(() => {
    if (!products) return []
    const uniqueCategories = [...new Set(products.map((p) => p.categoria))]
    return uniqueCategories.sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter((product) => {
      const matchesSearch =
        product.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory
      const hasPrice = product[selectedCurrency] > 0

      return matchesSearch && matchesCategory && hasPrice
    })
  }, [products, searchTerm, selectedCategory, selectedCurrency])

  const formatPrice = (price: number, currency: "dolares" | "guaranies" | "pesos") => {
    const symbols = { dolares: "$", guaranies: "₲", pesos: "AR$" }
    return `${symbols[currency]} ${price.toLocaleString("es-PY", { minimumFractionDigits: 2 })}`
  }

  const stats = useMemo(() => {
    if (!products) return { total: 0, categories: 0 }
    return {
      total: products.filter((p) => p[selectedCurrency] > 0).length,
      categories: categories.length,
    }
  }, [products, categories, selectedCurrency])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedCurrency])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setIsCategoryOpen(false)
    // Scroll to products section on mobile
    if (window.innerWidth < 1024 && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                <Image src={logoSrc} alt="Logo" className=" w-32 inline-block mb-1" />
                Catálogo de Productos
                </h1>
              <p className="text-sm md:text-base text-muted-foreground">Informática GA - Paraguay</p>
            </div>
            <div className="flex gap-4 self-start md:self-auto">
              <div className="text-left md:text-right">
                <div className="text-xl md:text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Productos</div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xl md:text-2xl font-bold text-primary">{stats.categories}</div>
                <div className="text-xs text-muted-foreground">Categorías</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedCurrency === "dolares" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("dolares")}
                size="sm"
              >
                USD $
              </Button>
              <Button
                variant={selectedCurrency === "guaranies" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("guaranies")}
                size="sm"
              >
                Guaraníes
              </Button>
              <Button
                variant={selectedCurrency === "pesos" ? "default" : "outline"}
                onClick={() => setSelectedCurrency("pesos")}
                size="sm"
              >
                Pesos AR$
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
            <Card className="lg:max-h-full lg:flex lg:flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Categorías</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 lg:overflow-y-auto lg:flex-1">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleCategorySelect("all")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Todas las categorías
                </Button>
                {isLoading ? (
                  <>
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </>
                ) : (
                  categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Products Grid */}
          <main className="flex-1">
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <span className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  {selectedCategory === "all" ? "Todas las categorías" : selectedCategory}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
              </Button>

              {isCategoryOpen && (
                <Card className="mt-2 max-h-64 overflow-y-auto">
                  <CardContent className="p-2 space-y-1">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect("all")}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Todas las categorías
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div ref={productsRef}>
              {error && (
                <Card className="bg-destructive/10 border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-destructive">Error al cargar los productos. Por favor, intenta nuevamente.</p>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-6 w-full mb-4" />
                        <Skeleton className="h-8 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">No se encontraron productos</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Intenta con otros términos de búsqueda o filtros
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de{" "}
                    {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentProducts.map((product, idx) => (
                      <Card key={idx} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <Badge variant="secondary" className="mb-3">
                            {product.categoria}
                          </Badge>
                          <h3 className="font-semibold text-foreground mb-4 line-clamp-2 min-h-[3rem]">
                            {product.producto}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-4">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(product[selectedCurrency], selectedCurrency)}
                            </span>
                          </div>
                          <Button onClick={() => addToCart(product)} className="w-full" size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Agregar al carrito
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          const showPage =
                            page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)

                          if (!showPage) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              )
                            }
                            return null
                          }

                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-9"
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
