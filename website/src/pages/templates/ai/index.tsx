/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect } from "react";
import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";
import Layout from "@theme/Layout";

export default function AiTemplates(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const templatesUrl = useBaseUrl("/templates");
  const search = new URLSearchParams(isBrowser ? location.search : "");
  search.set("type", "ai");
  const destination = `${templatesUrl}?${search.toString()}`;

  useEffect(() => {
    if (isBrowser) {
      history.replace(destination);
    }
  }, [destination, history, isBrowser]);

  return (
    <Layout>
      <main className="container margin-vert--xl">
        <p>
          AI app templates are now part of the unified template catalog.{" "}
          <Link to={destination}>Open AI app templates</Link>.
        </p>
      </main>
    </Layout>
  );
}
