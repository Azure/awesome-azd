import React from 'react';
import LinkItem from '@theme/Footer/LinkItem';
function Separator({id}) {
  return <span className="footer__link-separator" id={id}>·</span>;
}
function SimpleLinkItem({item}) {
  return item.html ? (
    <span
      className="footer__link-item"
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: item.html}}
    />
  ) : (
    <LinkItem item={item} />
  );
}
export default function FooterLinksSimple({links}) {
  return (
    <div className="footer__links text--center">
      <div className="footer__links">
        {links.map((item, i) => (
          <React.Fragment key={i}>
            <SimpleLinkItem item={item} />
            {links.length !== i + 1 && <Separator id={"footer__links_"+item.label} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
