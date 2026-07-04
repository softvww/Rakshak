package com.rakshak.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@CapacitorPlugin(name = "ParentalControl")
public class ParentalControlPlugin extends Plugin {
    private static final String TAG = "ParentalControlPlg";

    @PluginMethod
    public void checkUsagePermission(PluginCall call) {
        Context ctx = getContext();
        AppOpsManager appOps = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), ctx.getPackageName());
        boolean granted = (mode == AppOpsManager.MODE_ALLOWED);

        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void openUsagePermissionSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkNotificationPermission(PluginCall call) {
        Context ctx = getContext();
        String flat = Settings.Secure.getString(ctx.getContentResolver(), "enabled_notification_listeners");
        boolean enabled = flat != null && flat.contains(ctx.getPackageName());

        JSObject ret = new JSObject();
        ret.put("granted", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationPermissionSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getAppUsage(PluginCall call) {
        try {
            Context ctx = getContext();
            UsageStatsManager usm = (UsageStatsManager) ctx.getSystemService(Context.USAGE_STATS_SERVICE);

            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            long midnight = calendar.getTimeInMillis();
            long now = System.currentTimeMillis();

            List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, midnight, now);

            // Temporary map to accumulate times (some packages might yield multiple records
            // on different devices)
            Map<String, Long> usageMap = new HashMap<>();

            if (stats != null) {
                for (UsageStats usageStats : stats) {
                    String pkg = usageStats.getPackageName();
                    long timeMs = usageStats.getTotalTimeInForeground();
                    if (timeMs > 0) {
                        Long existing = usageMap.get(pkg);
                        usageMap.put(pkg, (existing == null ? 0 : existing) + timeMs);
                    }
                }
            }

            JSObject res = new JSObject();

            // Check specifically for common social apps
            String[] targetPkgs = {
                    "com.google.android.youtube",
                    "com.whatsapp",
                    "com.facebook.katana",
                    "com.facebook.lite",
                    "com.instagram.android",
                    "com.google.android.apps.youtube.kids"
            };

            for (String pkg : targetPkgs) {
                long durationMs = usageMap.containsKey(pkg) ? usageMap.get(pkg) : 0;
                long minutes = durationMs / (1000 * 60);
                res.put(pkg, minutes);
            }

            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to query usage stats: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getNotifications(PluginCall call) {
        try {
            List<NotificationStore.NotificationItem> items = NotificationStore.getNotifications();
            JSArray arr = new JSArray();
            for (NotificationStore.NotificationItem ni : items) {
                arr.put(ni.toJSObject());
            }
            JSObject res = new JSObject();
            res.put("notifications", arr);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to fetch notification logs: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        try {
            PackageManager pm = getContext().getPackageManager();
            List<PackageInfo> packs = pm.getInstalledPackages(0);
            JSArray arr = new JSArray();

            for (PackageInfo p : packs) {
                // Filter out non-launcher / system system packages to keep it clean (only
                // third-party/launcher apps)
                boolean isSystem = (p.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
                boolean hasLauncher = pm.getLaunchIntentForPackage(p.packageName) != null;

                if (hasLauncher || !isSystem) {
                    JSObject obj = new JSObject();
                    obj.put("packageName", p.packageName);
                    obj.put("appName", p.applicationInfo.loadLabel(pm).toString());
                    obj.put("isSystem", isSystem);
                    arr.put(obj);
                }
            }

            JSObject res = new JSObject();
            res.put("apps", arr);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to fetch installed apps: " + e.getMessage());
        }
    }
}
