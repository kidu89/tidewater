package com.fishingfree.game;

import com.getcapacitor.BridgeActivity;

/**
 * Runs the version-matched web build bundled in this APK, including offline assets.
 * The game tries its original WebGPU renderer first, then opens scenic fishing automatically
 * if the Android WebView cannot create an adapter.
 */
public class MainActivity extends BridgeActivity {
}