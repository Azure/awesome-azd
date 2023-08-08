/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 import React from 'react';
 import clsx from 'clsx';
 import Link from '@docusaurus/Link';
 
 import styles from './styles.module.css';
 import FavoriteIcon from './../../svgIcons/FavoriteIcon';
 import Tooltip from '../ShowcaseTooltip';
 import { Tag as TagUI } from "@fluentui/react-tags-preview";
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
import { Card, shorthands,makeStyles, CardHeader } from '@fluentui/react-components';

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
           <TagUI
             key={index}
             text={tagObject.description}
             anchorEl="#__docusaurus"
             id={id}>
             <TagComp key={index} {...tagObject} />
           </TagUI>
         );
       })}
     </>
   );
 }

 function ShowcaseMultipleWebsites(authorName:string, websiteLink:string, length:number, i:number) {
  if (i!=length-1){
    return <a className={styles.cardAuthor} 
      href={websiteLink}>{authorName}, </a>}
  else{
    return <a className={styles.cardAuthor} 
      href={websiteLink}>{authorName}</a>
      }
 }
 
 function ShowcaseMultipleAuthorsDropdown({user}: {user: User}) {
  const authors = user.author;
  const websites = user.website;
  let i=0;

  if (authors.includes(", ")){
    var multiWebsites = websites.split(", "); 
    var multiAuthors = authors.split(", "); 

    return (
        <div style={{display:'-webkit-box',overflow: 'hidden',WebkitLineClamp:'1',WebkitBoxOrient:'vertical'}}>
            {multiWebsites.map((value, index) => {
            return ShowcaseMultipleWebsites(multiAuthors[index], multiWebsites[index],multiWebsites.length,i++)
          })}
        </div>
    )    
  }

    return <Link className={styles.cardAuthor}>
    {authors}
    </Link>
 }
 
 const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "350px",
    height: "368px",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  text:{
    color:'#606060',
    fontSize:'10px',
    fontFamily:'"Segoe UI-Semibold", Helvetica',
  },
  cardTitle:{
    verticalAlign: 'middle',
    fontSize: '16px',
    fontFamily:'"Segoe UI-Bold", Helvetica;',
    color: '#6656d1',
  },
  cardTextBy:{
    fontSize: '12px',
    fontFamily:'"Segoe UI-Regular", Helvetica;',
    color: '#707070',
  },
  cardAuthor:{
    fontSize: '12px',
    fontFamily:'"Segoe UI-Regular", Helvetica;',
    color: '#6656d1',
  },
  cardDescription:{
    fontSize: '14px',
    fontFamily:'"Segoe UI-Regular", Helvetica;',
    color: '#707070',
  },
  cardTag:{
    fontSize: '14px',
    fontFamily:'"Segoe UI-Regular", Helvetica;',
    color: '#707070',
  },

});

 function ShowcaseCard({user}: {user: User}) {
  const styles = useStyles();
   return (
     <Card key={user.title} className={styles.card}>
      <CardHeader
        header={
            <div>
              <img
              src={useBaseUrl('/img/Microsoft.svg')}
              alt="Microsoft Logo"
              height={16}
              style={{float:'left',margin:'5px 0px'}}
              />
              <div className={styles.text} style={{float:'left',color:'#606060',margin:'5px 3px'}}>MICROSOFT AUTHORED</div>
              <div className={styles.text} style={{float:'right',color:'#F7630C',margin:'5px 3px'}}>POPULAR</div>
              <img
              src={useBaseUrl('/img/Fire.svg')}
              alt='Fire'
              height={16}
              style={{float:'right',margin:'5px 0px'}}
              />
              <div className={styles.text} style={{float:'right',color:'#11910D',margin:'5px 3px'}}>NEW</div>
              <img
              src={useBaseUrl('/img/Sparkle.svg')}
              alt="Star"
              height={16}
              style={{float:'right',margin:'5px 0px'}}
              />
          </div>
        }
      />
      <div>
        <Link href={user.source} className={styles.cardTitle}>{user.title}</Link>
        <div style={{verticalAlign: 'middle', display:'flex'}}>
          <div className={styles.cardTextBy}>by</div>
          {/* TODO: Multiple Author 
          {user.source && (
               
          )} */}
          <Link href={user.website} className={styles.cardAuthor} style={{padding:'0px 3px'}}><ShowcaseMultipleAuthorsDropdown user={user}/></Link>
        </div>
        <div className={styles.cardDescription} style={{paddingTop:'10px',overflow: 'hidden',display:'-webkit-box',WebkitLineClamp:'3',WebkitBoxOrient:'vertical'}}>{user.description}</div>
        <div style={{paddingTop:'10px'}}><ShowcaseCardTag tags={user.tags}/></div>
      </div>
     </Card>
   );
 }

// Will be moved to Card Panel in future
// <div className="card__body">
//   <div className={clsx(styles.showcaseCardHeader)}>
    // {user.source && (
    //   <ShowcaseMultipleAuthorsDropdown user={user}/>   
    // )}
// <ul className={clsx('card__footer', styles.cardFooter)}>
//   <ShowcaseCardTag tags={user.tags} />
// </ul>
 
 export default React.memo(ShowcaseCard);