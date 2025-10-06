/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback } from "react";
import { useHistory } from "@docusaurus/router";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { prepareUserState } from "@site/src/pages/index";
import { Checkbox } from "@fluentui/react-components";

export default function ShowcaseAuthorSelect({
  label,
  author,
  id,
  activeAuthors,
  selectedAuthors,
  setSelectedAuthors,
  location,
  readSearchAuthors,
  replaceSearchAuthors,
}: {
  label: string;
  author: string;
  id: string;
  activeAuthors: string[];
  selectedAuthors: string[];
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  location;
  readSearchAuthors: (search: string) => string[];
  replaceSearchAuthors: (search: string, newAuthors: string[]) => string;
}): JSX.Element {
  const history = useHistory();
  
  // updates only the url query
  const toggleAuthor = () => {
    const authors = readSearchAuthors(location.search);
    const newAuthors = toggleListItem(authors, author);
    const newSearch = replaceSearchAuthors(location.search, newAuthors);
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  };

  const template = id.replace("showcase_checkbox_author_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${template}\",\"cN\":\"Authors\"}`;

  const toggleCheck = (author: string) => {
    if (selectedAuthors.includes(author)) {
      setSelectedAuthors(selectedAuthors.filter((item) => item !== author));
    } else {
      setSelectedAuthors([...selectedAuthors, author]);
    }
  };

  return (
    <>
      <Checkbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleAuthor();
            toggleCheck(author);
          }
        }}
        onChange={() => {
          toggleAuthor();
          toggleCheck(author);
        }}
        checked={selectedAuthors.includes(author)}
        label={label}
        disabled={!activeAuthors?.includes(author)}
      />
    </>
  );
}