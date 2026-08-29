import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ChevronDown, Package, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SearchAutocomplete } from '@/features/products/components/SearchAutocomplete';

export function Header() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);
    const totalItems = useCartStore((s) => s.totalItems());
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        setIsMenuOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-text tracking-tight shrink-0">
                    mrkt
                </Link>

                {/* Centered Search Bar with Instant Autocomplete */}
                <div className="flex-1 max-w-lg mx-auto">
                    <SearchAutocomplete />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Cart button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 rounded-full hover:bg-surface-muted transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingBag size={20} className="text-text" />
                        {totalItems > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-semibold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <div className="relative">
                            {/* Avatar trigger */}
                            <button
                                onClick={() => setIsMenuOpen((o) => !o)}
                                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-surface-muted transition-colors"
                                aria-label="Account menu"
                                aria-expanded={isMenuOpen}
                            >
                                <Avatar name="Account" size="sm" />
                                <ChevronDown
                                    size={14}
                                    className={`text-text-muted transition-transform duration-150 ${isMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isMenuOpen && (
                                <>
                                    {/* Invisible backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        aria-hidden="true"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    {/* Dropdown panel */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-soft-hover z-50 py-1 overflow-hidden">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-muted transition-colors"
                                        >
                                            <UserCircle size={16} className="text-text-muted shrink-0" />
                                            Profile
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-muted transition-colors"
                                        >
                                            <Package size={16} className="text-text-muted shrink-0" />
                                            Orders
                                        </Link>
                                        <div className="border-t border-border my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                                        >
                                            <LogOut size={16} className="shrink-0" />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="secondary" size="sm">
                                <User size={16} />
                                Sign in
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </header>
    );
}