"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Store as StoreIcon,
  Package,
  CheckCircle,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  History,
  Coins,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  storeName: string;
}

const CATEGORIES = [
  "Semua",
  "Sembako",
  "Makanan",
  "Minuman",
  "Kebutuhan Rumah",
];

const categoryEmoji: Record<string, string> = {
  Sembako: "🌾",
  Makanan: "🍜",
  Minuman: "☕",
  "Kebutuhan Rumah": "🏠",
  Lainnya: "📦",
};

interface MemberStorefrontProps {
  apiBase?: string;
}

export default function MemberStorefront({
  apiBase = "/api/admin/marketplace",
}: MemberStorefrontProps) {
  const { user, isAuthenticated } = useAuthStore();

  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<
    "newest" | "price_asc" | "price_desc" | "stock_desc"
  >("newest");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Tabs: shop (Belanja) or history (Transaksi Saya)
  const [activeTab, setActiveTab] = useState<"shop" | "history">("shop");

  // Cart and Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);

  // Checkout inputs
  const [buyerName, setBuyerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "balance" | "qris"
  >("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [createdReceipts, setCreatedReceipts] = useState<any[]>([]);

  // Transaction History State
  const [historyTransactions, setHistoryTransactions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);

  // Sync logged in user name to buyerName
  useEffect(() => {
    if (user?.name) {
      setBuyerName(user.name);
    } else {
      setBuyerName("");
    }
  }, [user]);

  // Load stores and products
  const fetchProductsAndStores = (pageArg = 1) => {
    setLoading(true);
    Promise.all([
      fetch(`${apiBase}/stores`).then((r) => r.json()),
      fetch(
        `${apiBase}/products?page=${pageArg}&limit=${limit}` +
          `${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}` +
          `${selectedCategory && selectedCategory !== "Semua" ? `&category=${encodeURIComponent(selectedCategory)}` : ""}` +
          `${selectedStore ? `&storeId=${encodeURIComponent(selectedStore)}` : ""}` +
          `${sort ? `&sort=${encodeURIComponent(sort)}` : ""}`,
      ).then((r) => r.json()),
    ])
      .then(([s, p]) => {
        setStores(s.stores || []);
        const incoming = p.products || [];
        if (pageArg === 1) {
          setProducts(incoming);
        } else {
          setProducts((prev) => [...prev, ...incoming]);
        }
        setTotalProducts(p.meta?.total ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load marketplace products/stores:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // initial load or when apiBase changes
    setPage(1);
    fetchProductsAndStores(1);
  }, [apiBase]);

  // When filters/search/store change, reset to first page
  useEffect(() => {
    setPage(1);
    fetchProductsAndStores(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, selectedStore, sort]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch transaction history
  const fetchTransactionHistory = () => {
    setHistoryLoading(true);
    // Get guest transaction IDs from localstorage
    const guestIds =
      localStorage.getItem("marketplace_guest_transactions") || "";

    // We fetch history. The API will check auth cookies first; if not found, it checks "ids" query parameter
    let url = "/api/marketplace/history";
    if (!isAuthenticated && guestIds) {
      url += `?ids=${guestIds}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        setHistoryTransactions(res.transactions || []);
        setHistoryLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch order history:", err);
        setHistoryLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransactionHistory();
    }
  }, [activeTab, isAuthenticated]);

  // Server-side filtered list (we request filters from the API)
  const filtered = useMemo(() => products, [products]);

  const getStoreName = (p: any) => {
    if (p.storeId?.name) return p.storeId.name;
    const s = stores.find((s: any) => s._id === (p.storeId?._id || p.storeId));
    return s?.name || "Toko";
  };

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const cartTotal = cart.reduce((a, c) => a + c.price * c.quantity, 0);

  // Simulated cashier helpers for Cash Payment
  const changeDue = useMemo(() => {
    const cash = Number(cashReceived);
    if (isNaN(cash) || cash < cartTotal) return 0;
    return cash - cartTotal;
  }, [cashReceived, cartTotal]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === product._id);
      if (existing) {
        // Enforce stock limit
        if (existing.quantity >= product.stock) return prev;
        return prev.map((c) =>
          c._id === product._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          storeName: getStoreName(product),
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number, maxStock: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c._id === id) {
          const newQty = c.quantity + delta;
          if (newQty > maxStock) return c; // Stock limit reached
          return { ...c, quantity: Math.max(1, newQty) };
        }
        return c;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  };

  // Real Database Checkout API Call
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          cashReceived:
            paymentMethod === "cash"
              ? Number(cashReceived) || cartTotal
              : undefined,
          buyerName: buyerName.trim() || undefined,
          shippingAddress: shippingAddress.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Proses checkout gagal");
      }

      // If QRIS payment required, show payment modal and poll status
      if (data.payment) {
        setPaymentInfo(data.payment);
        // Save tx ids for guest history
        if (!isAuthenticated && data.transactions) {
          const txIds = data.transactions.map((tx: any) => tx._id);
          const existingGuestIds =
            localStorage.getItem("marketplace_guest_transactions") || "";
          const updatedIds = existingGuestIds
            ? [...existingGuestIds.split(","), ...txIds].join(",")
            : txIds.join(",");
          localStorage.setItem("marketplace_guest_transactions", updatedIds);
        }
        setCreatedReceipts(data.transactions || []);
        setCart([]);
        // start polling
        setPaymentPolling(true);
      } else {
        // Success (cash)
        setCreatedReceipts(data.transactions || []);
        setCheckoutDone(true);
        setCart([]);
        // Save transaction IDs in localStorage if Guest so they can view history
        if (!isAuthenticated && data.transactions) {
          const txIds = data.transactions.map((tx: any) => tx._id);
          const existingGuestIds =
            localStorage.getItem("marketplace_guest_transactions") || "";
          const updatedIds = existingGuestIds
            ? [...existingGuestIds.split(","), ...txIds].join(",")
            : txIds.join(",");
          localStorage.setItem("marketplace_guest_transactions", updatedIds);
        }
      }

      // Save transaction IDs in localStorage if Guest so they can view history
      if (!isAuthenticated && data.transactions) {
        const txIds = data.transactions.map((tx: any) => tx._id);
        const existingGuestIds =
          localStorage.getItem("marketplace_guest_transactions") || "";
        const updatedIds = existingGuestIds
          ? [...existingGuestIds.split(","), ...txIds].join(",")
          : txIds.join(",");
        localStorage.setItem("marketplace_guest_transactions", updatedIds);
      }

      // Reload products to update stocks
      fetchProductsAndStores();
    } catch (err: any) {
      setCheckoutError(err.message || "Gagal melakukan checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCloseCheckoutSuccess = () => {
    setCheckoutDone(false);
    setCreatedReceipts([]);
    setCartOpen(false);
    setCashReceived("");
    setShippingAddress("");
  };

  // Poll payment status when paymentInfo is set
  useEffect(() => {
    if (!paymentInfo || !paymentPolling) return;
    let stopped = false;
    const id = paymentInfo._id;
    const poll = async () => {
      try {
        const res = await fetch(`/api/marketplace/payments/${id}`);
        const json = await res.json();
        if (json.payment && json.payment.status === "succeeded") {
          // finalize client state
          setPaymentPolling(false);
          setPaymentInfo(null);
          setCheckoutDone(true);
          // refresh history
          fetchTransactionHistory();
        }
      } catch (err) {
        console.error("Payment poll error", err);
      }
    };
    const iv = setInterval(() => {
      if (!stopped) poll();
    }, 3000);
    // immediate poll
    poll();
    return () => {
      stopped = true;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInfo, paymentPolling]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-3 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Memuat produk & toko...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 sm:p-10 shadow-xl shadow-emerald-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/80 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                Marketplace Toko Kelontong
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Belanja Kebutuhan <br />
              Harian Lebih Mudah
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-md">
              Temukan sembako, makanan ringan, dan kebutuhan rumah dari toko
              lokal terpercaya.
            </p>
          </div>
          {/* Dashboard summary stats in Hero for premium looks */}
          <div className="flex gap-4 self-start sm:self-center shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-white">
              <p className="text-[9px] font-black uppercase text-white/60 tracking-wider">
                Toko Kelontong
              </p>
              <p className="text-xl font-black mt-0.5">{stores.length}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-white">
              <p className="text-[9px] font-black uppercase text-white/60 tracking-wider">
                Total Produk
              </p>
              <p className="text-xl font-black mt-0.5">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex border-b border-border p-1 bg-muted/30 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("shop")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
            activeTab === "shop"
              ? "bg-card text-foreground shadow border border-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Belanja
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
            activeTab === "history"
              ? "bg-card text-foreground shadow border border-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <History className="w-3.5 h-3.5" />
          Transaksi Saya
        </button>
      </div>

      {activeTab === "shop" ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari sembako, makanan ringan, minuman, atau nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all shadow-sm"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Urutkan
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold"
            >
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
              <option value="stock_desc">Stok: Terbanyak</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border",
                  selectedCategory === cat
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-card text-muted-foreground border-border hover:border-emerald-500/30 hover:text-foreground",
                )}
              >
                {cat !== "Semua" && (
                  <span className="mr-1.5">{categoryEmoji[cat] || "📦"}</span>
                )}
                {cat}
              </button>
            ))}
          </div>

          {/* Store Selector */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <StoreIcon className="w-3.5 h-3.5" /> Pilih Toko Kelontong
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              <button
                onClick={() => setSelectedStore(null)}
                className={cn(
                  "flex-shrink-0 px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-200",
                  !selectedStore
                    ? "bg-foreground text-background border-foreground shadow"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30",
                )}
              >
                Semua Toko
              </button>
              {stores.map((store) => (
                <button
                  key={store._id}
                  onClick={() => setSelectedStore(store._id)}
                  className={cn(
                    "flex-shrink-0 px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 text-left relative",
                    selectedStore === store._id
                      ? "bg-foreground text-background border-foreground shadow"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/30",
                  )}
                >
                  <span className="block">{store.name}</span>
                  <span className="flex items-center gap-1 text-[9px] opacity-60 mt-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {store.address?.split(",")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {filtered.length} Produk Tersedia
              </h3>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center glass-panel rounded-3xl border border-dashed border-border">
                <Package className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-bold text-foreground">
                  Produk Tidak Ditemukan
                </p>
                <p className="text-xs text-muted-foreground">
                  Coba ubah kata kunci pencarian atau filter kategori Anda.
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((product: any) => {
                    const inCart = cart.find((c) => c._id === product._id);
                    const prodStock = product.stock || 0;
                    return (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="group glass-panel rounded-2xl overflow-hidden border border-border/50 hover:border-emerald-500/30 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-lg hover:shadow-emerald-500/[0.02]"
                        onClick={() => setDetailProduct(product)}
                      >
                        {/* Image Category Box */}
                        <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative overflow-hidden shrink-0">
                          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
                            {categoryEmoji[product.category] || "📦"}
                          </span>
                          {inCart && (
                            <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md shadow-emerald-500/20">
                              {inCart.quantity}
                            </div>
                          )}
                          {prodStock <= 5 && prodStock > 0 && (
                            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-amber-500/90 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                              Stok Tipis
                            </div>
                          )}
                          {prodStock === 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                              <span className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                                Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-4 flex flex-col flex-1">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mb-1">
                            {product.category}
                          </p>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2 mb-2 flex-1">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate mb-1 flex items-center gap-1 font-medium">
                            <StoreIcon className="w-3 h-3 shrink-0" />
                            {getStoreName(product)}
                          </p>

                          <div className="flex items-center justify-between mt-3 gap-2">
                            <div>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                Harga
                              </p>
                              <p className="text-sm sm:text-base font-black text-foreground tracking-tight">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                            <button
                              disabled={prodStock === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10 shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
            {/* Load more button */}
            {totalProducts !== null && products.length < totalProducts && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchProductsAndStores(next);
                  }}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold"
                >
                  {loading ? "Memuat..." : "Muat Lagi"}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Transaction History List View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Riwayat Pembelian Belanja
            </h3>
          </div>

          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Memuat data transaksi...
              </p>
            </div>
          ) : historyTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center glass-panel rounded-3xl border border-dashed border-border">
              <History className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-bold text-foreground">
                Belum Ada Transaksi
              </p>
              <p className="text-xs text-muted-foreground">
                Semua transaksi yang Anda checkout akan tercantum di sini untuk
                tinjau struk.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyTransactions.map((tx: any) => {
                const storeNames = tx.storeNames || [];
                const storeDisplay =
                  storeNames.length > 1
                    ? `${storeNames.length} Toko Berbeda`
                    : storeNames[0] || "Toko Kelontong";

                return (
                  <motion.div
                    key={tx._id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    onClick={() => setActiveReceipt(tx)}
                    className="glass-panel p-5 rounded-2xl border border-border/50 hover:border-emerald-500/20 cursor-pointer flex flex-col justify-between transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase">
                          ID: #{tx._id?.substring(0, 10)}
                        </p>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <StoreIcon className="w-3.5 h-3.5 text-emerald-500" />
                          {storeDisplay as string}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>

                      <span className="inline-flex px-2 py-0.5 rounded font-black text-[8px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Berhasil
                      </span>
                    </div>

                    {/* Items snippet */}
                    <div className="my-4 py-3 border-y border-border/30 text-[10px] text-muted-foreground font-semibold space-y-1">
                      {tx.items?.slice(0, 2).map((it: any, idx: number) => (
                        <p key={idx} className="truncate">
                          • {it.name} x{it.quantity}
                        </p>
                      ))}
                      {tx.items?.length > 2 && (
                        <p className="text-[9px] text-emerald-500 font-bold">
                          +{tx.items.length - 2} barang lainnya...
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                          Total Belanja
                        </p>
                        <p className="text-base font-black text-foreground">
                          {formatCurrency(tx.totalAmount)}
                        </p>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground flex items-center gap-1 transition-colors">
                        Lihat Struk{" "}
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && activeTab === "shop" && (
          <motion.button
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-emerald-600 text-[10px] font-black rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold hidden sm:block">
              {formatCurrency(cartTotal)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart & Checkout Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!checkoutDone) setCartOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[90] w-full sm:w-[440px] bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden"
            >
              {checkoutDone ? (
                /* CHECKOUT SUCCESS RECEIPT SCREEN */
                <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 space-y-6">
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                    >
                      <CheckCircle className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-black text-foreground">
                        Checkout Berhasil!
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pembayaran diterima dan pesanan sedang dipersiapkan.
                      </p>
                    </div>

                    {/* Printable Invoice receipt card */}
                    <div className="w-full bg-muted/40 border border-border/60 rounded-2xl p-5 text-left font-sans space-y-4 max-w-sm mt-4">
                      <div className="text-center pb-3 border-b border-border/50 space-y-1">
                        <p className="text-xs font-black uppercase text-foreground">
                          Struk Belanja
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">
                          No: {createdReceipts[0]?._id || "TX-SIMULATION"}
                        </p>
                      </div>

                      <div className="text-[10px] space-y-1.5 text-muted-foreground font-semibold">
                        <div className="flex justify-between">
                          <span>Waktu</span>
                          <span className="text-foreground">
                            {new Date().toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })}{" "}
                            {new Date().toLocaleTimeString("id-ID", {
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pelanggan</span>
                          <span className="text-foreground">
                            {buyerName || "Guest"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Metode</span>
                          <span className="text-foreground uppercase">
                            {paymentMethod === "cash" ? "Tunai/COD" : "Saldo"}
                          </span>
                        </div>
                      </div>

                      {/* Store-grouped item list */}
                      <div className="border-t border-b border-border/50 py-3 space-y-2">
                        {createdReceipts.map((tx: any, tIdx: number) => (
                          <div key={tIdx} className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-emerald-500 tracking-wide">
                              {tx.storeId?.name || "Toko Kelontong"}
                            </p>
                            {tx.items?.map((it: any, iIdx: number) => (
                              <div
                                key={iIdx}
                                className="flex justify-between text-[10px] text-muted-foreground"
                              >
                                <span className="font-semibold">
                                  {it.name} x{it.quantity}
                                </span>
                                <span className="font-bold text-foreground">
                                  {formatCurrency(it.price * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-black text-foreground">
                          <span>Total Pembayaran</span>
                          <span>
                            {formatCurrency(
                              createdReceipts.reduce(
                                (sum, tx) => sum + tx.totalAmount,
                                0,
                              ),
                            )}
                          </span>
                        </div>
                        {paymentMethod === "cash" && cashReceived && (
                          <div className="text-[10px] font-semibold text-muted-foreground space-y-1 pt-1.5">
                            <div className="flex justify-between">
                              <span>Uang Diterima</span>
                              <span className="text-foreground font-bold">
                                {formatCurrency(Number(cashReceived))}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-border/40 pt-1 text-emerald-500">
                              <span>Kembalian</span>
                              <span className="font-black">
                                {formatCurrency(changeDue)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseCheckoutSuccess}
                    className="w-full py-3.5 rounded-xl bg-foreground hover:bg-foreground/95 text-background text-xs font-black uppercase tracking-widest transition-all shadow"
                  >
                    Kembali Belanja
                  </button>
                </div>
              ) : (
                /* CART LIST AND CHECKOUT FORM VIEW */
                <>
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-border flex items-center justify-between shrink-0 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          Keranjang Belanja
                        </h3>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                          {cartCount} Barang
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Cart Items List */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Daftar Pembelian
                      </h4>

                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                          <ShoppingCart className="w-10 h-10 text-muted-foreground/20" />
                          <p className="text-xs font-bold text-muted-foreground">
                            Keranjang Anda Kosong
                          </p>
                        </div>
                      ) : (
                        cart.map((item) => {
                          const prodRef = products.find(
                            (p) => p._id === item._id,
                          );
                          const maxStock = prodRef ? prodRef.stock : 99;
                          return (
                            <motion.div
                              key={item._id}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50"
                            >
                              <div className="w-11 h-11 rounded-lg bg-card flex items-center justify-center text-xl shrink-0 border border-border/40 select-none">
                                {categoryEmoji[item.category] || "📦"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {item.name}
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                                  <StoreIcon className="w-2.5 h-2.5 shrink-0" />
                                  {item.storeName}
                                </p>
                                <p className="text-xs font-black text-foreground mt-1">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                              {/* Quantity adjustment buttons */}
                              <div className="flex items-center gap-1 shrink-0 bg-card rounded-lg border border-border p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQty(item._id, -1, maxStock)
                                  }
                                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-black">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQty(item._id, 1, maxStock)
                                  }
                                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item._id)}
                                className="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {cart.length > 0 && (
                      /* CHECKOUT CUSTOMER INFO & PAYMENT SIMULATION */
                      <form
                        onSubmit={handleCheckout}
                        className="space-y-4 border-t border-border/50 pt-5"
                      >
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Informasi &amp; Pembayaran
                        </h4>

                        {/* Customer Name */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                            Nama Pembeli
                          </label>
                          <input
                            type="text"
                            required
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Masukkan nama pembeli (e.g. Tamu, Nama Anda)"
                            className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold"
                          />
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                            Alamat Pengiriman (opsional)
                          </label>
                          <input
                            type="text"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Masukkan alamat / catatan alamat"
                            className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold"
                          />
                        </div>

                        {/* Payment Method Toggle */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                            Metode Pembayaran
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("cash")}
                              className={cn(
                                "py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                paymentMethod === "cash"
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30",
                              )}
                            >
                              <Coins className="w-3.5 h-3.5" />
                              Tunai / COD
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("qris")}
                              className={cn(
                                "py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                paymentMethod === "qris"
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30",
                              )}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              QRIS (Sandbox)
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("balance")}
                              className={cn(
                                "py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                paymentMethod === "balance"
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30",
                              )}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Saldo Wallet
                            </button>
                          </div>
                        </div>

                        {/* Cash Cashier Simulator */}
                        {paymentMethod === "cash" && (
                          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                                Uang Diterima (Rp)
                              </label>
                              <input
                                type="number"
                                min={cartTotal}
                                required
                                value={cashReceived}
                                onChange={(e) =>
                                  setCashReceived(e.target.value)
                                }
                                placeholder="Masukkan nominal uang tunai"
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-black"
                              />
                            </div>

                            {/* Easy Denomination Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setCashReceived(cartTotal.toString())
                                }
                                className="px-2.5 py-1 bg-card hover:bg-muted border border-border rounded text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
                              >
                                Uang Pas
                              </button>
                              {[20000, 50000, 100000].map((denom) => (
                                <button
                                  key={denom}
                                  type="button"
                                  disabled={denom < cartTotal}
                                  onClick={() =>
                                    setCashReceived(denom.toString())
                                  }
                                  className="px-2.5 py-1 bg-card hover:bg-muted disabled:opacity-40 border border-border rounded text-[9px] font-black text-muted-foreground hover:text-foreground"
                                >
                                  {formatCurrency(denom)}
                                </button>
                              ))}
                            </div>

                            {Number(cashReceived) >= cartTotal && (
                              <div className="flex justify-between items-center text-xs font-black text-emerald-500 border-t border-dashed border-border/60 pt-2">
                                <span className="uppercase tracking-wider text-[9px]">
                                  Uang Kembalian
                                </span>
                                <span>{formatCurrency(changeDue)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {checkoutError && (
                          <div className="p-3 text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl uppercase tracking-wide flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {checkoutError}
                          </div>
                        )}
                      </form>
                    )}
                  </div>

                  {/* Drawer Footer Checkout Summary */}
                  {cart.length > 0 && (
                    <div className="p-5 border-t border-border space-y-4 shrink-0 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">
                          Total Belanja
                        </span>
                        <span className="text-xl font-black text-foreground">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={
                          checkoutLoading ||
                          (paymentMethod === "cash" &&
                            (!cashReceived || Number(cashReceived) < cartTotal))
                        }
                        onClick={handleCheckout}
                        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-muted disabled:text-muted-foreground text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.98]"
                      >
                        {checkoutLoading
                          ? "Memproses Checkout..."
                          : "Bayar &amp; Checkout Sekarang"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {detailProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[90] bg-card rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-card/85 backdrop-blur border border-border/50 hover:bg-muted rounded-xl transition-all"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center shrink-0 relative overflow-hidden select-none">
                <span className="text-7xl sm:text-8xl">
                  {categoryEmoji[detailProduct.category] || "📦"}
                </span>
                {detailProduct.stock === 0 && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                <div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    {detailProduct.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 tracking-tight">
                    {detailProduct.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-semibold">
                    <StoreIcon className="w-3.5 h-3.5 text-emerald-500" />
                    {getStoreName(detailProduct)}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {detailProduct.description ||
                    "Deskripsi produk belum disediakan oleh penjual toko kelontong."}
                </p>

                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Harga Satuan
                    </p>
                    <p className="text-xl font-black text-foreground tracking-tight">
                      {formatCurrency(detailProduct.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Tersedia
                    </p>
                    <p
                      className={cn(
                        "text-base font-black",
                        detailProduct.stock > 10
                          ? "text-emerald-500"
                          : detailProduct.stock > 0
                            ? "text-amber-500"
                            : "text-rose-500",
                      )}
                    >
                      {detailProduct.stock > 0
                        ? `${detailProduct.stock} Unit`
                        : "Habis"}
                    </p>
                  </div>
                </div>

                <button
                  disabled={detailProduct.stock === 0}
                  onClick={() => {
                    addToCart(detailProduct);
                    setDetailProduct(null);
                    setCartOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-muted disabled:text-muted-foreground text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tambah ke Keranjang
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment QR Modal (Sandbox) */}
      <AnimatePresence>
        {paymentInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!paymentPolling) setPaymentInfo(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[90] bg-card rounded-3xl border border-border shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-black">
                  Pembayaran QRIS (Sandbox)
                </h3>
                <button
                  onClick={() => setPaymentInfo(null)}
                  className="p-1 rounded-md"
                >
                  {" "}
                  <X className="w-4 h-4 text-muted-foreground" />{" "}
                </button>
              </div>
              <div className="p-6 space-y-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Scan QR berikut menggunakan aplikasi pembayaran yang mendukung
                  QRIS (sandbox):
                </p>
                <div className="mx-auto w-48 h-48 bg-white flex items-center justify-center rounded-xl shadow">
                  <pre className="text-xs font-mono p-2 break-words text-center">
                    {paymentInfo.qrPayload}
                  </pre>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Jumlah: {formatCurrency(paymentInfo.amount)}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      // simulate payment confirm
                      try {
                        const res = await fetch(
                          `/api/marketplace/payments/${paymentInfo._id}`,
                          { method: "POST" },
                        );
                        if (res.ok) {
                          setPaymentPolling(false);
                          setPaymentInfo(null);
                          setCheckoutDone(true);
                          fetchTransactionHistory();
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold"
                  >
                    Simulasikan Pembayaran (Sandbox)
                  </button>
                  <button
                    onClick={() => {
                      setPaymentPolling(false);
                      setPaymentInfo(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating View Receipt Modal for History */}
      <AnimatePresence>
        {activeReceipt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReceipt(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[90] bg-card rounded-3xl border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/10">
                <span className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                  <Receipt className="w-4 h-4 text-emerald-500" /> Struk
                  Pembelian
                </span>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Receipt Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="text-center space-y-1 pb-4 border-b border-border/50">
                  <h3 className="text-sm font-black uppercase text-foreground">
                    {activeReceipt.isGrouped
                      ? "Marketplace Order"
                      : activeReceipt.storeId?.name || "Toko Kelontong"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {activeReceipt.isGrouped
                      ? `${(activeReceipt.storeNames || []).length} Toko Berbeda`
                      : activeReceipt.storeId?.address || "Alamat Toko"}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase pt-1">
                    No: {activeReceipt._id}
                  </p>
                </div>

                <div className="text-[10px] space-y-2 text-muted-foreground font-semibold">
                  <div className="flex justify-between">
                    <span>Tanggal &amp; Waktu</span>
                    <span className="text-foreground">
                      {new Date(activeReceipt.createdAt).toLocaleString(
                        "id-ID",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan</span>
                    <span className="text-foreground">
                      {activeReceipt.buyerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode Pembayaran</span>
                    <span className="text-foreground uppercase">
                      {activeReceipt.paymentMethod === "cash"
                        ? "Tunai / COD"
                        : "Saldo Wallet"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Transaksi</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px]">
                      Berhasil (Selesai)
                    </span>
                  </div>
                </div>

                {/* Items detailed list */}
                <div className="border-t border-b border-border/50 py-4 space-y-2.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                    Rincian Barang
                  </p>
                  {activeReceipt.items?.map((it: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs text-muted-foreground"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {it.name} x{it.quantity}
                        </span>
                        {activeReceipt.isGrouped && (
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                            {it.storeName}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-black text-foreground">
                    <span>Total Belanja</span>
                    <span>{formatCurrency(activeReceipt.totalAmount)}</span>
                  </div>
                  {activeReceipt.paymentMethod === "cash" &&
                    activeReceipt.cashReceived && (
                      <div className="text-[10px] font-semibold text-muted-foreground space-y-1.5 pt-1.5">
                        <div className="flex justify-between">
                          <span>Uang Diterima</span>
                          <span className="text-foreground font-bold">
                            {formatCurrency(activeReceipt.cashReceived)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-border/40 pt-1.5 text-emerald-500">
                          <span>Uang Kembalian</span>
                          <span className="font-black">
                            {formatCurrency(activeReceipt.changeDue || 0)}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="p-4 border-t border-border bg-muted/10 shrink-0 text-center">
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="w-full py-2 rounded-xl bg-foreground hover:bg-foreground/95 text-background text-xs font-black uppercase tracking-widest transition-all"
                >
                  Tutup Struk
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
