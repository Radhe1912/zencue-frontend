self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    data: data.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});
