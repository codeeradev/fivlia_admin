import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import Header from "examples/Header/Header";

import { useMaterialUIController, setLayout, setMiniSidenav } from "context";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  const openMobileSidenav = () => setMiniSidenav(dispatch, false);

  return (
    <>
      {/* Mobile/Tablet Menu Button */}
      <MDBox
        sx={{
          display: { xs: "flex", lg: "none" },
          position: "fixed",
          top: "14px",
          left: "14px",
          zIndex: 2000,
        }}
      >
        {miniSidenav && (
          <IconButton
            onClick={openMobileSidenav}
            sx={({ palette, boxShadows }) => ({
              backgroundColor: palette.white.main,
              color: palette.dark.main,
              border: `1px solid ${palette.grey[300]}`,
              boxShadow: boxShadows.navbarBoxShadow,
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: palette.grey[100],
              },
            })}
          >
            <Icon fontSize="small">menu</Icon>
          </IconButton>
        )}
      </MDBox>
      <MDBox
        sx={{
          // same left offset your pages use
          ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
          // keep header visible at the top of the page flow
          // optionally keep it sticky within the content column:
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Header />
      </MDBox>

      {/* Content Wrapper (No Pushing Content Left) */}
      <MDBox
        sx={{
          p: { xs: "70px 12px 12px", sm: "60px 15px 15px", md: "10px" },
          position: "relative",
        }}
      >
        {children}
      </MDBox>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
