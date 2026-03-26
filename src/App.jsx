import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIPanel from './components/AIPanel';
import Overview from './components/pages/Overview';
import LeaseUpAnalysis from './components/pages/LeaseUpAnalysis';
import RentGrowth from './components/pages/RentGrowth';
import ClusterExplorer from './components/pages/ClusterExplorer';
import AIAssistant from './components/pages/AIAssistant';
import { useAIPanel } from './hooks/useAIPanel';
import { useContextualAI } from './hooks/useContextualAI';
import { useOpenRouter } from './hooks/useOpenRouter';

const pages = {
  overview: Overview,
  leaseup: LeaseUpAnalysis,
  rentgrowth: RentGrowth,
  clusters: ClusterExplorer,
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const aiPanel = useAIPanel();

  const contextualAI = useContextualAI();
  const fullAI = useOpenRouter();

  const sidebarWidth = sidebarCollapsed ? 68 : 240;

  const handleNavigate = (page) => {
    if (page !== activePage) {
      if (page !== 'ai') aiPanel.close();
      setActivePage(page);
    }
  };

  const handleTogglePanel = () => {
    aiPanel.toggle();
  };

  const isAIPage = activePage === 'ai';
  const PageComponent = pages[activePage] || null;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
      />

      <main
        className={`flex-1 min-h-screen bg-surface ${isAIPage ? 'overflow-hidden' : 'overflow-y-auto'}`}
        style={{
          marginLeft: sidebarWidth,
          marginRight: !isAIPage ? aiPanel.panelWidth : 0,
          transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!isAIPage && <Header activePage={activePage} onTogglePanel={handleTogglePanel} />}
        {isAIPage ? (
          <AIAssistant
            messages={fullAI.messages}
            isLoading={fullAI.isLoading}
            sendMessage={fullAI.sendMessage}
            clearMessages={fullAI.clearMessages}
          />
        ) : (
          PageComponent && <PageComponent />
        )}
      </main>

      {!isAIPage && (
        <AIPanel
          isOpen={aiPanel.isOpen}
          onClose={aiPanel.close}
          activePage={activePage}
          messages={contextualAI.messages}
          isLoading={contextualAI.isLoading}
          sendMessage={contextualAI.sendMessage}
          clearMessages={contextualAI.clearMessages}
        />
      )}
    </div>
  );
}
