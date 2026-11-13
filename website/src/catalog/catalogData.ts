/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import templates from "../../static/templates.json";
import { createCatalogTemplates } from "./catalogBuilder";
import repositoryMetrics from "./repository-metrics.generated.json";
import reviewedTemplateUseCases from "./template-use-cases.json";

export { createCatalogTemplates };

export const catalogTemplates = createCatalogTemplates(
  templates,
  reviewedTemplateUseCases,
  repositoryMetrics,
);
