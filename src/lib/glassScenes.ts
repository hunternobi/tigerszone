// How strongly each page photo is dimmed and blurred behind the glass cards (read by FadingBackground).

export interface PagePhotoLook {
  opacity: number;
  blurPx: number;
}

/** The Spieltagsblog photo, dimmed for long texts and because the photo itself is very bright. */
export const FANS_SCENE: PagePhotoLook = { opacity: 0.3, blurPx: 1.5 };

/** The "Jubel" photo of the Tippgruppen pages. */
export const JUBEL_SCENE: PagePhotoLook = { opacity: 0.38, blurPx: 1.5 };

/** The photo of the Community page (light, so it is dimmed a lot). */
export const COMMUNITY_SCENE: PagePhotoLook = { opacity: 0.22, blurPx: 1.5 };
