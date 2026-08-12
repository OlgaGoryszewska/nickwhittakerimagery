import { NextResponse, type NextRequest } from "next/server";
import { clearCustomerSession } from "@/app/lib/shopify/customer-account/session";

// POST-only (form submit) since this has a real side effect — see
// Header.tsx's sign-out form.
export async function POST(request: NextRequest) {
  await clearCustomerSession();
  return NextResponse.redirect(new URL("/", request.nextUrl.origin));
}
