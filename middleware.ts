import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ১. আপনার ল্যান্ডিং পেজ এবং অন্যান্য পাবলিক পেজ এখানে রাখুন
const isPublicRoute = createRouteMatcher([
  "/", 
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/success-stories" // আপনি যদি এই পেজটি রাখতে চান
]);

export default clerkMiddleware(async (auth, req) => {
  // ২. যদি পাবলিক রাউট না হয়, তবেই প্রটেক্ট করুন
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js এর ইন্টারনাল ফাইল এবং স্ট্যাটিক ফাইলগুলো এড়িয়ে চলবে
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API এবং TRPC রাউট সবসময় চেক করবে
    "/(api|trpc)(.*)",
  ],
};