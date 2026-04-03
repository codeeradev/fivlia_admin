/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import {
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const [openCollapse, setOpenCollapse] = useState("");


  const textColor = "white";

  const closeSidenav = () => setMiniSidenav(dispatch, true);

 useEffect(() => {
  let timeout;

  function handleResize() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const isMini = window.innerWidth < 1200;

      setMiniSidenav(dispatch, isMini);
      setTransparentSidenav(dispatch, isMini ? false : transparentSidenav);
      setWhiteSidenav(dispatch, isMini ? false : whiteSidenav);
    }, 150);
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    clearTimeout(timeout);
    window.removeEventListener("resize", handleResize);
  };
}, [dispatch, transparentSidenav, whiteSidenav]);


  const toggleCollapse = (key) => {
    setOpenCollapse(openCollapse === key ? "" : key);
  };

  const user = JSON.parse(localStorage.getItem("adminUser"));
const userPermissions = user?.permissions || [];

const renderRoutes = routes
  .filter(r => !r.permission || userPermissions.includes(r.permission))
  .map(({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {

  let returnValue;
     

   

  if (type === "collapse") {
  if (key === "log-out") {
    // Admin logout
    returnValue = (
      <MDBox key={key} sx={{ cursor: "pointer" }}>
        <SidenavCollapse
          name={name}
          icon={icon}
          noCollapse={noCollapse}
          onClick={() => {
            if (window.confirm("Are you sure you want to log out as admin?")) {
              localStorage.removeItem("username");
              localStorage.removeItem("password");
             localStorage.clear();
              window.location.href = "/login";
            }
          }}
        />
      </MDBox>
    );
  } else if (key === "logout") {
    // Store logout
    returnValue = (
      <MDBox key={key} sx={{ cursor: "pointer" }}>
        <SidenavCollapse
          name={name}
          icon={icon}
          noCollapse={noCollapse}
          onClick={() => {
            if (window.confirm("Are you sure you want to log out from store?")) {
              localStorage.removeItem("userType");
              localStorage.removeItem("storeId")
              window.location.href = "/dashboard";
            }
          }}
        />
      </MDBox>
    );
    } else {
      returnValue = href ? (
        <Link href={href} key={key} target="_blank" rel="noreferrer" sx={{ textDecoration: "none" }}>
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === location.pathname.replace("/", "") || (collapse && collapse.some(sub => sub.route === location.pathname))}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <MDBox key={key}>
          <NavLink to={route || "#"} onClick={() => !noCollapse && toggleCollapse(key)}>
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === location.pathname.replace("/", "") || (collapse && collapse.some(sub => sub.route === location.pathname))}
              noCollapse={noCollapse}
            />
          </NavLink>
          {collapse && (
            <Collapse in={openCollapse === key} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                {collapse.map((subRoute) => (
                  <ListItem
                    key={subRoute.key}
                    component={NavLink}
                    to={subRoute.route}
                    sx={{
                      "&:hover": {
                        backgroundColor: transparentSidenav || whiteSidenav ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.1)",
                      },
                      paddingLeft: "16px",
                      color:"white !important"
                    }}
                  >
                    <ListItemIcon
                      sx={(theme) =>
                        collapseIconBox(theme, {
                          transparentSidenav,
                          whiteSidenav,
                          darkMode,
                          active: location.pathname === subRoute.route,
                        })
                      }
                    >
                      {subRoute.icon ? (
                        typeof subRoute.icon === "string" ? (
                          <Icon sx={(theme) => collapseIcon(theme, { active: location.pathname === subRoute.route })}>
                            {subRoute.icon}
                          </Icon>
                        ) : (
                          subRoute.icon
                        )
                      ) : (
                        <Icon sx={(theme) => collapseIcon(theme, { active: location.pathname === subRoute.route })}>
                          chevron_right
                        </Icon>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={subRoute.name}
                      sx={(theme) =>
                        collapseText(theme, {
                          miniSidenav,
                          transparentSidenav,
                          whiteSidenav,
                          active: location.pathname === subRoute.route,
                        })
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </MDBox>
      );
    }
  } else if (type === "title") {
    returnValue = (
      <MDTypography
        key={key}
        color={textColor}
        display="block"
        variant="caption"
        fontWeight="bold"
        textTransform="uppercase"
        pl={3}
        mt={2}
        mb={1}
        ml={1}
      >
        {title}
      </MDTypography>
    );
  } else if (type === "divider") {
    returnValue = (
      <Divider
        key={key}
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
    );
  }

  return returnValue;
});

  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <>
      {/* Drawer on mobile */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={!miniSidenav}
          onClose={() => setMiniSidenav(dispatch, true)}
          PaperProps={{
            sx: {
              width: 260,
              background: "#1a2035",
              color: "#fff"
            }
          }}
        >
          <MDBox pt={3} pb={1} px={4} textAlign="center">
            <MDBox
              position="absolute"
              top={0}
              right={0}
              p={2}
              onClick={() => setMiniSidenav(dispatch, true)}
              sx={{ cursor: "pointer" }}
            >
              <Icon>close</Icon>
            </MDBox>

            {brand && (
              <MDBox component={NavLink} to="/" display="flex" alignItems="center">
                <MDBox component="img" src={brand} alt="Brand" width="2rem" />
                <MDTypography ml={1} variant="h6" fontWeight="medium" color={textColor}>
                  {brandName}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
          <Divider
          light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
          />
          <List>{renderRoutes}</List>
        </Drawer>
      ) : (
        /* Permanent sidebar on desktop */
        <SidenavRoot
          {...rest}
          variant="permanent"
          ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
          sx={{
    width: miniSidenav ? "80px" : "250px", // ✅ defines actual width
    flexShrink: 0,
    transition: "width 0.3s ease",
  }}

        >
          <MDBox pt={3} pb={1} px={4} textAlign="center">
            {brand && (
              <MDBox component={NavLink} to="/" display="flex" alignItems="center">
                <MDBox component="img" src={brand} alt="Brand" width="2rem" />
                <MDTypography ml={1} variant="h6" fontWeight="medium" color={textColor}>
                  {brandName}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
          <Divider 
           light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }/>
          <List>{renderRoutes}</List>
        </SidenavRoot>
      )}
    </>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;