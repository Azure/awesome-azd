import React from "react";
import {
  useThemeConfig,
  ErrorCauseBoundary,
  useColorMode,
} from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import SearchBar from "@theme/SearchBar";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarSearch from "@theme/Navbar/Search";
import styles from "./styles.module.css";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              { cause: error }
            )
          }
        >
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}
function NavbarContentLayout({ left, right }) {
  return (
    <div className="navbar__inner">
      <div className="navbar__items">{left}</div>
      <div className="navbar__items navbar__items--right">{right}</div>
    </div>
  );
}
export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === "search");
  const { colorMode, setColorMode } = useColorMode();
  return (
    <NavbarContentLayout
      left={
        // TODO stop hardcoding items?
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
          {colorMode != "dark" ? (
            <div style={{ borderLeft: "1px solid black", height: "25px" }} />
          ) : (
            <div style={{ borderLeft: "1px solid white", height: "25px" }} />
          )}
          <NavbarItems items={leftItems} />
        </>
      }
      right={
        // TODO stop hardcoding items?
        // Ask the user to add the respective navbar items => more flexible
        <>
          <NavbarColorModeToggle className={styles.colorModeToggle} />
          <div style={{ padding: "0 12px" }}>
            <button
              className={clsx("clean-btn", styles.colorModeToggle)}
              onClick={() => {
                window.open("https://github.com/Azure/awesome-azd", "_blank");
              }}
              value={colorMode}
              onChange={setColorMode}
            >
              {colorMode != "dark" ? (
                <img src={useBaseUrl("/img/githubLight.svg")} alt="Github" />
              ) : (
                <img src={useBaseUrl("/img/github.svg")} alt="Github" />
              )}
            </button>
          </div>
          <NavbarItems items={rightItems} />
          {!searchBarItem && (
            <NavbarSearch>
              <SearchBar />
            </NavbarSearch>
          )}
        </>
      }
    />
  );
}
