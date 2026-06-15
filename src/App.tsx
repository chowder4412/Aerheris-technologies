/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  X, 
  Eye, 
  EyeOff, 
  User, 
  Github, 
  Network, 
  Cpu, 
  Shield, 
  Zap, 
  Wifi, 
  Terminal, 
  CheckCircle2, 
  Activity,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Database,
  Compass,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Menu,
  Plus,
  Minus,
  Trash2,
  Check,
  Smartphone,
  Share2,
  Headphones,
  LayoutGrid,
  CreditCard,
  Bell,
  LogOut,
  FileText,
  Laptop,
  Truck,
  Box,
  Watch
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
  specs: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'vision-pro',
    title: 'Aetheris Vision Pro',
    category: 'AUGMENTED REALITY',
    price: 2499.00,
    image: '/src/assets/images/aetheris_vision_pro_1781348217508.jpg',
    description: 'Experience the next generation of neural-synced wearables designed for peak human performance.',
    specs: [
      'Dual 4K Holographic Micro-OLED screens',
      'Neuro-entangled thought interface v2',
      '120Hz smooth fluid telemetry tracking',
      'Quantum spatial surrounding layout acoustics'
    ]
  },
  {
    id: 'lumina-desk',
    title: 'Lumina Desk Array',
    category: 'LIGHTING ECOSYSTEM',
    price: 189.00,
    image: '/src/assets/images/lumina_desk_array_1781348231329.jpg',
    description: 'Reactive ambient lighting that syncs with your neural focus levels.',
    specs: [
      'Full RGB spectrum sub-orbital sync',
      'Thought-flicker suppression algorithm',
      'Ambient focus-driven power gating',
      'Pure solid state carbon composite frame'
    ]
  },
  {
    id: 'lens-g2',
    title: 'Aetheris Lens G2',
    category: 'AUGMENTED REALITY',
    price: 899.00,
    image: '/src/assets/images/aetheris_lens_g2_1781348244607.jpg',
    description: 'Lightweight AR glasses featuring 4K per-eye holographic projection.',
    specs: [
      'Carbon-aerogel ultralight frame (18g)',
      'Direct optic wave-guide light field',
      'Real-time physical world categorization AI',
      '6-hour active sub-orbital battery link'
    ]
  },
  {
    id: 'nexus-keys',
    title: 'Nexus Haptic Keys',
    category: 'ECOSYSTEM ACCESSORIES',
    price: 349.00,
    image: '/src/assets/images/nexus_haptic_keys_1781348257950.jpg',
    description: 'Magnetic levitation switches with customizable per-key OLED icons.',
    specs: [
      'Magnetic Hall-effect dynamic switches',
      'Individual per-key active micro-displays',
      'Direct cyber-node telemetry socket',
      'Machined aerospace-grade aluminum chassis'
    ]
  },
  {
    id: 'tab-pro-14',
    title: 'Aetheris Tab Pro 14',
    category: 'TITANIUM GRAPHITE • 1TB',
    price: 1499.00,
    image: '/src/assets/images/aetheris_tablet_1781347848937.jpg',
    description: 'High-performance tactical command tablet forged in aerospace titanium composite.',
    specs: [
      '14-inch Quantum Holographic display',
      'Titanium graphite carbon frame construction',
      '1TB high-speed secure cloud core drive',
      'Active pen tactile feedback engine'
    ]
  },
  {
    id: 'sonic-core-s1',
    title: 'Sonic Core S1',
    category: 'NEON PULSE EDITION',
    price: 349.00,
    image: '/src/assets/images/sonic_core_s1_headphone_1781349536255.jpg',
    description: 'Immersive sound isolating acoustics featuring active bio-haptic dynamic drivers.',
    specs: [
      'High-definition immersive cyber soundscape',
      'Neon pulse edition aesthetic outlines',
      'Active real-time sound cancellation shield',
      '120-hour tactical battery runtime limit'
    ]
  }
];

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
}

export default function App() {
  const [view, setView] = useState<'welcome' | 'auth' | 'dashboard' | 'learn-more'>('welcome');
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  
  // Dashboard Specific Tabs
  const [dashboardTab, setDashboardTab] = useState<'discover' | 'cart' | 'orders' | 'profile'>('discover');
  
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Dynamic Product details inspect modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Simulation Interactive System Log Terminal
  const [userEmail, setUserEmail] = useState('pilot@aetheris.tech');
  const [userCallsign, setUserCallsign] = useState('star_pilot_01');
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(0.12);
  const [cpuLoad, setCpuLoad] = useState(38);
  const [sysLog, setSysLog] = useState<string[]>([
    'INIT: Core systems initializing...',
    'NET: Cybernetic terminal link connected',
    'SEC: 256-bit Neural Shield fully engaged',
    'SYS: Storage diagnostics nominal'
  ]);
 
  // Bottom Nav items helper
  const navTabs = [
    { id: 'discover', name: 'Discover', icon: Compass },
    { id: 'cart', name: 'Cart', icon: ShoppingBag, badge: true },
    { id: 'orders', name: 'Orders', icon: ClipboardList },
    { id: 'profile', name: 'Profile', icon: User }
  ] as const;

  // Active Cart State - Prepopulate with Aetheris Tab Pro 14 and Sonic Core S1
  // to EXACTLY match the "2" item badge on the screenshot on screen load!
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS.find(p => p.id === 'tab-pro-14') || PRODUCTS[4], quantity: 1 },
    { product: PRODUCTS.find(p => p.id === 'sonic-core-s1') || PRODUCTS[5], quantity: 1 }
  ]);

  // Historical Order list simulation state
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'AETH-90812-TX',
      date: '2026-06-12 18:42',
      items: [
        { product: PRODUCTS[3], quantity: 1 }
      ],
      total: 349.00,
      status: 'SHIPPED VIA SUB-ORBITAL DRONE'
    }
  ]);

  // Checkout detailed form states
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [firstName, setFirstName] = useState('Lumi');
  const [lastName, setLastName] = useState('Aetheris');
  const [streetAddress, setStreetAddress] = useState('77 Cyberia Drive, Sector 4');
  const [city, setCity] = useState('Neo Tokyo');
  const [postalCode, setPostalCode] = useState('880-991');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  useEffect(() => {
    if (useSavedAddress) {
      setFirstName('Lumi');
      setLastName('Aetheris');
      setStreetAddress('77 Cyberia Drive, Sector 4');
      setCity('Neo Tokyo');
      setPostalCode('880-991');
    }
  }, [useSavedAddress]);

  // Checkout process visual state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);

  // Toast notification system
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Real-time telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = (Math.random() - 0.5) * 0.02;
        return Math.max(0.08, Math.min(0.15, Number((prev + delta).toFixed(3))));
      });
      setCpuLoad(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 6);
        return Math.max(25, Math.min(64, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // System uptime counter
  useEffect(() => {
    let timerID: NodeJS.Timeout;
    if (view === 'dashboard') {
      timerID = setInterval(() => {
        setUptime(prev => prev + 1);
      }, 1000);
    } else {
      setUptime(0);
    }
    return () => clearInterval(timerID);
  }, [view]);

  // Terminal logging logic
  useEffect(() => {
    if (view !== 'dashboard') return;
    const logInterval = setInterval(() => {
      const logs = [
        'SEC: Port scan blocked on layer 7',
        'SYS: Optimizing quantum memory buffer',
        'NET: High-performance routing updated',
        'DB: Encrypted transaction synced successfully',
        'SEC: Core permissions audit complete',
        'SYS: Temperature stable at 41.5°C',
        'NET: Sub-orbital relay status: Nominal',
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const prefix = ['INFO', 'NOMINAL', 'SECURE', 'SYNC'][Math.floor(Math.random() * 4)];
      setSysLog(prev => [`${prefix}: ${randomLog}`, ...prev.slice(0, 5)]);
    }, 5000);
    return () => clearInterval(logInterval);
  }, [view]);

  // Firebase auth state and database synchronization
  useEffect(() => {
    let unsubCart: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      // Clean up previous listeners if user changes or logs out
      if (unsubCart) {
        unsubCart();
        unsubCart = null;
      }
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }

      if (user) {
        setUserEmail(user.email || '');
        
        // 1. Fetch historical/active user document in /users/{userId}
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then((userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserCallsign(data.callsign || user.email?.split('@')[0] || 'pilot');
          } else {
            const tempCallsign = user.displayName?.toLowerCase().replace(/\s+/g, '_') || user.email?.split('@')[0] || 'pilot';
            setDoc(userRef, {
              userId: user.uid,
              email: user.email || '',
              callsign: tempCallsign,
              updatedAt: new Date().toISOString()
            }).then(() => {
              setUserCallsign(tempCallsign);
            }).catch(err => {
              console.error("Error creating user profile document:", err);
            });
          }
        }).catch(err => {
          console.error("Error checking user profile:", err);
        });

        // 2. Clear out manual local storage states and bind realtime sync
        // Sync Cart Items subcollection
        const cartRef = collection(db, 'users', user.uid, 'cart');
        unsubCart = onSnapshot(cartRef, (snapshot) => {
          const items: CartItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const product = PRODUCTS.find(p => p.id === data.productId);
            if (product) {
              items.push({
                product,
                quantity: data.quantity || 1
              });
            }
          });
          setCart(items);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}/cart`);
        });

        // Sync Orders subcollection
        const ordersRef = collection(db, 'users', user.uid, 'orders');
        unsubOrders = onSnapshot(ordersRef, (snapshot) => {
          const fetchedOrders: Order[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const orderItems: CartItem[] = (data.items || []).map((item: any) => {
              const p = PRODUCTS.find(prod => prod.id === item.productId);
              return {
                product: p || PRODUCTS[0],
                quantity: item.quantity || 1
              };
            });
            fetchedOrders.push({
              id: data.id,
              date: data.date,
              total: data.total,
              status: data.status,
              items: orderItems
            });
          });
          // Descending sort
          fetchedOrders.sort((a, b) => b.date.localeCompare(a.date));
          setOrders(fetchedOrders);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}/orders`);
        });

        setIsAuthChecking(false);
      } else {
        // Logged out states
        setUserEmail('pilot@aetheris.tech');
        setUserCallsign('star_pilot_01');
        setIsAuthChecking(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubCart) unsubCart();
      if (unsubOrders) unsubOrders();
    };
  }, [firebaseUser]);

  // Cart Management Handlers with Cloud Storage
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (firebaseUser) {
      try {
        const itemRef = doc(db, 'users', firebaseUser.uid, 'cart', product.id);
        const currentItem = cart.find(item => item.product.id === product.id);
        const newQuantity = currentItem ? currentItem.quantity + quantity : quantity;
        
        await setDoc(itemRef, {
          productId: product.id,
          quantity: newQuantity,
          updatedAt: new Date().toISOString()
        });
        triggerNotification(`Added "${product.title}" to neural package allocation.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/cart/${product.id}`);
      }
    } else {
      setCart(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
      triggerNotification(`Added "${product.title}" to neural package allocation.`, 'success');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (firebaseUser) {
      if (quantity <= 0) {
        try {
          const itemRef = doc(db, 'users', firebaseUser.uid, 'cart', productId);
          await deleteDoc(itemRef);
          triggerNotification('Product allocation decommissioned.', 'info');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/cart/${productId}`);
        }
        return;
      }
      try {
        const itemRef = doc(db, 'users', firebaseUser.uid, 'cart', productId);
        await setDoc(itemRef, {
          productId,
          quantity,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/cart/${productId}`);
      }
    } else {
      if (quantity <= 0) {
        setCart(prev => prev.filter(item => item.product.id !== productId));
        triggerNotification('Product allocation decommissioned.', 'info');
        return;
      }
      setCart(prev => prev.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Provide a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters for security';
    }

    if (authTab === 'register') {
      if (!callsign) {
        newErrors.callsign = 'Username or Callsign is required';
      }
      if (password !== repeatPassword) {
        newErrors.repeatPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerNotification('Validation check failed. Please check inputs.', 'error');
      return;
    }

    setIsLoading(true);
    triggerNotification(
      authTab === 'signin' 
        ? 'Signing in...' 
        : 'Creating your account...', 
      'info'
    );

    const performAuth = async () => {
      try {
        if (authTab === 'signin') {
          await signInWithEmailAndPassword(auth, email, password);
          triggerNotification('Logged in successfully!', 'success');
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            userId: user.uid,
            email: email,
            callsign: callsign || email.split('@')[0],
            updatedAt: new Date().toISOString()
          });
          setUserCallsign(callsign || email.split('@')[0]);
          triggerNotification('Account created successfully!', 'success');
        }
        setDashboardTab('discover');
        setView('dashboard');
      } catch (error: any) {
        console.error("Auth Error:", error);
        let errorMsg = error.message;
        if (error.code === 'auth/email-already-in-use') {
          errorMsg = 'This email is already registered.';
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          errorMsg = 'Incorrect email or password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
          errorMsg = 'No account found with this email. Please register.';
        }
        setErrors({ general: errorMsg });
        triggerNotification(errorMsg, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    performAuth();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    triggerNotification('Connecting with Google login...', 'info');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const tempCallsign = user.displayName?.toLowerCase().replace(/\s+/g, '_') || user.email?.split('@')[0] || 'pilot';
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          userId: user.uid,
          email: user.email || '',
          callsign: tempCallsign,
          updatedAt: new Date().toISOString()
        });
      }
      setUserCallsign(tempCallsign);
      triggerNotification('Logged in successfully with Google!', 'success');
      setDashboardTab('discover');
      setView('dashboard');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      triggerNotification(error.message || 'Google authentication connection failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip Login bypass of sandbox demo
  const handleDemoBypass = async () => {
    setIsLoading(true);
    triggerNotification('Signing in as a guest...', 'info');
    const email = 'pilot@aetheris.tech';
    const password = 'aetheris123';
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }
      triggerNotification('Logged in successfully as guest.', 'success');
      setDashboardTab('discover');
      setView('dashboard');
    } catch (error: any) {
      console.error("Bypass error:", error);
      setUserEmail(email);
      setUserCallsign('star_pilot_01');
      triggerNotification('Bypass active in local demo mode.', 'info');
      setDashboardTab('discover');
      setView('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Checkout sequence simulation
  const handleCheckoutProtocol = async () => {
    if (cart.length === 0) {
      triggerNotification('Package allocation is currently empty.', 'error');
      return;
    }
    setIsCheckingOut(true);
    setCheckoutStep(1);
    
    // Simulate high tech authorization stages
    setTimeout(() => {
      setCheckoutStep(2); // auth ledger
      setTimeout(() => {
        setCheckoutStep(3); // drone routing sync
        setTimeout(async () => {
          // Success checkout
          const orderId = `AETH-${Math.floor(10000 + Math.random() * 90000)}-TX`;
          const orderDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
          const orderTotal = calculateSubtotal() * 1.08;

          const finalizedOrder: Order = {
            id: orderId,
            date: orderDate,
            items: [...cart],
            total: orderTotal,
            status: 'PROVISIONING TRANSMISSION RELAY'
          };

          if (firebaseUser) {
            try {
              const orderRef = doc(db, 'users', firebaseUser.uid, 'orders', orderId);
              await setDoc(orderRef, {
                id: orderId,
                date: orderDate,
                total: orderTotal,
                status: 'PROVISIONING TRANSMISSION RELAY',
                userId: firebaseUser.uid,
                createdAt: new Date().toISOString(),
                items: cart.map(item => ({
                  productId: item.product.id,
                  quantity: item.quantity
                }))
              });

              const cartSnapshot = await getDocs(collection(db, 'users', firebaseUser.uid, 'cart'));
              await Promise.all(cartSnapshot.docs.map(doc => deleteDoc(doc.ref)));

            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/orders/${orderId}`);
            }
          } else {
            setOrders(prev => [finalizedOrder, ...prev]);
            setCart([]); // Clear allocated items
          }

          setCheckoutStep(4);
          triggerNotification('Transaction fully secured. Drone relay queued.', 'success');
        }, 1500);
      }, 1500);
    }, 1200);
  };

  // Get total quantity of items in Cart
  const getCartTotalCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col font-sans relative select-none selection:bg-cyan-500 selection:text-black antialiased">
      
      {/* Toast Notification Banner overlays */}
      {notification && (
        <div id="toast-banner" className="fixed top-6 right-6 z-50 animate-bounce transition-all max-w-sm px-4">
          <div className={`p-4 rounded-xl border flex items-center gap-3 backdrop-blur-xl shadow-2xl ${
            notification.type === 'success' 
              ? 'bg-zinc-950/95 border-emerald-500/50 text-emerald-400 shadow-emerald-950/20' 
              : notification.type === 'error'
              ? 'bg-zinc-950/95 border-rose-500/50 text-rose-400 shadow-rose-950/20'
              : 'bg-zinc-950/95 border-cyan-500/50 text-cyan-400 shadow-cyan-950/20'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-ping ${
              notification.type === 'success' ? 'bg-emerald-400' : notification.type === 'error' ? 'bg-rose-400' : 'bg-cyan-400'
            }`} />
            <p className="font-mono text-[11px] tracking-wide leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Decorative gradient glowing backing shapes */}
      {view !== 'dashboard' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#091518] to-transparent opacity-30"></div>
          <div className="absolute top-[25%] right-[-10%] w-[480px] h-[480px] bg-gradient-radial from-[rgba(6,182,212,0.05)] to-transparent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-[15%] left-[-15%] w-[520px] h-[520px] bg-gradient-radial from-[rgba(168,85,247,0.03)] to-transparent rounded-full filter blur-3xl"></div>
        </div>
      )}

      {/* ======================================= */}
      {/* SECTION 1: THE WELCOME SPLASH PAGE       */}
      {/* ======================================= */}
      {view === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between relative z-10 max-w-7xl mx-auto w-full px-6 md:px-8 py-8 md:py-12">
          
          {/* Splash Header */}
          <header className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <span className="text-[#00F3FF]">
                <Cpu size={20} className="animate-pulse" />
              </span>
              <span id="welcome-logo" className="text-white text-base font-bold tracking-[0.4em] uppercase font-sans">
                Aetheris
              </span>
            </div>
            <button 
              onClick={() => { setAuthTab('signin'); setView('auth'); }}
              className="text-xs font-mono tracking-widest text-[#00F3FF] hover:text-cyan-300 transition-all px-4 py-2 border border-[#00F3FF]/20 rounded-full hover:bg-cyan-500/5 cursor-pointer uppercase"
            >
              Sign In
            </button>
          </header>

          {/* Main Hero & Graphic Display Section */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center justify-center my-auto py-8">
            
            {/* Left Narrative Text column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400 tracking-wider font-mono mb-6 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                v4.0.0 Hardware Sync Available
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6 font-sans">
                Shop Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00F3FF]">Smart Tech</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10">
                Welcome to Aetheris, the premium boutique for smart technologies. Browse, customize, and buy elite wearable devices, high-performance command tablets, and immersive audio systems designed by industry specialists and powered by Superbros Inc.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  id="welcome-start"
                  onClick={() => { setAuthTab('register'); setView('auth'); }}
                  className="bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-semibold tracking-wider text-xs sm:text-sm py-4 px-10 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] cursor-pointer text-center w-full sm:w-auto uppercase font-mono transform hover:-translate-y-0.5"
                >
                  Get Started <ArrowRight size={16} strokeWidth={2.5} />
                </button>

                <button
                  id="welcome-specs"
                  onClick={() => setView('learn-more')}
                  className="border border-zinc-805 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-900/40 text-zinc-300 hover:text-white font-semibold tracking-wider text-xs sm:text-sm py-4 px-10 rounded-full transition-all duration-300 cursor-pointer text-center w-full sm:w-auto uppercase font-mono transform hover:-translate-y-0.5"
                >
                  Learn More
                </button>
              </div>

              {/* Counter status displays */}
              <div className="w-full border-t border-zinc-900 mt-12 pt-8 grid grid-cols-2 gap-4 max-w-md">
                <div>
                  <div className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight text-white mb-1">
                    0.1ms
                  </div>
                  <div className="text-[10px] tracking-widest text-zinc-500 font-mono font-bold uppercase">
                    Response Time
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-[#00F3FF] bg-clip-text text-transparent mb-1">
                    256-bit
                  </div>
                  <div className="text-[10px] tracking-widest text-zinc-500 font-mono font-bold uppercase">
                    Neural Security
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Futuristic Tablet Ring graphic */}
            <div className="lg:col-span-5 flex items-center justify-center relative py-6 w-full">
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                
                {/* Simulated grid line orbits */}
                <div className="absolute w-[114%] h-[114%] border border-zinc-900/30 rounded-full pointer-events-none" />
                <div className="absolute w-[100%] h-[100%] border border-zinc-900/40 rounded-full pointer-events-none" />
                <div className="absolute w-[86%] h-[86%] border border-[#00f3ff]/5 rounded-full pointer-events-none animate-pulse" />
                
                {/* Tech glowing dots */}
                <div className="absolute top-[14%] left-[14%] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 bg-purple-500 rounded-full opacity-60" />
                
                <div id="welcome-tablet-frame" className="relative z-10 w-[84%] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.12)] border border-zinc-800 bg-black/50 p-1 flex items-center justify-center">
                  <img
                    src="/src/assets/images/aetheris_tablet_1781347848937.jpg"
                    alt="Aetheris Cyber Core Smart Tablet"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

          </main>

          {/* Simple footer declaration */}
          <footer className="py-8 text-center border-t border-[#121215] text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex flex-col items-center justify-center gap-1.5 select-none">
            <div>// DESIGNED FOR PRECISION & SYSTEM ACCESS</div>
            <div className="text-zinc-600 tracking-normal font-sans font-medium text-[11px] mt-1">
              Powered by <span className="text-zinc-400 font-semibold hover:text-[#00F3FF] transition-colors">Superbros Inc</span>
            </div>
          </footer>
        </div>
      )}

      {/* ======================================= */}
      {/* SECTION 1B: SYSTEM DEEP DIVE (LEARN MORE)*/}
      {/* ======================================= */}
      {view === 'learn-more' && (
        <div className="flex-1 flex flex-col justify-between relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-8 animate-[fadeIn_0.4s_ease-out]">
          
          {/* Header */}
          <header className="flex justify-between items-center py-4 border-b border-zinc-900/60">
            <button 
              onClick={() => setView('welcome')}
              className="flex items-center gap-2 text-zinc-400 hover:text-[#00F3FF] transition-all cursor-pointer font-mono text-xs uppercase bg-transparent border-0 outline-none p-0"
              id="learn-more-back-btn"
            >
              <ArrowLeft size={16} className="text-[#00F3FF]" /> Welcome Screen
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                SYSTEM BRIEFING
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="py-10 max-w-5xl mx-auto w-full text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-900/45 pb-8 animate-[fadeIn_0.5s_ease-out]">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-sans">
                  AETHERIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00F3FF]">SMART SHOP</span>
                </h1>
                <p className="text-xs font-mono text-[#00F3FF] tracking-wider uppercase font-bold">
                  Browse, configure, and shop premium next-generation cognitive devices.
                </p>
              </div>

              {/* Powered by Pill */}
              <div className="inline-flex items-center gap-3 px-4.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl">
                <div className="w-2 h-2 rounded-full bg-[#00F3FF] animate-pulse" />
                <div className="text-left font-sans select-none">
                  <p className="text-[8.5px] font-mono tracking-widest text-[#a1a1aa] uppercase font-bold">ECOSYSTEM PARTNER</p>
                  <p className="text-xs font-bold text-white tracking-wide">Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00F3FF] font-black">Superbros Inc</span></p>
                </div>
              </div>
            </div>

            {/* Core Tech Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Card 1: Smart Technology Marketplace */}
              <div className="bg-[#0b0b0d]/95 border border-zinc-900 rounded-2xl p-6 hover:border-[#00F3FF]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                  <Network size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Smart Technology Boutique</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Explore and shop our curated catalog of elite wearables, tablets, and acoustics. From neural 4K screens to titanium graphic frames, every piece represents the peak of human augmentation.
                </p>
                <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>DISPATCH READINESS</span>
                  <span className="text-purple-400 font-bold">IMMEDIATE STOCK</span>
                </div>
              </div>

              {/* Card 2: Secure Shopping Transactions */}
              <div className="bg-[#0b0b0d]/95 border border-[#141416] rounded-2xl p-6 hover:border-[#00F3FF]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F3FF]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#00F3FF]/10 transition-all" />
                <div className="w-10 h-10 rounded-xl bg-cyan-950/20 border border-[#00F3FF]/20 flex items-center justify-center text-[#00F3FF] mb-5">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Authenticated Checkout</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Shop securely with pre-configured payment channels. Our elegant, simplified cart allows instant card setups, digital currency, or express apple wallets backed by Superbros Inc encryption.
                </p>
                <div className="border-t border-[#161619] pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>PAYMENT SECURITY</span>
                  <span className="text-[#00F3FF] font-bold">256-BIT ENCRYPTED</span>
                </div>
              </div>

              {/* Card 3: Parcel Dispatch and Tracking */}
              <div className="bg-[#0b0b0d]/95 border border-[#141416] rounded-2xl p-6 hover:border-[#00F3FF]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-all" />
                <div className="w-10 h-10 rounded-xl bg-pink-950/20 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Precision Order Tracking</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Track your sub-orbital drone shipments in real time. Our integrated transaction ledger delivers status updates from initial load allocation to final drop security verification.
                </p>
                <div className="border-t border-[#161619] pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>DISPATCH SYSTEM</span>
                  <span className="text-pink-400 font-bold">LIVE TELEMETRY</span>
                </div>
              </div>
            </div>

            {/* In-depth Specs Table */}
            <div className="bg-[#0c0c0e]/95 border border-[#141416] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F3FF]/20 to-transparent" />
              
              <div>
                <h3 className="text-xl font-bold text-white select-none">Smart Technologies Retail Guidelines</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  Aetheris is an elite e-commerce node that empowers humanity with high-tech smart solutions. All transactions are securely routed via Superbros Inc infrastructures.
                </p>
              </div>

              <div className="border-t border-[#121214] pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-[#0f0f11] text-sm gap-2">
                  <span className="font-mono text-xs text-zinc-500 uppercase font-bold tracking-wider">// RETAIL SEGMENT</span>
                  <span className="text-zinc-200 font-medium font-sans">Premium Augmented Reality, Command Tablets, and Haptic Hearables</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-[#0f0f11] text-sm gap-2">
                  <span className="font-mono text-xs text-zinc-500 uppercase font-bold tracking-wider">// PLATFORM BACKEND</span>
                  <span className="text-zinc-200 font-medium font-sans">Superbros Inc Quantum-Core Cloud (8nm Secured Network Node)</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-[#0f0f11] text-sm gap-2">
                  <span className="font-mono text-xs text-zinc-500 uppercase font-bold tracking-wider">// SHIPMENT INFRASTRUCTURE</span>
                  <span className="text-zinc-200 font-medium font-sans">Automated Express Sub-Orbital Drone Logistics & Real-Time Tracking</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-[#0f0f11] text-sm gap-2">
                  <span className="font-mono text-xs text-zinc-500 uppercase font-bold tracking-wider">// TRANSACTIONS & AUTHENTICATION</span>
                  <span className="text-zinc-200 font-medium font-sans">Decentralized Neural Ledger, Credit/Debit Stripe Link, and Crypto Keys</span>
                </div>
              </div>

              {/* Call to action at bottom of learn more */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 mt-4 border-t border-[#121214]">
                <div className="text-left">
                  <p className="text-xs font-mono text-[#00F3FF] tracking-wider uppercase font-bold">// Ready to browse smart tech?</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md">Activate your registration to gain access to the interactive shop, customize your order, and monitor delivery.</p>
                </div>
                <button
                  onClick={() => { setAuthTab('register'); setView('auth'); }}
                  id="learn-more-cta-btn"
                  className="bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-extrabold tracking-widest text-xs py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(0,243,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,243,255,0.45)] cursor-pointer text-center w-full sm:w-auto uppercase font-mono transform active:scale-95"
                >
                  CREATE AN ACCOUNT <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </main>

          {/* Simple footer declaration in Learn More */}
          <footer className="py-8 text-center border-t border-zinc-900/50 text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex flex-col items-center justify-center gap-1.5 select-none animate-[fadeIn_0.5s_ease-out]">
            <div>// CORE ARCHITECTURE MANAGED BY AETHERIS SYSTEMS</div>
            <div className="text-zinc-600 tracking-normal font-sans font-medium text-[11px] mt-1">
              Engineered & Powered by <span className="text-zinc-400 font-semibold hover:text-[#00F3FF] transition-colors font-sans">Superbros Inc</span>
            </div>
          </footer>
        </div>
      )}

      {/* ======================================= */}
      {/* SECTION 2: ACCESS AUTH PORTAL           */}
      {/* ======================================= */}
      {view === 'auth' && (
        <div className="flex-1 flex flex-col justify-between relative z-10 w-full max-w-md mx-auto px-6 py-6 min-h-screen">
          
          {/* Header */}
          <header className="flex justify-between items-center py-6">
            <div 
              onClick={() => setView('welcome')} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-[#00F3FF]">
                <Cpu size={18} />
              </span>
              <span className="text-white text-sm font-bold tracking-[0.4em] uppercase font-sans">
                Aetheris
              </span>
            </div>
            
            <button
              onClick={() => setView('welcome')}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-804 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </header>

          {/* Card */}
          <main className="my-auto py-4">
            <div id="auth-panel" className="w-full rounded-2xl border border-zinc-800 bg-[#0d0d0f]/95 backdrop-blur-xl shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
              
              {/* Select tabs */}
              <div className="flex border-b border-zinc-900">
                <button
                  type="button"
                  onClick={() => { setAuthTab('signin'); setErrors({}); }}
                  className={`w-1/2 py-4 text-center font-mono text-xs tracking-widest uppercase font-bold cursor-pointer transition-colors ${
                    authTab === 'signin' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Sign In
                  {authTab === 'signin' && (
                    <div className="absolute bottom-0 left-0 right-1/2 translate-x-1/2 w-1/3 h-[2px] bg-cyan-440 bg-[#00F3FF]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setErrors({}); }}
                  className={`w-1/2 py-4 text-center font-mono text-xs tracking-widest uppercase font-bold cursor-pointer transition-colors ${
                    authTab === 'register' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Register
                  {authTab === 'register' && (
                    <div className="absolute bottom-0 left-1/2 right-0 -translate-x-1/2 w-1/3 h-[2px] bg-cyan-440 bg-[#00F3FF]" />
                  )}
                </button>
              </div>

              {/* Form padding */}
              <div className="p-6 sm:p-8">
                
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-sans select-none text-left">
                    {authTab === 'signin' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans text-left">
                    {authTab === 'signin' 
                      ? 'Sign in to access your personal dashboard and orders.' 
                      : 'Fill in your details below to create your account.'}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {authTab === 'register' && (
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                        Your Name / Callsign
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                          <User size={15} />
                        </span>
                        <input
                          type="text"
                          value={callsign}
                          onChange={(e) => setCallsign(e.target.value)}
                          placeholder="e.g. john_doe"
                          className="w-full rounded-xl bg-[#09090b] border border-zinc-800 focus:border-[#00F3FF] focus:outline-none py-3 pl-10 pr-4 text-white font-mono text-xs transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                        <Mail size={15} />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl bg-[#09090b] border border-zinc-800 focus:border-[#00F3FF] focus:outline-none py-3 pl-10 pr-4 text-white font-mono text-xs transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                        Password
                      </label>
                      {authTab === 'signin' && (
                        <button
                          type="button"
                          onClick={() => triggerNotification('A password reset link has been sent to your email.', 'info')}
                          className="text-[9px] font-mono tracking-wider text-cyan-400 hover:text-cyan-300 uppercase font-bold cursor-pointer bg-transparent border-0"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                        <Lock size={15} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-[#09090b] border border-zinc-800 focus:border-[#00F3FF] focus:outline-none py-3 pl-10 pr-10 text-white font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.password}</p>
                    )}
                  </div>

                  {authTab === 'register' && (
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                          <Lock size={15} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl bg-[#09090b] border border-[#1b1b22] focus:border-[#00F3FF] focus:outline-none py-3 pl-10 pr-4 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-semibold tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] cursor-pointer uppercase font-mono disabled:opacity-55 disabled:cursor-not-allowed mt-4 transform active:scale-95"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      authTab === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </button>

                </form>

                {/* Third Party auth connectors exactly like design */}
                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-900" />
                  </div>
                  <span className="relative px-3 bg-[#0d0d0f] text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                    OR CONTINUE WITH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-300 hover:text-white font-medium py-2.5 px-4 font-sans text-xs transition-all cursor-pointer"
                  >
                    <Network size={13} className="text-cyan-400" />
                    <span>Google</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerNotification('Connecting to GitHub...', 'info');
                      setTimeout(() => triggerNotification('GitHub connected successfully.', 'success'), 1000);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-300 hover:text-white font-medium py-2.5 px-4 font-sans text-xs transition-all cursor-pointer"
                  >
                    <Github size={13} className="text-purple-400" />
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Sandbox Bypass link */}
                <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
                  <button
                    onClick={handleDemoBypass}
                    className="text-[10px] font-mono tracking-wider text-zinc-500 hover:text-cyan-400 transition-colors uppercase cursor-pointer border-0 bg-transparent"
                  >
                    Demo Access (One-Click Sign In)
                  </button>
                </div>

              </div>
            </div>
          </main>

          <footer className="py-2 text-center text-[9px] font-mono tracking-widest text-zinc-700 uppercase">
            AETHERIS SECURE AUTHENTICATION SYSTEM
          </footer>

        </div>
      )}

      {/* ======================================= */}
      {/* SECTION 3: NEURAL DASHBOARD             */}
      {/* ======================================= */}
      {view === 'dashboard' && (
        <div className="flex-1 flex flex-col pb-24 md:pb-28">
          
          {/* Exact Top Nav Bar matching second image */}
          {/* Exact Top Nav Bar matching second image, custom on Checkout Page */}
          {dashboardTab === 'cart' && showCheckoutPage ? (
            <header className="sticky top-0 bg-[#070708]/95 backdrop-blur-md border-b border-zinc-90 w-full z-40 px-5 py-5.5 flex items-center justify-between border-b border-zinc-900 max-w-lg mx-auto">
              <button
                onClick={() => setShowCheckoutPage(false)}
                className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors cursor-pointer bg-transparent border-0 outline-none p-0"
                id="header-back-to-cart"
              >
                <ArrowLeft size={18} className="text-[#00F3FF]" />
                <span className="text-[#00F3FF] text-[15px] font-bold tracking-[0.45em] uppercase font-sans select-none">
                  AETHERIS
                </span>
              </button>
              
              <div className="w-10 h-10 flex items-center justify-end text-white">
                <Lock size={19} className="text-white" />
              </div>
            </header>
          ) : (
            <header className="sticky top-0 bg-[#070708]/90 backdrop-blur-md border-b border-zinc-90 w-full z-40 px-5 md:px-8 py-5.5 flex items-center justify-between border-b border-zinc-900">
              {/* Hamburger menu button or back button when product is inspected */}
              <button
                onClick={() => {
                  if (selectedProduct) {
                    setSelectedProduct(null);
                  } else {
                    triggerNotification('Operational settings drawer locked.', 'info');
                  }
                }}
                className="w-10 h-10 flex items-center justify-start text-white hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {selectedProduct ? (
                  <ChevronRight size={22} className="transform rotate-180 text-[#00F3FF]" />
                ) : (
                  <Menu size={22} />
                )}
              </button>

              {/* Centered branding exactly as shown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#00F3FF] text-[15px] font-bold tracking-[0.45em] uppercase font-sans select-none">
                  AETHERIS
                </span>
              </div>

              {/* Shopping Cart with purple count badge exactly as shown in screenshot */}
              <button
                onClick={() => setDashboardTab('cart')}
                className="relative w-10 h-10 flex items-center justify-end text-white hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <ShoppingCart size={21} />
                {getCartTotalCount() > 0 && (
                  <div className="absolute top-0 right-[-3px] bg-[#6d28d9] text-white text-[9.5px] font-mono font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border border-[#070708] select-none">
                    {getCartTotalCount()}
                  </div>
                )}
              </button>
            </header>
          )}

          {selectedProduct ? (
            <div className="flex-1 overflow-y-auto no-scrollbar max-w-lg mx-auto w-full px-5 pt-4 pb-20 text-left animate-[fadeIn_0.3s_ease-out]">
              {(() => {
                const detailsMap: Record<string, {
                  badge: string;
                  headline: string;
                  description: string;
                  feature1: { icon: string; title: string; desc: string };
                  feature2: { icon: string; title: string; desc: string };
                  specsTable: { label: string; val: string }[];
                  tagline: string;
                  taglineDesc: string;
                  reviews: { initial: string; name: string; role: string; quote: string }[];
                }> = {
                  'vision-pro': {
                    badge: 'VISION SERIES // 2024',
                    headline: 'Experience Cognitive Reality',
                    description: 'The Aetheris Vision Pro isn\'t just a wearable; it\'s a synaptic extension of your digital self. Featuring our proprietary Neural-Link interface and 12K micro-OLED displays, the Vision Pro dissolves the boundary between the physical and the virtual. Precision-engineered from aerospace-grade polymers and liquid metal, it offers comfort for extended immersion sessions.',
                    feature1: { icon: 'Eye', title: '12K Resolution', desc: 'Unmatched visual clarity with 4500 PPI.' },
                    feature2: { icon: 'Cpu', title: 'Quantum-X Chip', desc: 'Latency-free spatial computing and AI.' },
                    specsTable: [
                      { label: 'DISPLAY', val: 'Dual Micro-OLED 12K' },
                      { label: 'PROCESSOR', val: 'Aetheris Q-X1 Silicon' },
                      { label: 'BATTERY LIFE', val: '8hrs Active / 24hrs Standby' },
                      { label: 'SENSORS', val: 'LiDAR + 16 IR Trackers' },
                      { label: 'WEIGHT', val: '342 Grams' }
                    ],
                    tagline: 'Built for the Metaverse',
                    taglineDesc: 'The world\'s most advanced spatial audio engine creates a soundscape so real, you\'ll forget where the headset ends and reality begins.',
                    reviews: [
                      { initial: 'JV', name: 'Julian V.', role: 'NEURAL ENGINEER', quote: 'The clarity is actually terrifying. I used it for a 6-hour surgical simulation and completely lost track of time. It\'s the first headset that doesn\'t feel like a gadget.' },
                      { initial: 'SK', name: 'Sienna K.', role: 'CREATIVE DIRECTOR', quote: 'As a spatial designer, the Vision Pro changed my workflow overnight. Being able to manipulate complex 3D meshes with just my eyes is revolutionary.' },
                      { initial: 'MT', name: 'Marcus T.', role: 'SYSTEMS ARCHITECT', quote: 'The weight distribution is perfect. I was worried about the liquid metal frame, but it\'s incredibly light. The passthrough mode is indistinguishable from reality.' }
                    ]
                  },
                  'lumina-desk': {
                    badge: 'LUMINA SERIES // 2024',
                    headline: 'Illuminate Your Creativity',
                    description: 'The Lumina Desk Array transforms your workspace into an dynamic, focus-optimized biome. Projecting active spectrum arrays that match your neural workflow patterns, it helps trigger flow states, minimizes cognitive fatigue, and creates a breathtaking workspace aesthetic.',
                    feature1: { icon: 'Sliders', title: 'Adaptive Ambiance', desc: 'Dynamic spectrum responsive lighting.' },
                    feature2: { icon: 'Activity', title: 'Flow Sensor', desc: 'Syncs brightness with your task depth.' },
                    specsTable: [
                      { label: 'LUMINOUS FLUX', val: '1200 Hyper-lux LED' },
                      { label: 'PROCESSOR', val: 'Synapse G1 Controller' },
                      { label: 'SPECTRUM', val: 'Full Sub-Orbital RGB' },
                      { label: 'CHASSIS', val: 'Anodized Carbon Slate' },
                      { label: 'WEIGHT', val: '1.2 Kilograms' }
                    ],
                    tagline: 'Synchronized Focus Active',
                    taglineDesc: 'Flicker-free micro-LED illumination reduces eye strain and establishes immediate immersive task environments.',
                    reviews: [
                      { initial: 'AL', name: 'Alex L.', role: 'SOFTWARE ARCHITECT', quote: 'Late-night coding has never felt less exhausting. The automated warm-spectrum fading is a complete game changer for my body rhythm.' },
                      { initial: 'HR', name: 'Hana R.', role: 'INDUSTRIAL DESIGNER', quote: 'A stunning sculptural piece. The way the light reflects off the carbon fiber frame is beautiful. Highly recommended.' }
                    ]
                  },
                  'lens-g2': {
                    badge: 'LENS SERIES // 2024',
                    headline: 'Augment Your Visual Intelligence',
                    description: 'Aetheris Lens G2 packs full holographic computing power into a standard glasses form factor. Weighing just 18 grams, it features our groundbreaking Waveguide lightfield projection and on-board real-time environmental analysis AI to serve as your ultimate daily assistant.',
                    feature1: { icon: 'Compass', title: 'Holographic Guides', desc: 'Tactile directional light fields.' },
                    feature2: { icon: 'Shield', title: 'Carbon Aerogel Frame', desc: 'Ultralight weight for daily wear.' },
                    specsTable: [
                      { label: 'RESOLUTION', val: 'Dual Waveguide 4K Projection' },
                      { label: 'PROCESSOR', val: 'Aetheris L-G2 Compact' },
                      { label: 'BATTERY', val: '6hrs Active / 18hrs Standby' },
                      { label: 'NETWORKING', val: 'Sub-Orbital Quantum Link' },
                      { label: 'WEIGHT', val: '18 Grams' }
                    ],
                    tagline: 'Seamlessly Digital, Truly Physical',
                    taglineDesc: 'Our hyper-thin waveguides project sharp text and graphics that interact perfectly with objects in your physical environment.',
                    reviews: [
                      { initial: 'EP', name: 'Elena P.', role: 'AI RESEARCHER', quote: 'Wearing this feels like having a second brain. Navigation prompts overlay directly onto the sidewalk beautifully without blocking my view.' },
                      { initial: 'DK', name: 'David K.', role: 'FIELD TECHNICIAN', quote: 'Super useful for diagnostics. Having repair manuals overlay in real-time onto circuit boards saves me hours every day.' }
                    ]
                  },
                  'nexus-keys': {
                    badge: 'NEXUS SERIES // 2024',
                    headline: 'Command with Physical Precision',
                    description: 'The Nexus Haptic Keys keyboard completely redefines manual digital interfaces. Blending active magnetic Hall-effect key stems with individual programmable micro-OLED screens under every single key cap, it provides infinite customization and dynamic key mapping.',
                    feature1: { icon: 'Sliders', title: 'Hall-Effect Stems', desc: 'Active levitation magnetic action.' },
                    feature2: { icon: 'LayoutGrid', title: 'OLED Keycaps', desc: 'Fully programmable custom key icons.' },
                    specsTable: [
                      { label: 'SWITCH TYPE', val: 'Magnetic Levitation Stems' },
                      { label: 'DYNAMICS', val: 'Adjustable actuation (0.1 - 4.0mm)' },
                      { label: 'INTERFACE', val: 'Cyber-Node Telemetry v3' },
                      { label: 'CASE', val: 'Machined Aerospace Aluminum' },
                      { label: 'WEIGHT', val: '820 Grams' }
                    ],
                    tagline: 'An Interface That Adapts to You',
                    taglineDesc: 'Launch an app and watch your key labels rewrite themselves to match. The ultimate tool for streamlined workflows and complex command arrays.',
                    reviews: [
                      { initial: 'TL', name: 'Tarek L.', role: 'VIDEO EDITOR', quote: 'Having my haptic keyboards dynamically light up with color-coded shortcuts is incredible. Cut my editing time in half!' },
                      { initial: 'MC', name: 'Maya C.', role: 'CYBER SECURITY', quote: 'The haptic feedback is absolute perfection. I adjusted actuation to be extremely quiet but tactile. Typing feel is unmatched.' }
                    ]
                  }
                };

                const data = detailsMap[selectedProduct.id] || detailsMap['vision-pro'];

                const renderFeatureIcon = (iconName: string) => {
                  switch (iconName) {
                    case 'Eye': return <Eye size={18} className="text-[#00F3FF]" />;
                    case 'Cpu': return <Cpu size={18} className="text-[#00F3FF]" />;
                    case 'Sliders': return <Sliders size={18} className="text-[#00F3FF]" />;
                    case 'Activity': return <Activity size={18} className="text-[#00F3FF]" />;
                    case 'Compass': return <Compass size={18} className="text-[#00F3FF]" />;
                    case 'Shield': return <Shield size={18} className="text-[#00F3FF]" />;
                    case 'LayoutGrid': return <LayoutGrid size={18} className="text-[#00F3FF]" />;
                    default: return <Zap size={18} className="text-[#00F3FF]" />;
                  }
                };

                return (
                  <div className="space-y-8 pb-10">
                    {/* Hero product view with ambient glow ring */}
                    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0c0c0e]/80 border border-zinc-900/60 p-6 flex flex-col items-center justify-center aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                      <div className="absolute inset-0 bg-radial-gradient(from_center,_rgba(0,243,255,0.05)_0%,_transparent_70%) pointer-events-none" />
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.title} 
                        className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_15px_30px_rgba(0,243,255,0.15)] filter saturate-110"
                      />
                    </div>

                    {/* Metadata & Branding Block */}
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-950/20 rounded-full px-3 py-1 text-[9px] font-mono tracking-widest text-[#00F3FF] font-bold uppercase select-none">
                        {data.badge}
                      </div>

                      <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">{selectedProduct.title}</h1>
                      
                      <div className="text-2xl font-bold font-mono text-[#00F3FF] tracking-tight">
                        ${selectedProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Marketing Pitch Headline & Long copy description */}
                    <div className="space-y-3 border-t border-zinc-900/50 pt-6">
                      <h2 className="text-lg font-bold text-white tracking-tight">{data.headline}</h2>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{data.description}</p>
                    </div>

                    {/* Side-by-side spec cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Feature 1 */}
                      <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-xl p-4 text-left flex flex-col justify-between space-y-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-950/30 border border-cyan-400/10 flex items-center justify-center">
                          {renderFeatureIcon(data.feature1.icon)}
                        </div>
                        <div>
                          <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase mb-1">{data.feature1.title}</h3>
                          <p className="text-[10px] text-zinc-500 leading-normal">{data.feature1.desc}</p>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-xl p-4 text-left flex flex-col justify-between space-y-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-950/30 border border-cyan-400/10 flex items-center justify-center">
                          {renderFeatureIcon(data.feature2.icon)}
                        </div>
                        <div>
                          <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase mb-1">{data.feature2.title}</h3>
                          <p className="text-[10px] text-zinc-500 leading-normal">{data.feature2.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Specifications key-value matrix container */}
                    <div className="bg-[#0c0c0e]/95 border border-zinc-900 rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] font-mono tracking-widest text-[#00F3FF] uppercase font-black select-none">// TECHNICAL SPECIFICATIONS</span>
                      <div className="space-y-3 pt-1.5">
                        {data.specsTable.map((spec, sIdx) => (
                          <div key={sIdx} className="flex justify-between items-baseline border-b border-zinc-900/40 pb-2 text-[11px] font-mono">
                            <span className="text-zinc-500 uppercase tracking-wider">{spec.label}</span>
                            <span className="text-zinc-200 text-right font-medium">{spec.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Futuristic quote badge/tagline card */}
                    <div className="bg-[#0a0a0c] border border-zinc-900 rounded-2xl p-6 text-center space-y-3 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full filter blur-xl" />
                      <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase">{data.tagline}</h3>
                      <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto">{data.taglineDesc}</p>
                    </div>

                    {/* Early Access reviews slider column */}
                    <div className="space-y-5 pt-4">
                      <div className="flex justify-between items-baseline border-b border-zinc-900 pb-3">
                        <h3 className="text-lg font-bold text-white font-sans">Early Access Reviews</h3>
                        <div className="flex items-center gap-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-mono text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                          4.9 ★★★★★
                        </div>
                      </div>

                      <div className="space-y-4">
                        {data.reviews.map((rev, rIdx) => (
                          <div key={rIdx} className="bg-[#0c0c0e]/90 border border-zinc-900/65 rounded-xl p-5 text-left space-y-3 shadow-lg relative">
                            {/* Review Top row */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                {/* Vector initials custom pilot card avatar */}
                                <div className="w-10 h-10 rounded-full bg-cyan-950/20 border border-cyan-400/25 flex items-center justify-center text-[#00F3FF] font-mono text-[11px] font-bold shadow-[0_0_8px_rgba(0,243,255,0.1)]">
                                  {rev.initial}
                                </div>
                                <div className="text-left font-mono">
                                  <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                                  <span className="text-[8.5px] uppercase font-semibold text-zinc-500 tracking-wider inline-block mt-0.5">{rev.role}</span>
                                </div>
                              </div>
                              <span className="text-[7.5px] font-mono tracking-wider text-emerald-400 uppercase font-black select-none border border-emerald-500/15 bg-emerald-950/10 px-2 py-0.5 rounded">
                                // VERIFIED PROTOCOL
                              </span>
                            </div>

                            {/* Review Quote text */}
                            <p className="text-xs text-zinc-400 italic leading-relaxed font-serif pt-1">
                              "{rev.quote}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <>
              {/* ======================================= */}
              {/* TAB 3A: DISCOVER (Primary shop view)     */}
              {/* ======================================= */}
              {dashboardTab === 'discover' && (
            <div className="animate-[fadeIn_0.4s_ease-out] max-w-lg mx-auto w-full px-5 pt-6 text-left">
              
              {/* Future Release Header */}
              <div className="mb-4">
                <span className="text-[#00F3FF] font-mono text-[10px] tracking-[0.25em] font-semibold uppercase">
                  Future Release 2224
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase mt-2 mb-3 leading-tight select-none">
                  Aetheris X1: Precision Beyond Limits
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans mb-5">
                  Experience the next generation of neural-synced wearables designed for peak human performance.
                </p>

                {/* Hero buttons */}
                <div className="flex gap-3 mb-10">
                  <button
                    onClick={() => {
                      const x1Item = PRODUCTS[0]; // Vision pro as placeholder
                      handleAddToCart(x1Item, 1);
                    }}
                    className="flex-1 bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-mono font-bold text-xs py-3.5 px-4 rounded transition-all tracking-wider text-center cursor-pointer uppercase shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                  >
                    Reserve Now
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(PRODUCTS[0]);
                    }}
                    className="flex-1 border border-zinc-805 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-900/40 text-zinc-300 text-xs font-mono py-3.5 px-4 rounded transition-all tracking-wider uppercase"
                  >
                    Tech Specs
                  </button>
                </div>
              </div>

              {/* NEW ARRIVALS CAROUSEL ROWS */}
              <div className="mb-10 w-full">
                <div className="flex justify-between items-baseline mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-0">
                    New Arrivals
                  </h2>
                  <button 
                    onClick={() => triggerNotification('Continuous loading index synced.', 'info')}
                    className="text-[9px] font-mono tracking-widest text-zinc-500 hover:text-[#00F3FF] uppercase font-bold border-b border-zinc-900 cursor-pointer bg-transparent"
                  >
                    View All
                  </button>
                </div>

                {/* Horizontal Scroll wrapper */}
                <div className="flex gap-4.5 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
                  {PRODUCTS.map(product => (
                    <div 
                      key={product.id}
                      className="min-w-[210px] w-[210px] bg-[#0d0d0f]/90 border border-zinc-900 rounded-xl p-3.5 flex flex-col justify-between snap-start hover:border-zinc-800 transition-all group cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/40 border border-zinc-950 mb-3.5">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="text-left">
                        <span className="text-[9px] font-mono text-purple-400 font-bold tracking-wide uppercase select-none">
                          {product.category}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-100 truncate mt-1 mb-2">
                          {product.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-mono font-bold text-cyan-400 select-none">
                          ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        
                        {/* Interactive Plus round button from design */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, 1);
                          }}
                          className="w-7 h-7 rounded-full border border-cyan-500/25 flex items-center justify-center text-cyan-400 hover:bg-[#00F3FF] hover:text-black hover:border-0 transition-all shadow-[0_0_8px_rgba(6,182,212,0.1)] cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTIONS CATEGORIES (2X2 GRID EXACTLY LIKE THE SECOND SCREENSHOT IMAGE) */}
              <div className="mb-10 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-5 select-none text-left">
                  Categories
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Smart Home Card */}
                  <div 
                    onClick={() => triggerNotification('Smart Home neural filter matched 0 items.', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-950/30 border border-[#00F3FF]/10 flex items-center justify-center text-[#00F3FF] mb-3 group-hover:scale-110 transition-transform">
                      <Cpu size={18} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                      Smart Home
                    </span>
                  </div>

                  {/* Wearables Card */}
                  <div 
                    onClick={() => triggerNotification('Wearables filters adjusted.', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-950/30 border border-[#00F3FF]/10 flex items-center justify-center text-[#00F3FF] mb-3 group-hover:scale-110 transition-transform">
                      <Smartphone size={18} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                      Wearables
                    </span>
                  </div>

                  {/* Audio Tech Card */}
                  <div 
                    onClick={() => triggerNotification('Audio neural matrix activated.', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-950/30 border border-[#00F3FF]/10 flex items-center justify-center text-[#00F3FF] mb-3 group-hover:scale-110 transition-transform">
                      <Headphones size={18} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                      Audio Tech
                    </span>
                  </div>

                  {/* Ecosystem Card */}
                  <div 
                    onClick={() => triggerNotification('Integrated ecosystem sync finalized.', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-950/30 border border-[#00F3FF]/10 flex items-center justify-center text-[#00F3FF] mb-3 group-hover:scale-110 transition-transform">
                      <LayoutGrid size={18} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                      Ecosystem
                    </span>
                  </div>

                </div>
              </div>

              {/* SECTIONS FEATURED GEARS (VERTICAL LIST EXACTLY LIKE DESIGN) */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-5 select-none text-left">
                  Featured Gear
                </h2>

                <div className="space-y-6">
                  {PRODUCTS.filter(p => p.id !== 'vision-pro').map(product => (
                    <div 
                      key={product.id}
                      className="bg-[#0c0c0e]/95 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {/* Image block is square exact layout */}
                      <div className="relative aspect-video w-full bg-black/60 border-b border-zinc-950 flex items-center justify-center p-3">
                        
                        {/* Premium label shown if desk array */}
                        {product.id === 'lumina-desk' && (
                          <div className="absolute top-3 right-3 bg-[#082f49]/80 border border-cyan-500/30 text-[#00F3FF] text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold z-10 select-none">
                            PREMIUM
                          </div>
                        )}

                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="h-full w-auto object-contain"
                        />
                      </div>

                      {/* Content block with exact details */}
                      <div className="p-5 text-left">
                        <h3 className="text-lg font-bold text-white mb-1.5">{product.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{product.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-white select-none">
                            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                            className="bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-semibold text-[10px] tracking-widest font-mono py-2.5 px-5 rounded-lg uppercase shadow-[0_0_12px_rgba(0,243,255,0.15)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] cursor-pointer transform active:scale-95 transition-all text-center"
                          >
                            Add To Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3B: CART CONTROL RENDER             */}
          {/* ======================================= */}
          {dashboardTab === 'cart' && (
            <div className="animate-[fadeIn_0.4s_ease-out] max-w-lg mx-auto w-full px-5 pt-6 text-left pb-12">
              {cart.length === 0 ? (
                <div className="border border-dashed border-zinc-850 rounded-2xl p-12 text-center my-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-1">Queue is empty</h3>
                  <p className="text-xs text-zinc-500 mb-4 font-mono">// 0 nodes matched</p>
                  <button
                    onClick={() => setDashboardTab('discover')}
                    className="inline-flex text-xs font-mono tracking-widest text-[#00F3FF] hover:text-cyan-300 transition-colors uppercase border border-cyan-500/20 px-4 py-2 rounded-full cursor-pointer"
                  >
                    Scan Infrastructure
                  </button>
                </div>
              ) : showCheckoutPage ? (
                /* ======================================= */
                /* EXACT DETAILED PIXEL-PERFECT CHECKOUT  */
                /* ======================================= */
                <div className="space-y-6">
                  {/* Shipping Address Header with Save Switch */}
                  <div className="flex items-center justify-between mt-2 mb-6">
                    <h2 className="text-[28px] font-bold tracking-tight text-white font-sans mr-4 select-none">
                      Shipping Address
                    </h2>
                    <div className="flex items-center gap-2 flex-shrink-0 select-none">
                      <span className="text-[10px] font-mono font-bold text-zinc-550 text-zinc-500 uppercase tracking-widest">
                        USE SAVED
                      </span>
                      <button
                        onClick={() => setUseSavedAddress(!useSavedAddress)}
                        id="use-saved-address-toggle"
                        className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          useSavedAddress ? 'bg-cyan-400' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            useSavedAddress ? 'translate-x-[18px]' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Form Inputs with Beautiful Off-White Rounded Design */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9.5px] font-mono tracking-widest text-[#a1a1aa] font-bold uppercase mb-2 block select-none">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        id="input-first-name"
                        value={firstName}
                        onChange={(e) => {
                          if (useSavedAddress) setUseSavedAddress(false);
                          setFirstName(e.target.value);
                        }}
                        className="w-full bg-white text-zinc-900 font-sans font-medium text-sm rounded-xl py-3 px-4.5 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F3FF]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono tracking-widest text-[#a1a1aa] font-bold uppercase mb-2 block select-none">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        id="input-last-name"
                        value={lastName}
                        onChange={(e) => {
                          if (useSavedAddress) setUseSavedAddress(false);
                          setLastName(e.target.value);
                        }}
                        className="w-full bg-white text-zinc-900 font-sans font-medium text-sm rounded-xl py-3 px-4.5 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F3FF]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono tracking-widest text-[#a1a1aa] font-bold uppercase mb-2 block select-none">
                        STREET ADDRESS
                      </label>
                      <input
                        type="text"
                        id="input-street-address"
                        value={streetAddress}
                        onChange={(e) => {
                          if (useSavedAddress) setUseSavedAddress(false);
                          setStreetAddress(e.target.value);
                        }}
                        className="w-full bg-white text-zinc-900 font-sans font-medium text-sm rounded-xl py-3 px-4.5 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F3FF]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono tracking-widest text-[#a1a1aa] font-bold uppercase mb-2 block select-none">
                        CITY
                      </label>
                      <input
                        type="text"
                        id="input-city"
                        value={city}
                        onChange={(e) => {
                          if (useSavedAddress) setUseSavedAddress(false);
                          setCity(e.target.value);
                        }}
                        className="w-full bg-white text-zinc-900 font-sans font-medium text-sm rounded-xl py-3 px-4.5 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F3FF]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono tracking-widest text-[#a1a1aa] font-bold uppercase mb-2 block select-none">
                        POSTAL CODE
                      </label>
                      <input
                        type="text"
                        id="input-postal-code"
                        value={postalCode}
                        onChange={(e) => {
                          if (useSavedAddress) setUseSavedAddress(false);
                          setPostalCode(e.target.value);
                        }}
                        className="w-full bg-white text-zinc-900 font-sans font-medium text-sm rounded-xl py-3 px-4.5 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F3FF]/40"
                      />
                    </div>
                  </div>

                  {/* Payment Method Header */}
                  <div className="pt-4 pb-1">
                    <h2 className="text-[28px] font-bold tracking-tight text-white font-sans select-none">
                      Payment Method
                    </h2>
                  </div>

                  {/* Payment Options Stack */}
                  <div className="space-y-4">
                    {/* OPTION 1: Credit or Debit Card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`rounded-2xl p-4.5 transition-all cursor-pointer ${
                        paymentMethod === 'card' 
                          ? 'border border-[#00F3FF]/80 bg-[#070709] shadow-[0_0_15px_rgba(0,243,255,0.08)]' 
                          : 'border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                      }`}
                    >
                      {/* Top title line */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-[#00F3FF]/20 flex items-center justify-center text-[#00F3FF]">
                            <CreditCard size={18} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white leading-snug">Credit or Debit Card</h4>
                            <p className="text-[9px] font-mono font-bold tracking-widest text-[#64748b] uppercase mt-0.5">SECURE VIA STRIPE</p>
                          </div>
                        </div>
                        {/* Radio element */}
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center p-0.5 transition-all"
                          style={{ borderColor: paymentMethod === 'card' ? '#00F3FF' : '#27272a' }}>
                          {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[#00F3FF]" />}
                        </div>
                      </div>

                      {/* Expandable Credit Card form inputs */}
                      {paymentMethod === 'card' && (
                        <div className="mt-4 pt-3 border-t border-zinc-900/60 space-y-3 animate-[fadeIn_0.25s_ease-out]">
                          <div className="bg-[#050506]/90 border border-zinc-900/80 rounded-xl p-3 flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="bg-transparent border-none text-white focus:outline-none font-mono text-sm tracking-widest w-full"
                            />
                            <CreditCard size={15} className="text-zinc-500 select-none flex-shrink-0 ml-1" />
                          </div>

                          <div className="flex gap-3">
                            <div className="w-1/2 bg-[#050506]/90 border border-zinc-900/80 rounded-xl p-3">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="bg-transparent border-none text-white focus:outline-none font-mono text-sm tracking-widest w-full"
                              />
                            </div>
                            <div className="w-1/2 bg-[#050506]/90 border border-zinc-900/80 rounded-xl p-3">
                              <input
                                type="text"
                                placeholder="CVC"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="bg-transparent border-none text-white focus:outline-none font-mono text-sm tracking-widest w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: Cryptocurrency */}
                    <div 
                      onClick={() => setPaymentMethod('crypto')}
                      className={`rounded-2xl p-4.5 transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'crypto' 
                          ? 'border border-[#00F3FF]/80 bg-[#070709] shadow-[0_0_15px_rgba(0,243,255,0.08)]' 
                          : 'border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 font-extrabold font-serif select-none text-[15px]">
                          ₿
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-white leading-snug">Cryptocurrency</h4>
                          <p className="text-[9px] font-mono font-bold tracking-widest text-[#64748b] uppercase mt-0.5 font-sans">BTC, ETH, SOL</p>
                        </div>
                      </div>
                      {/* Radio element */}
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center p-0.5 transition-all"
                        style={{ borderColor: paymentMethod === 'crypto' ? '#00F3FF' : '#27272a' }}>
                        {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-[#00F3FF]" />}
                      </div>
                    </div>

                    {/* OPTION 3: Apple Pay */}
                    <div 
                      onClick={() => setPaymentMethod('applepay')}
                      className={`rounded-2xl p-4.5 transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'applepay' 
                          ? 'border border-[#00F3FF]/80 bg-[#070709] shadow-[0_0_15px_rgba(0,243,255,0.08)]' 
                          : 'border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 select-none">
                          <LayoutGrid size={16} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-white leading-snug">Apple Pay</h4>
                          <p className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase mt-0.5 font-sans">EXPRESS TOUCH SYNC</p>
                        </div>
                      </div>
                      {/* Radio element */}
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center p-0.5 transition-all"
                        style={{ borderColor: paymentMethod === 'applepay' ? '#00F3FF' : '#27272a' }}>
                        {paymentMethod === 'applepay' && <div className="w-2.5 h-2.5 rounded-full bg-[#00F3FF]" />}
                      </div>
                    </div>
                  </div>

                  {/* Your Selection Container */}
                  <div className="bg-[#0b0b0d] border border-zinc-900 rounded-3xl p-5.5 mt-8 space-y-5.5 shadow-2xl text-left">
                    <h3 className="text-2xl font-bold text-white tracking-snug mb-4 select-none">
                      Your Selection
                    </h3>

                    {/* Cart Items List */}
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center justify-between">
                          <div className="flex gap-3.5 items-center flex-1 min-w-0">
                            <div className="w-19 h-19 rounded-xl bg-black/40 overflow-hidden border border-zinc-950 flex-shrink-0 relative">
                              <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left min-w-0">
                              <h4 className="text-xs font-bold text-white leading-tight truncate">{item.product.title}</h4>
                              <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mt-0.5 truncate">
                                {item.product.category}
                              </span>
                              <span className="inline-block mt-2 px-2 py-0.5 bg-[#141417]/80 border border-zinc-850 font-mono text-[9px] tracking-widest font-bold text-zinc-400 rounded">
                                QNT: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 pl-1">
                            <span className="font-mono text-xs font-bold text-zinc-300">
                              ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-900/80 my-4 pt-4 space-y-3">
                      {/* Subtotal line */}
                      <div className="flex justify-between text-xs font-mono tracking-wider font-bold text-zinc-500 uppercase select-none">
                        <span>SUBTOTAL</span>
                        <span className="text-zinc-200">${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>

                      {/* Shipping line */}
                      <div className="flex justify-between text-xs font-mono tracking-wider font-bold text-zinc-500 uppercase select-none">
                        <span>SHIPPING (EXPRESS)</span>
                        <span className="text-[#00F3FF] font-black tracking-widest">FREE</span>
                      </div>

                      {/* Tax line */}
                      <div className="flex justify-between text-xs font-mono tracking-wider font-bold text-zinc-500 uppercase select-none">
                        <span>ESTIMATED TAX</span>
                        <span className="text-zinc-200">${(calculateSubtotal() * 0.08).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900/80 my-4 pt-4">
                      {/* Total line */}
                      <p className="text-[10px] font-mono font-bold tracking-widest text-[#64748b] uppercase select-none">
                        TOTAL AMOUNT
                      </p>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[#ffffff] text-3xl font-extrabold tracking-tight font-sans select-none">
                          ${(calculateSubtotal() * 1.08).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-mono tracking-widest font-bold">
                          TAX INCL.
                        </span>
                      </div>
                    </div>

                    {/* COMPLETE PURCHASE CTA BUTTON */}
                    <button
                      onClick={handleCheckoutProtocol}
                      id="complete-purchase-button"
                      className="w-full bg-[#00F3FF] hover:bg-cyan-400 text-black font-extrabold tracking-widest text-[11px] py-4 rounded-xl mt-4 flex items-center justify-center gap-2 uppercase font-mono shadow-[0_4px_20px_rgba(0,243,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,243,255,0.45)] cursor-pointer transition-all transform active:scale-[0.98]"
                    >
                      COMPLETE PURCHASE <ArrowRight size={14} />
                    </button>

                    {/* Security note under button */}
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-zinc-600 font-bold select-none uppercase mt-3.5 tracking-wider">
                      <Shield size={10} className="text-zinc-650" />
                      <span>ENCRYPTED 256-BIT SSL CONNECTION</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ======================================= */
                /* STANDARD CART VIEW                      */
                /* ======================================= */
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-left">
                    Your Allocated Packages
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-8">
                    Confirm sub-orbital payload logistics before transaction initiation.
                  </p>

                  <div className="space-y-4">
                    {/* Cart Item Cards */}
                    {cart.map(item => (
                      <div 
                        key={item.product.id}
                        className="bg-[#0c0c0e]/95 border border-zinc-900 rounded-xl p-3.5 flex gap-4 items-center justify-between"
                      >
                        <div className="flex gap-3 items-center flex-1">
                          <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden border border-zinc-950 flex-shrink-0">
                            <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left min-w-0">
                            <span className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-wider select-none">
                              {item.product.category}
                            </span>
                            <h3 className="text-xs font-semibold text-white truncate my-0.5">{item.product.title}</h3>
                            <p className="text-xs font-mono font-bold text-cyan-400 select-none">${item.product.price.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 flex-shrink-0">
                          {/* Minus */}
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          
                          <span className="font-mono text-xs font-bold text-zinc-200 select-none w-3 text-center">
                            {item.quantity}
                          </span>

                          {/* Plus */}
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Summary Invoice Box */}
                    <div className="bg-[#0c0c0e]/95 border border-zinc-900 rounded-2xl p-5 mt-8 space-y-3.5">
                      <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-bold select-none mb-2">// Logistics Manifest</h3>
                      
                      <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>LOAD SUB-TOTAL</span>
                        <span className="text-zinc-200">${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>DRONE SECURE ROUTING</span>
                        <span className="text-zinc-200">$35.00</span>
                      </div>

                      <div className="border-t border-zinc-900 pt-3 flex justify-between items-baseline">
                        <span className="font-mono text-xs text-zinc-400 font-bold">TOTAL ALLOCATION INVOICE</span>
                        <span className="text-[#00F3FF] text-xl font-mono font-bold select-none">
                          ${(calculateSubtotal() + 35).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <button
                        onClick={() => setShowCheckoutPage(true)}
                        className="w-full bg-[#00F3FF] hover:bg-[#00D6E2] text-black font-bold tracking-widest text-xs py-4 rounded-xl mt-4 flex items-center justify-center gap-2 uppercase font-mono shadow-[0_0_20px_rgba(0,243,255,0.25)] cursor-pointer transition-all"
                      >
                        Authorize Transaction Link <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3C: HISTORICAL ORDERS               */}
          {/* ======================================= */}
          {dashboardTab === 'orders' && (
            <div className="animate-[fadeIn_0.4s_ease-out] max-w-lg mx-auto w-full px-5 pt-6 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-left">
                Transaction Ledger
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-8">
                Historical grid log of authorized sub-orbital parcel drop transmissions.
              </p>

              {orders.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center">
                  <p className="text-sm font-mono text-zinc-500">// 0 entries saved</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, oi) => (
                    <div 
                      key={order.id}
                      className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-5 text-left space-y-4"
                    >
                      {/* Order top line */}
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                        <div>
                          <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">Transaction ID</p>
                          <p className="text-sm font-mono text-zinc-300 font-bold mt-0.5">{order.id}</p>
                        </div>
                        <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                          {order.status}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-3 pt-1">
                        {order.items.map((item, ii) => (
                          <div key={ii} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 text-zinc-350">
                              <span className="font-mono text-cyan-400 font-bold">x{item.quantity}</span>
                              <span className="font-medium truncate max-w-[200px]">{item.product.title}</span>
                            </div>
                            <span className="font-mono font-bold text-zinc-400">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Order summary billing */}
                      <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">SECURE TRANSACTION VALUE</span>
                        <span className="text-white font-bold">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3D: BIO-PROFILE & SYSTEM METRICS    */}
          {/* ======================================= */}
          {dashboardTab === 'profile' && (
            <div className="animate-[fadeIn_0.4s_ease-out] max-w-lg mx-auto w-full px-5 pt-4 pb-28 text-left space-y-6">
              
              {/* Profile Header (Centered) */}
              <div className="flex flex-col items-center text-center pt-2 pb-1">
                {/* Elegant Glowing Avatar Container */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/50 to-[#00F3FF]/50 blur-lg pointer-events-none animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full p-[3.5px] bg-gradient-to-b from-[#00F3FF] via-purple-600/70 to-zinc-950 shadow-[0_4px_25px_rgba(0,243,255,0.15)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0c0c0e]">
                      <img 
                        src="/src/assets/images/elena_vancore_avatar_1781349182408.jpg" 
                        alt={userCallsign} 
                        className="w-full h-full object-cover object-center filter saturate-115"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  {/* Cyan PRO Badge */}
                  <span className="absolute bottom-1 right-1 bg-[#00F3FF] text-black text-[9.5px] font-black font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_2px_10px_rgba(0,243,255,0.5)]">
                    PRO
                  </span>
                </div>

                {/* Name & Title */}
                <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2 pb-0.5 capitalize">{userCallsign}</h2>
                
                {/* Subtitle / Zenith Member Row */}
                <div className="flex items-center gap-3">
                  <span className="border border-zinc-800 bg-[#0c0c0e]/80 text-zinc-300 text-[9.5px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest select-none">
                    ZENITH MEMBER
                  </span>
                  <span className="text-zinc-500 text-[11px] font-mono tracking-wide">
                    Member since 2023
                  </span>
                </div>
              </div>

              {/* 2x2 Stats Dashboard Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1: Total Orders */}
                <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-2xl p-5 text-left flex flex-col justify-between h-[104px] relative overflow-hidden group hover:border-zinc-800 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full filter blur-lg pointer-events-none" />
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold select-none">TOTAL ORDERS</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1">24</span>
                </div>

                {/* Card 2: Devices */}
                <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-2xl p-5 text-left flex flex-col justify-between h-[104px] relative overflow-hidden group hover:border-zinc-800 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full filter blur-lg pointer-events-none" />
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold select-none">DEVICES</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1">08</span>
                </div>

                {/* Card 3: Aether Points */}
                <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-2xl p-5 text-left flex flex-col justify-between h-[104px] relative overflow-hidden group hover:border-zinc-800 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full filter blur-lg pointer-events-none" />
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold select-none">AETHER POINTS</span>
                  <span className="text-3xl font-extrabold text-[#00F3FF] tracking-tight mt-1">1,240</span>
                </div>

                {/* Card 4: Next Reward */}
                <div className="bg-[#0b0b0d]/90 border border-zinc-900 rounded-2xl p-5 text-left flex flex-col justify-between h-[104px] relative overflow-hidden group hover:border-zinc-800 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full filter blur-lg pointer-events-none" />
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold select-none">NEXT REWARD</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1">12%</span>
                </div>
              </div>

              {/* SECTION 1: ORDER HISTORY */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2.5 pl-0.5">
                  <div className="w-[3px] h-4 bg-[#00F3FF] rounded-full shadow-[0_0_8px_rgba(0,243,255,0.6)]" />
                  <FileText size={16} className="text-[#00F3FF]" />
                  <h3 className="text-[10.5px] font-mono tracking-widest text-zinc-300 font-bold uppercase select-none">ORDER HISTORY</h3>
                </div>

                <div className="space-y-3">
                  {/* Order 1 */}
                  <div 
                    onClick={() => triggerNotification('Displaying status of Order ORD-98234...', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-400 group-hover:text-[#00F3FF] transition-all">
                        <Box size={18} className="stroke-[1.75]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Aetheris X-1 Neural Link</h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold inline-block mt-0.5 pb-0.5">ORD-98234 • DELIVERED</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Order 2 */}
                  <div 
                    onClick={() => triggerNotification('Displaying status of Order ORD-98112...', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-400 group-hover:text-[#00F3FF] transition-all">
                        <Truck size={17} className="stroke-[1.75]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Pulse Core Charger</h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold inline-block mt-0.5 pb-0.5">ORD-98112 • IN TRANSIT</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="text-center pt-1.5 pb-2">
                  <button 
                    onClick={() => setDashboardTab('orders')} 
                    className="text-[10px] font-black font-mono tracking-widest text-[#00F3FF] hover:text-cyan-400 uppercase transition-all bg-transparent border-0 cursor-pointer focus:outline-none"
                  >
                    VIEW ALL ORDERS
                  </button>
                </div>
              </div>

              {/* SECTION 2: SAVED DEVICES */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2.5 pl-0.5">
                  <div className="w-[3px] h-4 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  <Laptop size={16} className="text-purple-400" />
                  <h3 className="text-[10.5px] font-mono tracking-widest text-zinc-300 font-bold uppercase select-none">SAVED DEVICES</h3>
                </div>

                <div className="space-y-3">
                  {/* Device 1 */}
                  <div 
                    onClick={() => triggerNotification('Aetheris Soundscape Pro is healthy and synced.', 'success')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-all">
                        <Headphones size={18} className="stroke-[1.75]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Aetheris Soundscape Pro</h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold inline-block mt-0.5 pb-0.5">V3.2 • CONNECTED</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Device 2 */}
                  <div 
                    onClick={() => triggerNotification('Chronos Smart Interface dashboard is offline.', 'info')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-all">
                        <Watch size={18} className="stroke-[1.75]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Chronos Smart Interface</h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold inline-block mt-0.5 pb-0.5">V1.0 • STANDBY</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="text-center pt-1.5 pb-2">
                  <button 
                    onClick={() => triggerNotification('Opening inventory terminal system...', 'info')} 
                    className="text-[10px] font-black font-mono tracking-widest text-[#a855f7] hover:text-purple-300 uppercase transition-all bg-transparent border-0 cursor-pointer focus:outline-none"
                  >
                    MANAGE INVENTORY
                  </button>
                </div>
              </div>

              {/* SECTION 3: PAYMENT METHODS */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2.5 pl-0.5">
                  <div className="w-[3px] h-4 bg-zinc-650 rounded-full" />
                  <CreditCard size={16} className="text-zinc-400" />
                  <h3 className="text-[10.5px] font-mono tracking-widest text-zinc-300 font-bold uppercase select-none">PAYMENT METHODS</h3>
                </div>

                <div className="space-y-3">
                  {/* Card 1 */}
                  <div 
                    onClick={() => triggerNotification('Encrypted Visa ledger verified.', 'success')}
                    className="bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-all">
                        <CreditCard size={18} className="stroke-[1.75]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Visa ending in •••• 4492</h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold inline-block mt-0.5 pb-0.5">EXPIRES 09/27 • DEFAULT</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Add pay method */}
                  <div 
                    onClick={() => triggerNotification('Onboarding fresh checkout nodes...', 'info')}
                    className="bg-[#060608]/40 border border-dashed border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4.5 flex items-center justify-center gap-2.5 transition-all cursor-pointer group text-zinc-400 hover:text-white"
                  >
                    <Plus size={15} className="text-[#00F3FF]" />
                    <span className="text-[10px] font-black font-mono tracking-widest uppercase">ADD NEW METHOD</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: ACCOUNT SETTINGS */}
              <div className="space-y-3.5 pt-1 pb-4">
                <div className="flex items-center gap-2.5 pl-0.5">
                  <div className="w-[3px] h-4 bg-zinc-650 rounded-full" />
                  <Sliders size={16} className="text-zinc-400" />
                  <h3 className="text-[10.5px] font-mono tracking-widest text-zinc-300 font-bold uppercase select-none">ACCOUNT SETTINGS</h3>
                </div>

                <div className="space-y-3">
                  {/* Settings 1 */}
                  <button 
                    onClick={() => triggerNotification('Personal Profile settings is currently locked.', 'info')}
                    className="w-full bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-900/50 flex items-center justify-center text-zinc-400 group-hover:text-[#00F3FF] transition-all">
                        <User size={15} />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors uppercase font-mono tracking-wider">Personal Information</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Settings 2 */}
                  <button 
                    onClick={() => triggerNotification('Synaptic encryption and privacy shields are optimized.', 'success')}
                    className="w-full bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-900/50 flex items-center justify-center text-zinc-400 group-hover:text-[#00F3FF] transition-all">
                        <Shield size={15} />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors uppercase font-mono tracking-wider">Privacy & Security</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Settings 3 */}
                  <button 
                    onClick={() => triggerNotification('Ecosystem telemetry alerts configured.', 'info')}
                    className="w-full bg-[#0c0c0e]/95 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-900/50 flex items-center justify-center text-zinc-400 group-hover:text-[#00F3FF] transition-all">
                        <Bell size={15} />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors uppercase font-mono tracking-wider">Notification Preferences</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* SECTION 5: LOGOUT BUTTON */}
              <div className="pt-4 pb-8 flex justify-center">
                <button 
                  onClick={() => {
                    const performSignOut = async () => {
                      triggerNotification('Releasing secure connection thread...', 'info');
                      try {
                        await signOut(auth);
                        setView('welcome');
                        setEmail('');
                        setPassword('');
                        triggerNotification('Node link disconnected safely.', 'success');
                      } catch (err) {
                        console.error("Sign out error:", err);
                        triggerNotification('Error releasing nodes.', 'error');
                      }
                    };
                    performSignOut();
                  }}
                  className="w-full max-w-[280px] text-[10.5px] font-black font-mono tracking-widest text-rose-450 text-rose-400 hover:text-rose-300 border border-rose-500/25 rounded-2xl hover:bg-rose-500/5 transition-all py-3.5 px-6 cursor-pointer text-center uppercase flex items-center justify-center gap-2"
                >
                  <LogOut size={13} />
                  LOG OUT OF AETHERIS
                </button>
              </div>

            </div>
          )}
          </>
          )}

          {/* ======================================= */}
          {/* THE BOTTOM NAVIGATION BAR OR RESERVE ACTION FOOTER */}
          {/* ======================================= */}
          {selectedProduct ? (
            <div id="details-action-bar" className="fixed bottom-0 left-0 right-0 h-20 bg-[#070708]/95 backdrop-blur-md border-t border-zinc-90 w-full z-40 border-t border-zinc-900 flex items-center justify-between px-5 gap-3.5 max-w-lg mx-auto">
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct, 1);
                  triggerNotification('Pre-order reservation logged.', 'success');
                }}
                className="border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/40 text-zinc-300 font-mono font-bold text-[11px] tracking-widest text-center py-4 rounded-xl uppercase flex-1 cursor-pointer transition-all"
              >
                Reserve Now
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct, 1);
                  triggerNotification(`${selectedProduct.title} added to allocation list.`, 'success');
                }}
                className="bg-[#00F3FF] hover:bg-cyan-400 text-black font-mono font-bold text-[11px] tracking-widest text-center py-4 rounded-xl uppercase shadow-[0_4px_20px_rgba(0,243,255,0.25)] flex-[1.3] cursor-pointer transition-all"
              >
                Add To Cart
              </button>
            </div>
          ) : (
            <nav id="bottom-navbar" className="fixed bottom-0 left-0 right-0 h-16 sm:h-18 bg-[#070708]/95 backdrop-blur-md border-t border-zinc-90 w-full z-40 border-t border-zinc-900 flex justify-around items-center px-4 max-w-lg mx-auto">
              {navTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = dashboardTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDashboardTab(tab.id)}
                    className={`flex flex-col items-center justify-center w-14 h-full relative group cursor-pointer transition-colors ${
                      isActive ? 'text-[#00F3FF]' : 'text-zinc-550 text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {/* Top glowing focus dot for active state */}
                    {isActive && (
                      <div className="absolute top-0 w-5 h-[2px] bg-[#00F3FF] shadow-[0_0_8px_#00F3FF] rounded-full" />
                    )}

                    {/* Icon section with count check for Cart badge */}
                    <div className="relative">
                      <TabIcon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-all`} />
                      {('badge' in tab) && getCartTotalCount() > 0 && (
                        <div className="absolute top-[-4px] right-[-6px] bg-[#6d28d9] text-[8.5px] font-mono font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center text-white">
                          {getCartTotalCount()}
                        </div>
                      )}
                    </div>

                    {/* Monospace exact style text from image inside bottom navbar */}
                    <span className="text-[9px] font-mono tracking-wider font-bold mt-1.5 uppercase select-none">
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

        </div>
      )}

      {/* ======================================= */}
      {/* SECTIONS 5: CHECKOUT LOG PROTOCOL MODAL */}
      {/* ======================================= */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-[#0a0a0c] border border-zinc-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl relative">
            
            <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-[#00F3FF]/20 flex items-center justify-center text-[#00F3FF] mx-auto animate-pulse">
              <Shield size={22} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white tracking-widest uppercase font-mono">
                {checkoutStep === 4 ? 'SYNC COMPLETED' : 'SECURE SECURING PROTOCOL'}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">// Layer-7 encryption active</p>
            </div>

            {/* Stepper visual tracking */}
            {checkoutStep < 4 ? (
              <div className="space-y-4 py-2">
                {/* Mini progress line */}
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${(checkoutStep / 3) * 100}%` }}
                  />
                </div>
                
                {/* Progression details text */}
                <div className="font-mono text-[10.5px] text-zinc-400 space-y-1 my-1">
                  <p className={checkoutStep >= 1 ? 'text-[#00F3FF]' : 'text-zinc-650'}>
                    ✓ Authorization operational node handshake...
                  </p>
                  <p className={checkoutStep >= 2 ? 'text-[#00F3FF]' : 'text-zinc-650'}>
                    {checkoutStep >= 2 ? '✓ Biometric account credit ledger matches.' : '• Validating credential currency template...'}
                  </p>
                  <p className={checkoutStep >= 3 ? 'text-[#00F3FF]' : 'text-zinc-650'}>
                    {checkoutStep >= 3 ? '✓ Sub-orbital delivery drones targeted.' : '• Syncing geolocation route grids...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2 animate-[fadeIn_0.5s_ease-out]">
                <div className="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto select-none">
                  <Check size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">Transaction Ledger Finalized</p>
                  <p className="text-[10px] font-mono text-zinc-500">RELAY PARCEL SHIPPED VIA SUB-ORBITAL NET</p>
                </div>
                <button
                  onClick={() => {
                    setIsCheckingOut(false);
                    setShowCheckoutPage(false);
                    setDashboardTab('orders');
                  }}
                  className="w-full bg-[#00F3FF] text-black font-semibold tracking-wider font-mono text-xs py-3 rounded-lg uppercase cursor-pointer"
                >
                  Access Receipts
                </button>
              </div>
            )}

            {checkoutStep < 4 && (
              <p className="text-[9px] font-mono text-zinc-600">// Secure connection token cannot be bypassed.</p>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
