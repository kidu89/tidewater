package com.fishingfree.game;

import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

/**
 * Opens the high-fidelity hosted PWA in Chrome on Android 12+, where Chrome's WebGPU
 * implementation can use the phone GPU even when Android System WebView cannot.
 * Older devices and devices without Chrome keep the bundled, offline-capable APK path.
 */
public class MainActivity extends BridgeActivity {

    private static final String WEB_GAME_URL = "https://kidu89.github.io/tidewater/?source=installed-app";
    private static final String CHROME_PACKAGE = "com.android.chrome";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return;

        Intent chromeIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(WEB_GAME_URL));
        chromeIntent.setPackage(CHROME_PACKAGE);

        try {
            startActivity(chromeIntent);
            finish();
        } catch (ActivityNotFoundException ignored) {
            // Keep the bundled local game available if Chrome can't be launched.
        }
    }
}
