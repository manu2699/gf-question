// Bad: Complex state management, side effects, and type issues
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "./styles.module.css";

enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

// Complex type that's not properly utilized
type UserSettings = {
  notifications: {
    email: boolean;
    push: boolean;
    // Missing type for sms
  };
  theme: Theme;
  // No type safety for preferences
  preferences: Record<string, any>;
};

const SettingsPage = () => {
  const { tab = "profile" } = useParams();
  const navigate = useNavigate();

  // Complex state that should be normalized
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Side effect with missing dependencies
  useEffect(() => {
    // Simulate API call
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        // Mutating state directly - bad practice
        setSettings((prev) => ({
          ...prev,
          ...data,
          // Overriding with defaults - potential bug if data is undefined
          notifications: {
            email: true,
            push: false,
            ...data?.notifications,
          },
        }));
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };

    fetchSettings();

    // Analytics side effect - should be in a separate effect
    trackPageView("settings");

    // Missing cleanup
  }, []);

  // Inefficient handler that recreates function on every render
  const handleInputChange = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof UserSettings],
        [key]: value,
      },
    }));
  };

  // Complex save handler with race condition potential
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // No validation before save
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Inefficient state update
      setSettings(await response.json());

      // Side effect in event handler
      showToast("Settings saved successfully");
    } catch (err) {
      setSaveError(err.message);

      // Side effect in catch block
      logError("SettingsSaveError", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === Theme.System) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  };

  // Complex render logic that should be a separate component
  const renderTabContent = () => {
    switch (tab) {
      case "notifications":
        return (
          <div>
            <h3>Notification Settings</h3>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications?.email ?? false}
                  onChange={(e) =>
                    handleInputChange(
                      "notifications",
                      "email",
                      e.target.checked
                    )
                  }
                />
                Email Notifications
              </label>
              {/* Missing error handling for undefined settings */}
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications?.push ?? false}
                  onChange={(e) =>
                    handleInputChange("notifications", "push", e.target.checked)
                  }
                />
                Push Notifications
              </label>
            </div>
          </div>
        );
      case "appearance":
        return (
          <div>
            <h3>Appearance</h3>
            <select
              value={settings.theme}
              onChange={(e) => {
                handleThemeChange(e.target.value as Theme);
                handleInputChange("appearance", "theme", e.target.value);
              }}
            >
              <option value={Theme.Light}>Light</option>
              <option value={Theme.Dark}>Dark</option>
              <option value={Theme.System}>System Default</option>
            </select>
          </div>
        );
      default:
        return <div>Profile settings coming soon</div>;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1>Settings</h1>

      <div className={styles.tabs}>
        {["profile", "notifications", "appearance"].map((tabName) => (
          <button
            key={tabName}
            className={`${styles.tab} ${
              tabName === tab ? styles.activeTab : ""
            }`}
            onClick={() => navigate(`/settings/${tabName}`)}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {renderTabContent()}

        <button
          className={`secondaryButton ${
            isSaving ? styles.notAllowedButton : ""
          }`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {saveError && (
          <div style={{ color: "red", marginTop: "10px" }}>
            Error: {saveError}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock functions that should be in a separate service
function trackPageView(page: string) {
  console.log(`Page viewed: ${page}`);
  // Analytics.track('page_view', { page });
}

function showToast(message: string) {
  console.log(`Toast: ${message}`);
  // Toast.show(message);
}

function logError(context: string, error: any) {
  console.error(`[${context}]`, error);
  // ErrorTracking.captureException(error, { context });
}

export default SettingsPage;
