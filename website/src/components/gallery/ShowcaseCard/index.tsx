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
 import useBaseUrl from '@docusaurus/useBaseUrl';
import { Card, shorthands,makeStyles, CardHeader, Body1, Caption1 } from '@fluentui/react-components';

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

 function ShowcaseMultipleWebsites(authorName:string, websiteLink:string) {
  return <li>
          <a className="dropdown__link" href={websiteLink}>{authorName}</a>
        </li>;
 }
 
 function ShowcaseMultipleAuthorsDropdown({user}: {user: User}) {
  const authors = user.author;
  const websites = user.website;

  if (authors.includes("|")){
    var multiWebsites = websites.split("|"); 
    var multiAuthors = authors.split("|"); 
    const links = [];

    return (
      <div className="dropdown dropdown--right dropdown--hoverable">
        <button className={clsx(
                 'button button--secondary button--sm',
                 styles.showcaseCardSrcBtn,
               )}>Author</button>
        <ul className="dropdown__menu">
          {multiWebsites.map((value, index) => {
            return ShowcaseMultipleWebsites(multiAuthors[index], multiWebsites[index])
          })}
        </ul>
      </div>
    )    
  }

    return <div>
    <a className={clsx(
                 'button button--secondary button--sm',
                 styles.showcaseCardSrcBtn,
               )} href={websites}>{authors}</a>
  </div>
 }
 
 const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "350px",
    height: "368px",
    maxWidth: "100%",
    maxHeight: "100%",
  },
});

 function ShowcaseCard({user}: {user: User}) {
  const styles = useStyles();
   return (
     <Card key={user.title} className={styles.card}>
      <CardHeader className='card__header'
        header={
            <div className='header-inner'>
            <img
            src={useBaseUrl('/img/microsoft.png')}
            alt="Microsoft Logo"
            style={{width: '16px', height: '16px',float: 'left', marginRight: '8px'}}
          />
            <p className="text-wrapper">MICROSOFT AUTHORED</p>
          </div>
        }
      />
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
             <ShowcaseMultipleAuthorsDropdown user={user}/>   
           )}
         </div>
         <p className={styles.showcaseCardBody}>{user.description}</p>
       </div>
       <ul className={clsx('card__footer', styles.cardFooter)}>
         <ShowcaseCardTag tags={user.tags} />
       </ul>
     </Card>
   );
 }
 
 export default React.memo(ShowcaseCard);