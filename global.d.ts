import mongoose from "mongoose";
import { UserRole } from "@/types/user.type";
import { SessionCookiePayload } from "@/services/session.service";

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
  interface Window {
    snap: any;
  }
}

declare module "next/server" {
  interface NextRequest {
    user?: SessionCookiePayload;
  }
}
