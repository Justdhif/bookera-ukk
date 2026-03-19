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
    toast.success(
      isMusicEnabled
        ? t("musicTurnedOff")
        : t("musicNowPlaying"),
    );
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
        <div className="space-y-2">
          <Label className="text-base">{t("selectTrack")}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tracks.map((track) => {
              const isActive = track.id === currentTrackId;
              return (
                <button
                  key={track.id}
                  onClick={() => switchTrack(track.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/30"
                      : "border-border hover:border-brand-primary/40 hover:bg-brand-primary/5"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive ? "bg-brand-primary text-white" : "bg-muted"
                    }`}
                  >
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm truncate ${
                        isActive ? "text-brand-primary" : ""
                      }`}
                    >
                      {track.name}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground">
                        {t("nowSelectedAutoLoop")}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-brand-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-linear-to-r from-brand-primary/5 to-transparent rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-full">
              <Music className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{activeTrack.name}</h3>
              <p className="text-sm text-muted-foreground">{t("autoLoopEnabled")}</p>
            </div>
          </div>
          <Button
            size="lg"
            variant="brand"
            className={`relative transition-all ${
              isMusicEnabled ? "ring-4 ring-brand-primary/30" : ""
            }`}
            onClick={handleToggleMusic}
          >
            {isMusicEnabled ? t("disableMusic") : t("enableMusic")}
          </Button>
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
                  variant="brand"
                  size="icon"
                  className="h-10 w-10"
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
                  variant="brand"
                  size="icon"
                  className="h-10 w-10"
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
            <p className="text-sm">
              {t("enableMusicHint")}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {t("musicAutoPlayHint")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
