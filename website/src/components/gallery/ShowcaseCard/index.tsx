/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 import React from 'react';
 import Link from '@docusaurus/Link';
 
 import styles from './styles.module.css';
 import { Tag as TagFluentUI, TagGroup } from "@fluentui/react-tags-preview";
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
import { Card, shorthands,makeStyles, CardHeader, CardFooter,Button, CardPreview} from '@fluentui/react-components';

const TagComp = React.forwardRef<HTMLLIElement, Tag>(
  ({label, description}, ref) => (
      <TagFluentUI appearance="outline" size="extra-small" title={description} ref={ref} style={{height:'20px',alignContent:'center',marginTop:'3px', backgroundColor:'#F0F0F0'}}>
        {label}
      </TagFluentUI>
  )
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
           <div>
             <TagComp key={index} {...tagObject} />
           </div>
         );
       })}
     </>
   );
 }

 function ShowcaseMultipleWebsites(authorName:string, websiteLink:string, length:number, i:number) {
  if (i!=length-1){
    return <Link className={styles.cardAuthor} 
      href={websiteLink}>{authorName}, </Link>}
  else{
    return <Link className={styles.cardAuthor} 
      href={websiteLink}>{authorName}</Link>
      }
 }
 
 function ShowcaseMultipleAuthors({user}: {user: User}) {
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

    return <Link className={styles.cardAuthor} href={websites}>
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
    paddingLeft:'3px',
  },
  cardDescription:{
    fontSize: '14px',
    fontFamily:'"Segoe UI-Regular", Helvetica;',
    color: '#707070',
  },
  cardTag:{
    fontSize: '10px',
    fontFamily:'"Segoe UI-Semibold", Helvetica;',
    color: '#606060',
  },
  cardFooterQuickUse:{
    fontSize: '10px',
    fontFamily:'"Segoe UI-Semibold", Helvetica;',
    color: '#424242',
  },
cardFooterAzdCommand:{
    fontSize: '11px',
    fontFamily:'"Consolas-Regular", Helvetica;',
    color: '#606060',
  },
});

 function ShowcaseCard({user}: {user: User}) {
  const styles = useStyles();
  const author = user.author;
  const source = user.source;
  let azdInitCommand = "azd init -t "+source.replace("https://github.com/","");
   return (
     <Card key={user.title} className={styles.card} style={{background:'linear-gradient(#FAFAFA 0 0)bottom/100% 45px no-repeat'}}>
      <CardHeader
        header={
            <div>
              {(author.includes("Azure Dev")|| author.includes("Azure Content Team")) ?
                <>
                <img
                src={useBaseUrl('/img/Microsoft.svg')}
                alt="Microsoft Logo"
                height={16}
                style={{float:'left',margin:'5px 0px'}}
                />
                <div className={styles.text} style={{float:'left',color:'#606060',margin:'5px 3px'}}>MICROSOFT AUTHORED</div>
                </> : 
                <>
                <img
                src={useBaseUrl('/img/Community.svg')}
                alt="Community"
                height={16}
                style={{float:'left',margin:'5px 0px'}}
                />
                <div className={styles.text} style={{float:'left',color:'#606060',margin:'5px 3px'}}>COMMUNITY AUTHORED</div>
                </>

              }
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
      <CardPreview style={{borderTop:'solid #F0F0F0'}}/>
      <div style={{display:'flex',flexDirection:'column',position:'relative',maxHeight:'inherit'}}>
        <Link href={source} className={styles.cardTitle}>{user.title}</Link>
        <div style={{verticalAlign: 'middle', display:'flex',paddingTop:'2px'}}>
          <div className={styles.cardTextBy}>by</div>
          <div className={styles.cardAuthor}>
            <ShowcaseMultipleAuthors user={user}/>
          </div>
        </div>
        <div className={styles.cardDescription} style={{paddingTop:'10px',overflow: 'hidden',display:'-webkit-box',WebkitLineClamp:'3',WebkitBoxOrient:'vertical'}}>{user.description}</div>
        <div style={{paddingTop:'10px',position:'absolute',bottom:'0px'}}> 
          <TagGroup className={styles.cardTag} style={{flexWrap:'wrap',overflow:'hidden',maxHeight:'96px'}} >
            <ShowcaseCardTag tags={user.tags}/>
          </TagGroup>
        </div> 
      </div>
      <CardPreview style={{borderTop:'solid #F0F0F0',backgroundColor:'#FAFAFA'}}>
      </CardPreview>
      <CardFooter style={{alignItems:'center', width:'100%'}}>
        <div className={styles.cardFooterQuickUse} style={{whiteSpace:'nowrap'}}>Quick Use</div>
        <Button style={{padding:'0px'}} onClick={() => {navigator.clipboard.writeText(azdInitCommand);}}>
          <div className={styles.cardFooterAzdCommand} style={{whiteSpace:'nowrap',overflow:'hidden',paddingLeft:'3px'}} >
            {azdInitCommand}
          </div>
        </Button>
        <Button style={{minWidth:'20px',padding:'0px',minHeight:'20px'}} onClick={() => {navigator.clipboard.writeText(azdInitCommand);}}>
            <img
                src={useBaseUrl('/img/Copy.svg')}
                height={20}
                alt="Copy"
            />
        </Button>
      </CardFooter>

     </Card>
   );
 }
 
 export default React.memo(ShowcaseCard);