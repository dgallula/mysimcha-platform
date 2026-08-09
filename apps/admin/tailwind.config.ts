import type { Config } from "tailwindcss";
import preset from "@mysimcha/config/tailwind";

const config: Config = {
  presets: [preset as Config],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
