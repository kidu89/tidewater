package com.fishingfree.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * Runs the version-matched web build bundled in this APK, including offline assets.
 * If Android WebView has no WebGPU adapter, players can open the hosted 3D build in Chrome.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidGameBrowserPlugin.class);
        super.onCreate(savedInstanceState);
    }
}