package com.trend.video;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.ReturnCode;

@CapacitorPlugin(name = "FFmpegPlugin")
public class FFmpegPlugin extends Plugin {

    @PluginMethod
    public void execute(PluginCall call) {
        String command = call.getString("command");
        if (command == null) {
            call.reject("Command is required");
            return;
        }

        // Asinxron işlədirik ki, UI donmasın
        FFmpegKit.executeAsync(command, session -> {
            ReturnCode returnCode = session.getReturnCode();
            JSObject ret = new JSObject();
            
            if (ReturnCode.isSuccess(returnCode)) {
                ret.put("code", 0);
                ret.put("message", "success");
            } else {
                ret.put("code", returnCode.getValue());
                ret.put("message", "Command failed with state " + session.getState() + " and rc " + returnCode);
            }
            // Nəticəni JavaScript-ə qaytarırıq
            call.resolve(ret);
        });
    }
}
