import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FreshnessPage } from './pages/FreshnessPage';
import { InventoryPage } from './pages/InventoryPage';
import { ExpiryPage } from './pages/ExpiryPage';
import { ForecastPage } from './pages/ForecastPage';
import { ReorderPage } from './pages/ReorderPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssistantPage } from './pages/AssistantPage';
import { RecipesPage } from './pages/RecipesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ScannedProductsPage } from './pages/ScannedProductsPage';

export const AppContent: React.FC = () => {
  const { currentRoute, isAuthenticated } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Unauthenticated / Landing flow routes
  if (currentRoute === 'welcome') {
    return <WelcomePage />;
  }

  if (currentRoute === 'login') {
    return <LoginPage />;
  }

  if (currentRoute === 'onboarding') {
    return <OnboardingPage />;
  }

  // Fallback to welcome if not authenticated
  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  // Authenticated SaaS Dashboard Shell
  return (
    <div className="min-h-screen bg-[#fafbfb] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentRoute === 'dashboard' && <DashboardPage />}
          {(currentRoute === 'scanner' || currentRoute === 'scanned_items') && <ScannedProductsPage />}
          {currentRoute === 'freshness' && <FreshnessPage />}
          {currentRoute === 'inventory' && <InventoryPage />}
          {currentRoute === 'expiry' && <ExpiryPage />}
          {currentRoute === 'forecast' && <ForecastPage />}
          {currentRoute === 'reorders' && <ReorderPage />}
          {currentRoute === 'purchase_orders' && <PurchaseOrdersPage />}
          {currentRoute === 'suppliers' && <SuppliersPage />}
          {currentRoute === 'analytics' && <AnalyticsPage />}
          {currentRoute === 'assistant' && <AssistantPage />}
          {currentRoute === 'recipes' && <RecipesPage />}
          {currentRoute === 'notifications' && <NotificationsPage />}
          {currentRoute === 'settings' && <SettingsPage />}
          {currentRoute === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};
