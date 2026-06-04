import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isSignIn = isSignInPage(request);
  const isProtected = isProtectedRoute(request);

  if (!isSignIn && !isProtected) {
    return;
  }

  const token = await convexAuth.getToken();
  const isAuthenticated = token !== undefined;

  if (isSignIn && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isProtected && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
