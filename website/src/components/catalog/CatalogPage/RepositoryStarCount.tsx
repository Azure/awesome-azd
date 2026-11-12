/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

const starFormatter = new Intl.NumberFormat("en-US");

export function RepositoryStarCount({
  stars,
  icon,
  className,
  statClassName,
}: {
  stars?: number;
  icon: React.ReactNode;
  className?: string;
  statClassName?: string;
}): React.JSX.Element | null {
  if (stars === undefined) {
    return null;
  }

  const formattedStars = starFormatter.format(stars);
  return (
    <span
      className={className}
      data-repository-stars
      role="img"
      aria-label={`${formattedStars} GitHub stars`}
      title={`${formattedStars} GitHub stars`}
    >
      <span className={statClassName}>
        {icon}
        <span aria-hidden="true">{formattedStars}</span>
      </span>
    </span>
  );
}
