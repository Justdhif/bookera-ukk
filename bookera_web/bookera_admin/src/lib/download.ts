export function downloadBlobFile(data: BlobPart, filename: string) {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadQrCode(imageUrl: string, borrowCode: string) {
  if (!imageUrl) return;

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    if (blob.type === "image/svg+xml" || imageUrl.toLowerCase().endsWith(".svg")) {
      const svgUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 1024; // High resolution
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, size, size);
            
            canvas.toBlob((pngBlob) => {
              if (pngBlob) {
                const pngUrl = URL.createObjectURL(pngBlob);
                const link = document.createElement("a");
                link.href = pngUrl;
                link.download = `QR-${borrowCode}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pngUrl);
                resolve();
              } else {
                reject(new Error("Failed to create PNG blob"));
              }
            }, "image/png");
          } else {
            reject(new Error("Failed to get canvas context"));
          }
          URL.revokeObjectURL(svgUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = svgUrl;
      });
    }

    // Default logic for other formats (JPG, PNG, WebP)
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const extension = blob.type.split("/")[1] || imageUrl.split(".").pop() || "png";
    link.download = `QR-${borrowCode}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
