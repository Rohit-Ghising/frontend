import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { fetchCart } from '../store/cartSlice';
import { fetchOrders } from '../store/ordersSlice';

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
      dispatch(fetchOrders());
    }
  }, [dispatch, token]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[22rem] h-[24rem] w-[24rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-brand-700/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </div>
  );
}
