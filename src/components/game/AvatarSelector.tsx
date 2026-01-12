import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Preset avatar options - fun colorful characters
const PRESET_AVATARS = [
  { id: "elephant", emoji: "🐘", bg: "from-sky-400 to-sky-600" },
  { id: "lion", emoji: "🦁", bg: "from-orange-400 to-orange-600" },
  { id: "unicorn", emoji: "🦄", bg: "from-pink-400 to-purple-500" },
  { id: "dragon", emoji: "🐉", bg: "from-green-400 to-emerald-600" },
  { id: "owl", emoji: "🦉", bg: "from-amber-400 to-amber-600" },
  { id: "fox", emoji: "🦊", bg: "from-orange-500 to-red-500" },
  { id: "panda", emoji: "🐼", bg: "from-gray-300 to-gray-500" },
  { id: "penguin", emoji: "🐧", bg: "from-slate-400 to-slate-600" },
  { id: "butterfly", emoji: "🦋", bg: "from-blue-400 to-indigo-500" },
  { id: "bee", emoji: "🐝", bg: "from-yellow-400 to-amber-500" },
  { id: "rocket", emoji: "🚀", bg: "from-red-500 to-orange-500" },
  { id: "star", emoji: "⭐", bg: "from-yellow-300 to-yellow-500" },
];

interface AvatarSelectorProps {
  selectedType: "initial" | "preset" | "custom";
  selectedValue: string | null;
  playerName: string;
  onSelect: (type: "initial" | "preset" | "custom", value: string | null) => void;
  onClose: () => void;
}

export const AvatarSelector = ({
  selectedType,
  selectedValue,
  playerName,
  onSelect,
  onClose,
}: AvatarSelectorProps) => {
  const [activeTab, setActiveTab] = useState<"preset" | "upload">("preset");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    selectedType === "custom" ? selectedValue : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (avatarId: string) => {
    onSelect("preset", avatarId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setPreviewUrl(urlData.publicUrl);
      onSelect("custom", urlData.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUseInitial = () => {
    onSelect("initial", null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-sky-500 to-sky-600 text-white">
          <h2 className="font-display font-bold text-xl">Choose Your Avatar</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("preset")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "preset"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500"
            }`}
          >
            🎨 Characters
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "upload"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500"
            }`}
          >
            📷 Upload Photo
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            {activeTab === "preset" ? (
              <motion.div
                key="preset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Use Initial Button */}
                <button
                  onClick={handleUseInitial}
                  className={`w-full mb-4 p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedType === "initial"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200 hover:border-sky-300"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-display font-bold text-xl">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Use My Initial</p>
                    <p className="text-sm text-gray-500">
                      Display first letter of your name
                    </p>
                  </div>
                  {selectedType === "initial" && (
                    <Check className="w-5 h-5 text-sky-600 ml-auto" />
                  )}
                </button>

                {/* Preset Grid */}
                <p className="text-sm text-gray-500 mb-3">
                  Or pick a character:
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetSelect(avatar.id)}
                      className={`relative aspect-square rounded-xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-3xl shadow-md transition-all ${
                        selectedType === "preset" && selectedValue === avatar.id
                          ? "ring-4 ring-sky-500 ring-offset-2"
                          : ""
                      }`}
                    >
                      {avatar.emoji}
                      {selectedType === "preset" &&
                        selectedValue === avatar.id && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                {/* Preview */}
                <div className="mb-6">
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Avatar preview"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-sky-500 shadow-lg"
                      />
                      {selectedType === "custom" && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {previewUrl ? "Change Photo" : "Upload Photo"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Max file size: 2MB. Supports JPG, PNG, GIF
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper component to display avatar based on type
export const PlayerAvatar = ({
  type,
  value,
  playerName,
  size = "md",
  className = "",
}: {
  type: "initial" | "preset" | "custom";
  value: string | null;
  playerName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
  };

  const preset = PRESET_AVATARS.find((a) => a.id === value);

  if (type === "custom" && value) {
    return (
      <img
        src={value}
        alt={playerName}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  if (type === "preset" && preset) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${preset.bg} flex items-center justify-center ${sizeClasses[size]} ${className}`}
      >
        {preset.emoji}
      </div>
    );
  }

  // Default: initial
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-display font-bold ${sizeClasses[size]} ${className}`}
    >
      {playerName.charAt(0).toUpperCase()}
    </div>
  );
};

export { PRESET_AVATARS };
