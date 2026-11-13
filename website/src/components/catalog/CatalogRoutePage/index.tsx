/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useMemo } from "react";
import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";
import Layout from "@theme/Layout";
import type { CatalogPageData } from "../../../catalog/catalogTypes";
import { decodeCatalogPageData } from "../../../catalog/catalogWireFormat";
import CatalogPage from "../CatalogPage";

export default function CatalogRoutePage({
  catalogPage,
}: {
  catalogPage: CatalogPageData;
}): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const templates = useMemo(
    () => decodeCatalogPageData(catalogPage),
    [catalogPage],
  );
  const extensionsUrl = useBaseUrl("/extensions");
  const search = new URLSearchParams(isBrowser ? location.search : "");
  const isLegacyExtensionsUrl =
    isBrowser && search.get("type") === "extensions";
  search.delete("type");
  const query = search.toString();
  const destination = `${extensionsUrl}${query ? `?${query}` : ""}${
    location.hash
  }`;

  useEffect(() => {
    if (isLegacyExtensionsUrl) {
      history.replace(destination);
    }
  }, [destination, history, isLegacyExtensionsUrl]);

  if (isLegacyExtensionsUrl) {
    return (
      <Layout>
        <main className="container margin-vert--xl">
          <p>
            Extensions have moved to the extension gallery.{" "}
            <Link to={destination}>Open extensions</Link>.
          </p>
        </main>
      </Layout>
    );
  }

  return <CatalogPage templates={templates} />;
}
