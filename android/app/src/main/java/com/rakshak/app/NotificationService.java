package com.rakshak.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.os.Bundle;
import android.util.Log;

public class NotificationService extends NotificationListenerService {
    private static final String TAG = "RakshakNotificationServ";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String packageName = sbn.getPackageName();
            Bundle extras = sbn.getNotification().extras;

            // Extract title and text
            String title = extras.getString("android.title");
            CharSequence textChar = extras.getCharSequence("android.text");
            String text = textChar != null ? textChar.toString() : "";

            // Filters: Only capture messages from social and messaging apps
            if (packageName != null && (packageName.contains("whatsapp") ||
                    packageName.contains("facebook") ||
                    packageName.contains("instagram") ||
                    packageName.contains("youtube") ||
                    packageName.contains("mms") ||
                    packageName.contains("messaging") ||
                    packageName.contains("telephony") ||
                    packageName.contains("android.apps.messaging"))) {
                // If it is regular system alerts, we skip
                if (title != null && !title.isEmpty() && !text.isEmpty()) {
                    NotificationStore.addNotification(packageName, title, text);
                    Log.d(TAG, "Captured notification from info: pkg=" + packageName + ", title=" + title + ", txt="
                            + text);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing notification: " + e.getMessage());
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // No-op
    }
}
