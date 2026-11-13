/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Layout from "@theme/Layout";
import ExtensionGalleryPage from "../components/gallery/ExtensionGalleryPage";

export default function Extensions(): React.JSX.Element {
  return (
    <Layout>
      <ExtensionGalleryPage />
    </Layout>
  );
}
