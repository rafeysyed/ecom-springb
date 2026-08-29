#!/usr/bin/env bash
# scaffold-frontend.sh
# Creates the feature-based folder structure for the e-commerce React frontend.
# Usage: ./scaffold-frontend.sh [target-dir]
# Default target-dir is "src" inside the current directory.

set -euo pipefail

ROOT="${1:-src}"

echo "Scaffolding frontend structure under: $ROOT"

DIRS=(
  "api/endpoints"
  "api/types"

  "features/auth/components"
  "features/auth/hooks"
  "features/products/components"
  "features/products/hooks"
  "features/cart/components"
  "features/cart/hooks"
  "features/orders/components"
  "features/orders/hooks"
  "features/profile/components"
  "features/profile/hooks"

  "components/ui"
  "components/layout"
  "components/feedback"

  "pages"
  "routes"
  "store"
  "hooks"
  "utils"
  "styles"
)

FILES=(
  "api/client.ts"
  "api/endpoints/auth.ts"
  "api/endpoints/users.ts"
  "api/endpoints/products.ts"
  "api/endpoints/orders.ts"
  "api/types/user.types.ts"
  "api/types/product.types.ts"
  "api/types/order.types.ts"

  "features/auth/authStore.ts"
  "features/auth/hooks/useLogin.ts"
  "features/auth/hooks/useRegister.ts"
  "features/auth/hooks/useAuthSession.ts"
  "features/auth/components/LoginForm.tsx"
  "features/auth/components/RegisterForm.tsx"

  "features/products/hooks/useProducts.ts"
  "features/products/hooks/useProduct.ts"
  "features/products/components/ProductCard.tsx"
  "features/products/components/ProductGrid.tsx"
  "features/products/components/ProductFilters.tsx"
  "features/products/components/ProductGallery.tsx"

  "features/cart/cartStore.ts"
  "features/cart/hooks/useCart.ts"
  "features/cart/components/CartDrawer.tsx"
  "features/cart/components/CartItem.tsx"
  "features/cart/components/CartSummary.tsx"

  "features/orders/hooks/usePlaceOrder.ts"
  "features/orders/hooks/useOrder.ts"
  "features/orders/hooks/useOrderHistory.ts"
  "features/orders/components/OrderSummaryCard.tsx"
  "features/orders/components/OrderStatusBadge.tsx"
  "features/orders/components/OrderTimeline.tsx"
  "features/orders/components/OrderHistoryList.tsx"

  "features/profile/hooks/useProfile.ts"
  "features/profile/components/ProfileCard.tsx"
  "features/profile/components/ProfileForm.tsx"

  "components/ui/Button.tsx"
  "components/ui/Input.tsx"
  "components/ui/Card.tsx"
  "components/ui/Badge.tsx"
  "components/ui/Modal.tsx"
  "components/ui/Skeleton.tsx"
  "components/ui/Toast.tsx"
  "components/ui/Spinner.tsx"
  "components/ui/Avatar.tsx"
  "components/ui/Pagination.tsx"
  "components/ui/RatingStars.tsx"
  "components/ui/PriceTag.tsx"
  "components/ui/Breadcrumbs.tsx"

  "components/layout/Header.tsx"
  "components/layout/Footer.tsx"
  "components/layout/Sidebar.tsx"
  "components/layout/PageContainer.tsx"

  "components/feedback/EmptyState.tsx"
  "components/feedback/ErrorState.tsx"
  "components/feedback/LoadingState.tsx"

  "pages/HomePage.tsx"
  "pages/ProductListPage.tsx"
  "pages/ProductDetailPage.tsx"
  "pages/CartPage.tsx"
  "pages/CheckoutPage.tsx"
  "pages/OrderConfirmationPage.tsx"
  "pages/OrderTrackingPage.tsx"
  "pages/OrderHistoryPage.tsx"
  "pages/ProfilePage.tsx"
  "pages/LoginPage.tsx"
  "pages/RegisterPage.tsx"
  "pages/NotFoundPage.tsx"

  "routes/AppRouter.tsx"
  "routes/ProtectedRoute.tsx"

  "hooks/useDebounce.ts"
  "hooks/useLocalStorage.ts"
  "hooks/useMediaQuery.ts"

  "utils/formatCurrency.ts"
  "utils/formatDate.ts"
  "utils/jwt.ts"

  "styles/tokens.css"
  "styles/globals.css"

  "App.tsx"
)

# Create directories
for dir in "${DIRS[@]}"; do
  mkdir -p "$ROOT/$dir"
done

# Create empty placeholder files (only if they don't already exist)
for file in "${FILES[@]}"; do
  filepath="$ROOT/$file"
  if [ ! -f "$filepath" ]; then
    touch "$filepath"
  fi
done

echo "Done. Structure created under '$ROOT/'."
echo
echo "Tree preview:"
if command -v tree >/dev/null 2>&1; then
  tree "$ROOT"
else
  find "$ROOT" | sed -e "s|[^/]*/|  |g"
fi
