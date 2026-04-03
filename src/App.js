import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import { AlertProvider } from "components/commonFunction/alertsLoader";
import Sidenav from "examples/Sidenav";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import AddServiceArea from "layouts/servicearea/AddServiceArea";

import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import routes, { StoreRoutes } from "routes";

import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import AddCategories from "layouts/Categories/AddCategories";
import NoAccess from "layouts/NoAccess";
import GetSubCategories from "layouts/Categories/SubCategories";
import City from "layouts/City Management/City";
import CityTable from "layouts/City Management/CityTable";
import UserData from "layouts/Users/Users";
import CreateUser from "layouts/Users/AddUser";
import AddBanner from "layouts/Banner/AddBanner";
import AddBrand from "layouts/Brand/Brand";
import BrandTable from "layouts/Brand/BrandTable";
import Attributes from "layouts/Attribute/Value";
import Tax from "layouts/Attribute/Tax";
import AttributeTable from "layouts/Attribute/AttributeArray";
import Product from "layouts/Products/Product";
import AddStore from "layouts/Store/AddStore";
import SubSubCat from "layouts/Categories/SubSubCat";
import AddUnit from "layouts/Attribute/AddUnit";
import EditCity from "layouts/City Management/EditCity";
import EditZone from "layouts/servicearea/EditZone";
import EditAll from "layouts/Attribute/EditForAll";
import EditBrand from "layouts/Brand/EditBrand";
import EditCategory from "layouts/Categories/EditCat";
import EditSubCat from "layouts/Categories/EditSubCat";
import EditSubSubCat from "layouts/Categories/EditSubSub";
import PrivateRoute from "Login/PrivateRoute";
import LoginPage from "Login/Login";
import StoreTabel from "layouts/Store/StoreTable";
import Addtax from "layouts/Attribute/AddTax";
import EditTax from "layouts/Attribute/EditTax";
import Editunit from "layouts/Attribute/EditUnit";
import EditProduct from "layouts/Products/EditProduct";
import EditBanner from "layouts/Banner/EditBanner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalLoader from "components/loader/GlobalLoader";
import StoreLogin from "layouts/Store/StoreLogin";
import Filter from "layouts/Attribute/Filter";
import AddFilter from "layouts/Attribute/AddFilter";
import AddDriver from "layouts/Drivers/AddDriver";
import EditFilter from "layouts/Attribute/EditFilter";
import DashBoard from "layouts/Store/StoreRoutes/DashBoard";
import Drivers from "layouts/Drivers/Drivers";
import DeliveryStatus from "layouts/DeliveryStatus/DeliveryStatus";
import Orders from "layouts/Orders/Order";
import BulkOrders from "layouts/bulkOrders/bulkOrders";
import StoreOrder from "layouts/Store/StoreRoutes/StoreOrder";
import StoreCategories from "layouts/Store/StoreRoutes/Categories";
import Stock from "layouts/Store/StoreRoutes/Stock";
import StoreProduct from "layouts/Store/StoreRoutes/StoreProduct";
import AddStoreCat from "layouts/Store/StoreRoutes/AddCatStore";
import AddPageForm from "Setting/addEditPage";
import AddBlog from "layouts/Blogs/addBlog";
import StoreTransaction from "layouts/Store/StoreRoutes/storeTransaction";
import DriverTransaction from "layouts/Drivers/driverTransaction";
import Sitemap from "layouts/SEO/Sitemap";
import Schema from "layouts/SEO/Schema";
import Etc from "layouts/SEO/Etc";
// import Charities from "layouts/Charity/Charities";
// import Humanity from "layouts/Charity/Humanity";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  const [isStoreUser, setIsStoreUser] = useState(false);

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType === "store") {
      setIsStoreUser(true);
    } else {
      setIsStoreUser(false);
    }
  }, []);

  const user = JSON.parse(localStorage.getItem("adminUser"));
  const userPermissions = user?.permissions || [];

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      // ❌ No permission → block route
      if (route.permission && !userPermissions.includes(route.permission)) {
        return (
          <Route
            path={route.route}
            element={<Navigate to="/no-access" replace />}
            key={route.key}
          />
        );
      }

      // ✅ Allowed route
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const activeRoutes = isStoreUser ? StoreRoutes : routes;
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right={{ xs: "1rem", md: "2rem" }}
      bottom={{ xs: "1rem", md: "2rem" }}
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <AlertProvider>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            {layout === "dashboard" && pathname !== "/login" && (
              <>
                <Sidenav
                  color={sidenavColor}
                  brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                  brandName="Fivlia Dashboard"
                  routes={activeRoutes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                />
                <Configurator />
                {configsButton}
                <MDBox
                  sx={{
                    ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
                    p: { xs: 1, md: 2 },
                  }}
                >
                  <DashboardLayout>
                    <Routes>
                      <Route element={<PrivateRoute />}>
                        {getRoutes(routes)}
                        <Route path="/addCategories" element={<AddCategories />} />
                        <Route path="/addlocation" element={<AddServiceArea />} />
                        <Route path="/getsubsubcat" element={<SubSubCat />} />
                        <Route path="/getsubcate" element={<GetSubCategories />} />
                        <Route path="/edit-sub" element={<EditCategory />} />
                        <Route path="/edit-subCat" element={<EditSubCat />} />
                        <Route path="/edit-subsubCat" element={<EditSubSubCat />} />
                        <Route path="/city" element={<City />} />
                        <Route path="/user-data" element={<UserData />} />
                        <Route path="/user-create" element={<CreateUser />} />
                        <Route path="/add-banner" element={<AddBanner />} />
                        <Route path="/add-brand" element={<AddBrand />} />
                        <Route path="/edit-brand" element={<EditBrand />} />
                        <Route path="/attribute-value" element={<Attributes />} />
                        <Route path="/add-product" element={<Product />} />
                        <Route path="/add-store" element={<AddStore />} />
                        <Route path="/add-unit" element={<AddUnit />} />
                        <Route path="/edit-unit" element={<Editunit />} />
                        <Route path="/edit-city" element={<EditCity />} />
                        <Route path="/edit-zone" element={<EditZone />} />
                        <Route path="/edit-all" element={<EditAll />} />
                        <Route path="/create-store" element={<AddStore />} />
                        <Route path="/add-tax" element={<Addtax />} />
                        <Route path="/edit-tax" element={<EditTax />} />
                        <Route path="/edit-product" element={<EditProduct />} />
                        <Route path="/edit-banner" element={<EditBanner />} />
                        <Route path="/add-filter" element={<AddFilter />} />
                        <Route path="/edit-filter" element={<EditFilter />} />
                        <Route path="/store-login" element={<StoreLogin />} />
                        <Route path="/edit-store" element={<AddStore />} />
                        <Route path="/add-blog" element={<AddBlog />} />
                        <Route path="/add-page" element={<AddPageForm />} />
                        <Route path="/edit-page" element={<AddPageForm />} />
                        <Route path="/driverTransaction" element={<DriverTransaction />} />
                        <Route path="/sitemap" element={<Sitemap />} />
                        <Route path="/schema" element={<Schema />} />
                        <Route path="/etc" element={<Etc />} />
                        <Route path="/no-access" element={<NoAccess />} />
                        <Route path="*" element={<Navigate to="/no-access" />} />

                        {/* Store Routes */}
                        <Route path="/dashboard1" element={<DashBoard />} />
                        <Route path="/storecat" element={<StoreCategories />} />
                        <Route path="/storeproduct" element={<StoreProduct />} />
                        <Route path="/addstorecat" element={<AddStoreCat />} />
                        <Route path="/storeTransaction" element={<StoreTransaction />} />
                      </Route>
                    </Routes>
                  </DashboardLayout>
                </MDBox>
              </>
            )}
            {pathname === "/login" && (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            )}

            {/* {pathname === "/no-access" && (
              <Routes>
                <Route path="/no-access" element={<NoAccess />} />
              </Routes>
            )} */}

            {layout === "vr" && <Configurator />}
            <ToastContainer position="top-right" autoClose={3000} />
            <GlobalLoader />
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && pathname !== "/login" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="Fivlia Dashboard"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="Fivlia Dashboard"
                routes={activeRoutes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
              <DashboardLayout>
                <Routes>
                  <Route element={<PrivateRoute />}>
                    {getRoutes(routes)}
                    <Route path="/addCategories" element={<AddCategories />} />
                    <Route path="/addlocation" element={<AddServiceArea />} />
                    <Route path="/getsubcate" element={<GetSubCategories />} />
                    <Route path="/getsubsubcat" element={<SubSubCat />} />
                    <Route path="/edit-sub" element={<EditCategory />} />
                    <Route path="/edit-subCat" element={<EditSubCat />} />
                    <Route path="/edit-subsubCat" element={<EditSubSubCat />} />
                    <Route path="/city" element={<City />} />
                    <Route path="/user-data" element={<UserData />} />
                    <Route path="/user-create" element={<CreateUser />} />
                    <Route path="/add-banner" element={<AddBanner />} />
                    <Route path="/add-brand" element={<AddBrand />} />
                    <Route path="/edit-brand" element={<EditBrand />} />
                    <Route path="/attribute-value" element={<Attributes />} />
                    <Route path="/add-product" element={<Product />} />
                    <Route path="/add-store" element={<AddStore />} />
                    <Route path="/add-unit" element={<AddUnit />} />
                    <Route path="/edit-unit" element={<Editunit />} />
                    <Route path="/edit-city" element={<EditCity />} />
                    <Route path="/edit-zone" element={<EditZone />} />
                    <Route path="/edit-all" element={<EditAll />} />
                    <Route path="/add-tax" element={<Addtax />} />
                    <Route path="/edit-tax" element={<EditTax />} />
                    <Route path="/create-store" element={<AddStore />} />
                    <Route path="/edit-product" element={<EditProduct />} />
                    <Route path="/add-driver" element={<AddDriver />} />
                    <Route path="/drivers" element={<Drivers />} />
                    <Route path="/deliveryStatus" element={<DeliveryStatus />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/bulk-orders" element={<BulkOrders />} />
                    <Route path="/edit-banner" element={<EditBanner />} />
                    <Route path="/add-filter" element={<AddFilter />} />
                    <Route path="/edit-filter" element={<EditFilter />} />
                    <Route path="/store-login" element={<StoreLogin />} />
                    <Route path="/edit-store" element={<AddStore />} />
                    <Route path="/add-blog" element={<AddBlog />} />
                    <Route path="/add-page" element={<AddPageForm />} />
                    <Route path="/edit-page" element={<AddPageForm />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/schema" element={<Schema />} />
                    <Route path="/etc" element={<Etc />} />
                    <Route path="/driverTransaction" element={<DriverTransaction />} />
                    <Route path="/no-access" element={<NoAccess />} />

                    <Route path="*" element={<Navigate to="/no-access" />} />

                    {/* Store Routes */}
                    <Route path="/dashboard1" element={<DashBoard />} />
                    <Route path="/storecat" element={<StoreCategories />} />
                    <Route path="/storeproduct" element={<StoreProduct />} />
                    <Route path="/stock" element={<Stock />} />
                    <Route path="/addstorecat" element={<AddStoreCat />} />
                    <Route path="/store-orders" element={<StoreOrder />} />
                    <Route path="/storeTransaction" element={<StoreTransaction />} />
                  </Route>
                </Routes>
              </DashboardLayout>
            </>
          )}
          {pathname === "/login" && (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          )}

          {/* {pathname === "/no-access" && (
            <Routes>
              <Route path="/no-access" element={<NoAccess />} />
            </Routes>
          )} */}

          {layout === "vr" && <Configurator />}
          <ToastContainer position="top-right" autoClose={3000} />
          <GlobalLoader />
        </ThemeProvider>
      )}
    </AlertProvider>
  );
}
