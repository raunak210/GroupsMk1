"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

export default function LabTabs({ tabs }) {
  const [value, setValue] = React.useState("0");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "background.paper",
          }}
        >
          <TabList onChange={handleChange} aria-label="Dynamic tabs">
            {tabs?.map((tab, index) => (
              <Tab
                key={index}
                label={tab.heading}
                value={index.toString()}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </TabList>
        </Box>
        <Box sx={{ flexGrow: 1, p: 2 }}>
          {tabs?.map((tab, index) => (
            <TabPanel key={index} value={index.toString()} sx={{ p: 0 }}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    </Box>
  );
}
