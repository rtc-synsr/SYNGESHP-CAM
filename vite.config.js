import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // chemin relatif : fonctionne aussi bien en local qu'hébergé sous un sous-dossier (GitHub Pages)
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) return "charts";
          if (id.includes("jspdf")) return "pdf-core";
          if (id.includes("html2canvas")) return "html2canvas";
          if (id.includes("dompurify")) return "pdf-utils";
          if (id.includes("xlsx")) return "excel";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("qrcode")) return "qrcode";
          // Les petites dépendances restantes sont laissées à Rollup afin qu'il
          // évite les cycles artificiels entre paquets interdépendants.
          return undefined;
        },
      },
    },
  },
});

