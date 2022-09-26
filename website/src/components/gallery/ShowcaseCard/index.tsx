/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 import React from 'react';
 import clsx from 'clsx';
 import Image from '@theme/IdealImage';
 import Link from '@docusaurus/Link';
 import Translate from '@docusaurus/Translate';
 
 import styles from './styles.module.css';
 import FavoriteIcon from './../../svgIcons/FavoriteIcon';
 import Tooltip from '../ShowcaseTooltip';
 import {
   Tag,
   Tags,
   type User,
   type TagType,
 } from '../../../data/tags';
 import {
   TagList,
 } from '../../../data/users';
 import {sortBy} from '@site/src/utils/jsUtils';
 
 const TagComp = React.forwardRef<HTMLLIElement, Tag>(
   ({label, color, description}, ref) => (
     <li ref={ref} className={styles.tag} title={description}>
       <span className={styles.textLabel}>{label.toLowerCase()}</span>
       <span className={styles.colorLabel} style={{backgroundColor: color}} />
     </li>
   ),
 );
 
 function ShowcaseCardTag({tags}: {tags: TagType[]}) {
   const tagObjects = tags.map((tag) => ({tag, ...Tags[tag]}));
 
   // Keep same order for all tags
   const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
     TagList.indexOf(tagObject.tag),
   );
 
   return (
     <>
       {tagObjectsSorted.map((tagObject, index) => {
         const id = `showcase_card_tag_${tagObject.tag}`;
 
         return (
           <Tooltip
             key={index}
             text={tagObject.description}
             anchorEl="#__docusaurus"
             id={id}>
             <TagComp key={index} {...tagObject} />
           </Tooltip>
         );
       })}
     </>
   );
 }
 
 function ShowcaseCard({user}: {user: User}) {
   return (
     <li key={user.title} className="card shadow--md">
       <Link href={user.source}>
        <div className={clsx('card__image', styles.showcaseCardImage)}>
          <Image img={user.preview} alt={user.title} />
        </div>
       </Link>
       <div className="card__body">
         <div className={clsx(styles.showcaseCardHeader)}>
           <h4 className={styles.showcaseCardTitle}>
             <Link href={user.source} className={styles.showcaseCardLink}>
               {user.title}
             </Link>
           </h4>
           {user.tags.includes('featured') && (
             <FavoriteIcon svgClass={styles.svgIconFavorite} size="small" />
           )}
           {user.source && (
             <Link
               href={user.website}
               className={clsx(
                 'button button--secondary button--sm',
                 styles.showcaseCardSrcBtn,
               )}>
               <Translate id="showcase.card.sourceLink">
                {user.author}
               </Translate>
             </Link>
           )}
         </div>
         <p className={styles.showcaseCardBody}>{user.description}</p>
       </div>
       <ul className={clsx('card__footer', styles.cardFooter)}>
         <ShowcaseCardTag tags={user.tags} />
       </ul>
     </li>
   );
 }
 
 export default React.memo(ShowcaseCard);