const getFirstAllowedRoute = (routes, permissions) => {
  
  for (const r of routes) {

    // For groups
    if (r.collapse) {
      const nested = getFirstAllowedRoute(r.collapse, permissions);
      if (nested && nested !== "/login") return nested;
    }

    // Skip routes with no `route`
    if (!r.route) continue;

    // Route with no permission required
    if (!r.permission) return r.route;    

    // Route requires permission
    if (permissions.includes(r.permission)) return r.route;
  }

  return "/login";
};

export default getFirstAllowedRoute;
