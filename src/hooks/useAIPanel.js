import { useState, useCallback } from 'react';

export function useAIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const open = useCallback((tab) => {
    setIsOpen(true);
    if (tab) setActiveTab(tab);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback((tab) => {
    setIsOpen((prev) => {
      if (!prev && tab) setActiveTab(tab);
      return !prev;
    });
  }, []);

  return {
    isOpen,
    activeTab,
    setActiveTab,
    open,
    close,
    toggle,
    panelWidth: isOpen ? 380 : 0,
  };
}
