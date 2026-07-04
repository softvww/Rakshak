package com.rakshak.app;

import java.util.ArrayList;
import java.util.List;
import com.getcapacitor.JSObject;

public class NotificationStore {
    public static class NotificationItem {
        public String packageName;
        public String title;
        public String text;
        public long timestamp;

        public JSObject toJSObject() {
            JSObject obj = new JSObject();
            obj.put("packageName", packageName);
            obj.put("title", title);
            obj.put("text", text);
            obj.put("timestamp", timestamp);
            return obj;
        }
    }

    private static final List<NotificationItem> items = new ArrayList<>();

    public static synchronized void addNotification(String pkg, String title, String txt) {
        if (pkg == null)
            pkg = "";
        if (title == null)
            title = "";
        if (txt == null)
            txt = "";

        // Remove duplicates of same message from same app within a critical time window
        if (!items.isEmpty()) {
            NotificationItem last = items.get(items.size() - 1);
            if (last.packageName.equals(pkg) && last.title.equals(title) && last.text.equals(txt) &&
                    (System.currentTimeMillis() - last.timestamp) < 5000) {
                return; // Duplicate notification within 5 seconds, ignore
            }
        }

        NotificationItem ni = new NotificationItem();
        ni.packageName = pkg;
        ni.title = title;
        ni.text = txt;
        ni.timestamp = System.currentTimeMillis();

        items.add(ni);
        if (items.size() > 50) {
            items.remove(0);
        }
    }

    public static synchronized List<NotificationItem> getNotifications() {
        return new ArrayList<>(items);
    }

    public static synchronized void clear() {
        items.clear();
    }
}
