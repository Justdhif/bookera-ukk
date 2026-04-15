"use client";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export default function SettingsMusicCard() {
  const t = useTranslations("settings");
  const {
    isMusicEnabled,
    isPlaying,
    volume,
    currentTime,
    duration,
    currentTrackId,
    tracks,
    toggleMusic,
    togglePlayPause,
    setVolume,
    switchTrack,
    formatTime,
  } = useAudio();
  const activeTrack = tracks.find((t) => t.id === currentTrackId) ?? tracks[0];
  const handleToggleMusic = () => {
    toggleMusic();
    toast.success(isMusicEnabled ? t("musicTurnedOff") : t("musicNowPlaying"));
  };
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl relative">
          {t("musicTitle")}
          <div className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-base">
          {t("musicDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">{t("selectTrack")}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tracks.map((track) => {
              const isActive = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => switchTrack(track.id)}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                    isActive
                      ? "border-brand-primary bg-brand-primary/3 shadow-sm shadow-brand-primary/5"
                      : "border-border hover:border-brand-primary/20 hover:bg-accent/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" 
                        : "bg-muted text-muted-foreground group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                    )}
                  >
                    {isActive && isPlaying ? (
                       <div className="flex items-end gap-0.5 h-4">
                        <div className="w-1 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-[40%]" />
                        <div className="w-1 bg-white animate-[music-bar_1.2s_ease-in-out_infinite] h-full" />
                        <div className="w-1 bg-white animate-[music-bar_0.9s_ease-in-out_infinite] h-[60%]" />
                       </div>
                    ) : (
                      <Music className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-bold truncate transition-colors",
                      isActive ? "text-brand-primary" : "text-foreground"
                    )}>
                      {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isActive ? t("nowSelectedAutoLoop") : "Ambient Track"}
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-inner">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-8 p-6 overflow-hidden rounded-3xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/2 via-transparent to-brand-primary/5">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary/10 transition-transform duration-500",
                isPlaying && isMusicEnabled && "rotate-12 scale-105"
              )}>
                <Music className="h-10 w-10 text-brand-primary" />
                {isPlaying && isMusicEnabled && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-primary text-[8px] items-center justify-center text-white">
                      <Play className="h-2 w-2 fill-current" />
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {activeTrack.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {isMusicEnabled ? t("autoLoopEnabled") : t("musicDisabledHint")}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              variant={isMusicEnabled ? "outline" : "submit"}
              onClick={handleToggleMusic}
            >
              {isMusicEnabled ? (
                <div className="flex items-center gap-2">
                   <VolumeX className="h-5 w-5" />
                   {t("disableMusic")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Volume2 className="h-5 w-5" />
                   {t("enableMusic")}
                </div>
              )}
            </Button>
          </div>
          
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
        </div>
        {isMusicEnabled && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="brand"
                size="icon"
                className="h-12 w-12 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="space-y-3">
              <Label className="text-base">{t("volumeControl")}</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-brand-primary"
                  onClick={() => setVolume(Math.max(0, volume - 10))}
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-brand-primary"
                  onClick={() => setVolume(Math.min(100, volume + 10))}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-right">
                  {volume}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
              <div
                className={`h-2 w-2 rounded-full ${
                  isPlaying ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                }`}
              />
              <span className="text-sm">
                {isPlaying ? t("musicPlaying") : t("musicPaused")}
              </span>
              {isPlaying && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {t("autoLoopActive")}
                </span>
              )}
            </div>
          </>
        )}
        {!isMusicEnabled && (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("musicDisabledHint")}</p>
            <p className="text-sm">{t("enableMusicHint")}</p>
            <p className="text-xs mt-1 opacity-70">{t("musicAutoPlayHint")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
