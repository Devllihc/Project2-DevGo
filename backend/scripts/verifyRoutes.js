import router from "../routes/reviewRoutes.js";

const expectedRoutes = [
  { path: "/tour/:tourId", method: "get", middlewares: [] },
  { path: "/", method: "post", middlewares: ["verifyToken"] },
  { path: "/:id", method: "put", middlewares: ["verifyToken"] },
  { path: "/admin", method: "get", middlewares: ["verifyToken", "isAdmin"] },
  { path: "/admin/:id/hide", method: "put", middlewares: ["verifyToken", "isAdmin"] },
  { path: "/admin/:id", method: "delete", middlewares: ["verifyToken", "isAdmin"] }
];

console.log("--- Inspecting Review Routes ---");

let passed = true;

expectedRoutes.forEach(expected => {
  // Find matching route in router.stack
  const match = router.stack.find(layer => {
    if (!layer.route) return false;
    const hasMethod = layer.route.methods[expected.method];
    return layer.route.path === expected.path && hasMethod;
  });

  if (!match) {
    console.error(`[FAIL] Route not found: ${expected.method.toUpperCase()} ${expected.path}`);
    passed = false;
    return;
  }

  // Check middlewares
  // Note: router route handlers and middlewares are in layer.route.stack
  const middlewares = match.route.stack
    .slice(0, -1) // last one is the controller function
    .map(layer => layer.name);

  // Check if expected middlewares are present
  const allMiddlewaresPresent = expected.middlewares.every(mwName => middlewares.includes(mwName));

  if (!allMiddlewaresPresent) {
    console.error(`[FAIL] ${expected.method.toUpperCase()} ${expected.path} - Expected middlewares: [${expected.middlewares.join(", ")}], got: [${middlewares.join(", ")}]`);
    passed = false;
  } else {
    console.log(`[PASS] ${expected.method.toUpperCase()} ${expected.path} has expected middlewares: [${expected.middlewares.join(", ")}]`);
  }
});

if (passed) {
  console.log("\nAll review routes and middleware registrations are correct!");
  process.exit(0);
} else {
  console.error("\nSome route checks failed!");
  process.exit(1);
}
