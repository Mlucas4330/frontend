import { useState, createContext, useContext, type ReactNode } from "react";

// Types
type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

// 1. Context for state control
const TabsContext = createContext<TabsContextType | undefined>(undefined);

// 2. Custom hook for easier access to the context
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used within a <Tabs />");
  return context;
};

// 3. The Root Component (Provider)
export const Tabs = ({ defaultValue, children }: { defaultValue: string; children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

// 4. The Trigger (Consumer)
export const TabsTrigger = ({ value, children }: { value: string; children: ReactNode }) => {
  const { setActiveTab } = useTabs();

  return (
    <button onClick={() => setActiveTab(value)}>
      {children}
    </button>
  );
};

// 5. The Content (Consumer)
export const TabsContent = ({ value, children }: { value: string; children: ReactNode }) => {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null; // Hide if not active

  return <div>{children}</div>;
};

// Usage in App
export default function App() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <p>Make changes to your account here.</p>
      </TabsContent>
      <TabsContent value="password">
        <p>Change your password here.</p>
      </TabsContent>
    </Tabs>
  );
}