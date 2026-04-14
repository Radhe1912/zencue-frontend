import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  disablePushNotifications,
  enablePushNotifications,
  isPushSupported,
  syncPushSubscription,
} from "../lib/push";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function getPermissionLabel() {
  if (typeof Notification === "undefined") {
    return "Unavailable";
  }

  if (Notification.permission === "granted") {
    return "Allowed";
  }

  if (Notification.permission === "denied") {
    return "Blocked";
  }

  return "Pending";
}

export default function PushNotificationsCard() {
  const userId = localStorage.getItem("user_id");
  const [configured, setConfigured] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supported = isPushSupported();
  const permissionLabel = supported ? getPermissionLabel() : "Unsupported";

  const loadStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${BACKEND_URL}/push/status/${userId}`);
      setConfigured(response.data.configured);
      setEnabled(response.data.enabled);
      setSubscriptionCount(response.data.subscription_count);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load push notification status.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const initialize = async () => {
      await loadStatus();

      if (!userId || !supported || Notification.permission !== "granted") {
        return;
      }

      try {
        const subscription = await syncPushSubscription(userId);
        if (subscription) {
          await loadStatus();
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Unable to sync notifications.");
      }
    };

    initialize();
  }, [loadStatus, supported, userId]);

  const handleEnable = async () => {
    setWorking(true);
    setError("");
    setSuccess("");

    try {
      await enablePushNotifications(userId);
      await loadStatus();
      setSuccess("Push reminders are ready on this browser.");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Unable to enable notifications.");
    } finally {
      setWorking(false);
    }
  };

  const handleDisable = async () => {
    setWorking(true);
    setError("");
    setSuccess("");

    try {
      await disablePushNotifications(userId);
      await loadStatus();
      setSuccess("Push reminders were disconnected from this browser.");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Unable to disable notifications.");
    } finally {
      setWorking(false);
    }
  };

  const handleRefresh = async () => {
    setWorking(true);
    setError("");
    setSuccess("");

    try {
      const subscription = await syncPushSubscription(userId);
      await loadStatus();
      setSuccess(subscription ? "Push connection refreshed." : "No active browser subscription was found.");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Unable to refresh notifications.");
    } finally {
      setWorking(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  return (
    <section className="card push-card">
      <div className="push-card__top">
        <div>
          <span className="eyebrow">Browser delivery</span>
          <h2>Reminders now arrive through web push, not email.</h2>
        </div>
        <span className={`status-dot ${enabled ? "status-dot--active" : ""}`}>
          {enabled ? "Ready" : "Not ready"}
        </span>
      </div>

      <p className="muted-text">
        Turn notifications on once for this browser and ZenCue can keep sending reminders even
        when the tab is closed.
      </p>

      <div className="push-stats">
        <div className="stat-chip">
          <strong>{permissionLabel}</strong>
          <span>Browser permission</span>
        </div>
        <div className="stat-chip">
          <strong>{loading ? "..." : subscriptionCount}</strong>
          <span>Active device links</span>
        </div>
      </div>

      {!supported ? (
        <p className="status-message status-message--error">
          This browser does not support the Push API.
        </p>
      ) : null}

      {supported && !configured ? (
        <p className="status-message status-message--error">
          The backend push configuration is incomplete. Add the VAPID keys before enabling reminders.
        </p>
      ) : null}

      {error ? <p className="status-message status-message--error">{error}</p> : null}
      {success ? <p className="status-message status-message--success">{success}</p> : null}

      <div className="push-actions">
        <button
          className="button"
          type="button"
          onClick={handleEnable}
          disabled={working || !supported || !configured}
        >
          {working ? "Working..." : enabled ? "Enable again" : "Enable notifications"}
        </button>

        <button
          className="button button--secondary"
          type="button"
          onClick={handleRefresh}
          disabled={working || !supported || !configured}
        >
          Refresh connection
        </button>

        <button
          className="button button--secondary"
          type="button"
          onClick={handleDisable}
          disabled={working || !enabled}
        >
          Disable here
        </button>
      </div>

      <p className="inline-note">
        If permission was blocked, reopen this site&apos;s notification setting in your browser and
        allow it before trying again.
      </p>

      {!notificationsEnabled && (
        <button onClick={requestNotificationPermission}>
          Enable Notifications
        </button>
      )}
      {notificationsEnabled && <p>Notifications are enabled!</p>}
    </section>
  );
}
