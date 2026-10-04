package com.fishingfree.game;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidGameBrowser")
public class AndroidGameBrowserPlugin extends Plugin {

    private static final String GAME_URL = "https://kidu89.github.io/tidewater/";

    @PluginMethod
    public void openInChrome(PluginCall call) {
        String requestedUrl = call.getString("url");
        if (!GAME_URL.equals(requestedUrl)) {
            call.reject("Only the official Fishing Free game page can be opened.");
            return;
        }

        Uri gameUri = Uri.parse(GAME_URL);
        Intent chromeIntent = new Intent(Intent.ACTION_VIEW, gameUri);
        chromeIntent.setPackage("com.android.chrome");
        try {
            getActivity().startActivity(chromeIntent);
            call.resolve();
        } catch (ActivityNotFoundException chromeUnavailable) {
            try {
                getActivity().startActivity(new Intent(Intent.ACTION_VIEW, gameUri));
                call.resolve();
            } catch (ActivityNotFoundException browserUnavailable) {
                call.reject("Chrome or another browser could not be opened.", browserUnavailable);
            }
        }
    }
}