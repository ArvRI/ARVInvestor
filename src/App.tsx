import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar, ActiveTab } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { InvestorPortal } from "./components/portal/InvestorPortal";
import { CRMInvestors } from "./components/crm/CRMInvestors";
import { SPEManagement } from "./components/spes/SPEManagement";
import { CommunicationHub } from "./components/communication/CommunicationHub";
import { ExecutiveDashboard } from "./components/dashboard/ExecutiveDashboard";
import { InvestorIntelligence } from "./components/intelligence/InvestorIntelligence";
import { MarketingCRMHub } from "./components/marketing/MarketingCRMHub";
import { SiengeIntegrationHub } from "./components/sienge/SiengeIntegrationHub";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { NewInvestorModal } from "./components/common/NewInvestorModal";
import { NewSPEModal } from "./components/common/NewSPEModal";

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("portal");
  const [isNewInvestorOpen, setIsNewInvestorOpen] = useState(false);
  const [isNewSPEOpen, setIsNewSPEOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onOpenNewInvestor={() => setIsNewInvestorOpen(true)}
          onOpenNewSPE={() => setIsNewSPEOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === "portal" && <InvestorPortal />}
            {activeTab === "crm" && (
              <CRMInvestors onOpenNewInvestor={() => setIsNewInvestorOpen(true)} />
            )}
            {activeTab === "spes" && (
              <SPEManagement onOpenNewSPE={() => setIsNewSPEOpen(true)} />
            )}
            {activeTab === "communication" && <CommunicationHub />}
            {activeTab === "dashboard" && <ExecutiveDashboard />}
            {activeTab === "intelligence" && <InvestorIntelligence />}
            {activeTab === "marketing" && <MarketingCRMHub />}
            {activeTab === "sienge" && <SiengeIntegrationHub />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <NewInvestorModal
        isOpen={isNewInvestorOpen}
        onClose={() => setIsNewInvestorOpen(false)}
      />
      <NewSPEModal
        isOpen={isNewSPEOpen}
        onClose={() => setIsNewSPEOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
