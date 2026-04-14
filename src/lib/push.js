import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function base64UrlToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function getRegistration() {
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function enablePushNotifications(userId) {
  if (!userId) {
    throw new Error("Sign in again before enabling notifications.");
  }

  if (!isPushSupported()) {
    throw new Error("This browser does not support web push notifications.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await getRegistration();
  const vapidResponse = await axios.get(`${BACKEND_URL}/push/vapid-public-key`);
  const applicationServerKey = base64UrlToUint8Array(vapidResponse.data.public_key);

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await axios.post(`${BACKEND_URL}/push/subscribe`, {
    user_id: userId,
    subscription: subscription.toJSON(),
    user_agent: navigator.userAgent,
  });

  localStorage.setItem("push_enabled", "true");
  return subscription;
}

export async function syncPushSubscription(userId) {
  if (!userId || !isPushSupported() || Notification.permission !== "granted") {
    localStorage.removeItem("push_enabled");
    return null;
  }

  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    localStorage.removeItem("push_enabled");
    return null;
  }

  await axios.post(`${BACKEND_URL}/push/subscribe`, {
    user_id: userId,
    subscription: subscription.toJSON(),
    user_agent: navigator.userAgent,
  });

  localStorage.setItem("push_enabled", "true");
  return subscription;
}

export async function disablePushNotifications(userId) {
  if (!userId || !("serviceWorker" in navigator)) {
    localStorage.removeItem("push_enabled");
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    localStorage.removeItem("push_enabled");
    return;
  }

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await axios.post(`${BACKEND_URL}/push/unsubscribe`, {
      user_id: userId,
      endpoint: subscription.endpoint,
    });
    await subscription.unsubscribe();
  }

  localStorage.removeItem("push_enabled");
}

export async function subscribeUser(userId) {
  // Step 1: Ask for notification permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Please enable notifications to create reminders.");
    return;
  }

  // Step 2: Register the service worker
  const registration = await navigator.serviceWorker.register("/sw.js");

  // Step 3: Fetch VAPID_PUBLIC_KEY from the backend
  const response = await fetch(`${BACKEND_URL}/push/public_key`);
  const { publicKey } = await response.json();

  // Step 4: Subscribe the user
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Step 5: Send subscription to the backend
  await fetch(`${BACKEND_URL}/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId, // Replace with the logged-in user's ID
      ...subscription.toJSON(),
    }),
  });

  alert("You are now subscribed to notifications!");
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
