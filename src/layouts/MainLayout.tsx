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
    <div className="min-h-screen flex flex-col bg-[#0f0f11]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
