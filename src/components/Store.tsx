import { useState } from 'react';
import { ChevronLeft, ShoppingBag, Star, Tag, Check, Plus, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
}

const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "Luxury Orthopedic Prayer Mat", 
    category: "Mats", 
    price: 34.99, 
    rating: 4.9, 
    reviews: 128,
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80",
    description: "Memory foam padded prayer rug designed for maximum comfort during Sujood and standing."
  },
  { 
    id: 2, 
    name: "Digital LED Tasbih Counter", 
    category: "Accessories", 
    price: 14.50, 
    rating: 4.8, 
    reviews: 95,
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e84?auto=format&fit=crop&w=400&q=80",
    description: "Compact digital finger tally counter with backlight, haptic tap feedback, and 9999 count capacity."
  },
  { 
    id: 3, 
    name: "Ayat Al-Kursi Canvas Calligraphy", 
    category: "Art", 
    price: 49.00, 
    rating: 5.0, 
    reviews: 210,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&w=400&q=80",
    description: "Handcrafted golden Thuluth script of Ayat Al-Kursi on museum-grade textured canvas."
  },
  { 
    id: 4, 
    name: "Pure Natural Oud & Amber Musk (12ml)", 
    category: "Attar", 
    price: 24.00, 
    rating: 4.7, 
    reviews: 64,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
    description: "Alcohol-free traditional Sunnah perfume oil with rich notes of Cambodian agarwood and white musk."
  },
  { 
    id: 5, 
    name: "Fortress of the Muslim (Hisnul Muslim)", 
    category: "Books", 
    price: 14.50, 
    rating: 4.9, 
    reviews: 340,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    description: "Compact hardcover handbook of authentic daily supplications, morning and evening remembrance from Sahih Hadith."
  },
  { 
    id: 6, 
    name: "Natural Olive Wood Miswak (Pack of 4)", 
    category: "Accessories", 
    price: 9.99, 
    rating: 4.8, 
    reviews: 180,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    description: "Fresh natural Sewak toothsticks sourced from the Salvadora persica tree, following the Prophet's Sunnah."
  }
];

export default function Store() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = ['All', 'Mats', 'Accessories', 'Art', 'Attar', 'Books'];

  const filteredProducts = selectedCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showSuccess(`Added "${product.name}" to cart!`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    setCart([]);
    setIsCartOpen(false);
    showSuccess("JazakAllah Khair! Order placed successfully.");
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd]">
      <header className="p-6 bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
              <ChevronLeft size={22} className="text-slate-800" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">Islamic Store</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Sunnah & Faith Goods</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-colors"
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 rounded-[32px] text-white flex items-center justify-between overflow-hidden relative shadow-xl shadow-emerald-900/10">
          <div className="relative z-10">
            <span className="bg-white/20 text-emerald-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
              Special Blessed Offer
            </span>
            <h2 className="text-xl font-black mt-2 mb-1">Authentic Islamic Goods</h2>
            <p className="text-xs text-emerald-100 font-medium">Quality mats, tasbihs, and pure attars</p>
          </div>
          <Tag size={52} className="text-emerald-400 opacity-40 -rotate-12 shrink-0" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black text-amber-600 flex items-center gap-1 shadow-sm">
                    <Star size={11} fill="currentColor" /> {product.rating}
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                  <h3 className="text-xs font-black text-slate-800 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="p-3.5 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-emerald-600 font-black text-sm">${product.price.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400">{product.reviews} reviews</span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-emerald-200"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              exit={{ y: 150 }}
              className="bg-white w-full max-w-md rounded-t-[36px] sm:rounded-[36px] p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" size={20} />
                  <h2 className="text-lg font-black text-slate-800">Your Basket</h2>
                  <span className="text-xs font-bold text-slate-400">({totalItems} items)</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-[160px]">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Your cart is currently empty.
                  </div>
                ) : (
                  cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                        <p className="text-[11px] text-emerald-600 font-black">${(product.price * quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:text-rose-500">
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:text-emerald-600">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm font-black text-slate-800">
                    <span>Total Amount</span>
                    <span className="text-emerald-600 text-base">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-200 active:scale-98 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
