import { NextResponse } from "next/server";

/**
 * The service worker normally handles shared files on the device. If it isn't active yet,
 * never accept the files on the server: just open the app so the user can add them there.
 */
export function POST(request: Request) {
  return NextResponse.redirect(new URL("/?open=tray", request.url), 303);
}
