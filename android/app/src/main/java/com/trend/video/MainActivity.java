package com.trend.video;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.capgo.capacitor_ffmpeg.FFmpeg;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(FFmpeg.class);
    }
}
