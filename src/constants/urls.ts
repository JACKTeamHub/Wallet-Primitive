export const API_BASE_URL = "https://jackwalletprimitive.onrender.com/api/v1";
export const API_DOCS_URL = "https://jackwalletprimitive.onrender.com/api";
export const GITHUB_URL = "https://github.com/JACKTeamHub/";
export const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "wallet-primitive.vercel.app/";

export function appPath(path: string) {
  return `${APP_HOST}${path}`;
}
