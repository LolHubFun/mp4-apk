package com.trend.video;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.arthenica.mobileffmpeg.Config;

import static com.arthenica.mobileffmpeg.Config.RETURN_CODE_SUCCESS;

@CapacitorPlugin(name = "FFmpegPlugin")
public class FFmpegPlugin extends Plugin {

    @PluginMethod
    public void execute(PluginCall call) {
        String command = call.getString("command");
        if (command == null) {
            call.reject("Command is required");
            return;
        }

        // Asinxron işlədirik (mobile-ffmpeg v4.4 API)
        long executionId = FFmpeg.executeAsync(command, (executionId1, returnCode) -> {
            JSObject ret = new JSObject();
            
            if (returnCode == RETURN_CODE_SUCCESS) {
                ret.put("code", 0);
                ret.put("message", "success");
            } else {
                ret.put("code", returnCode);
                ret.put("message", "Command failed with rc " + returnCode);
            }
            // Nəticəni JavaScript-ə qaytarırıq
            call.resolve(ret);
        });
    }
}