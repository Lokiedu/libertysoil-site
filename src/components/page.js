import React from 'react';

const Page = ({ children }) => (
  <div className="page__container">
    {children}
  </div>
);

const PageCaption = ({ children }) => (
  <div className="page__caption">
    {children}
  </div>
);

const PageHero = ({ children }) => (
  <div className="page__hero">
    <div className="page__hero_body">
      <div className="page__hero_content">
        {children}
      </div>
    </div>
  </div>
);

const PageMain = ({ children, className = '', ...props }) => (
  <div className={`page__main ${className}`} {...props}>
    {children}
  </div>
);

const PageBody = ({ children, className = '', ...props }) => (
  <div className={`page__body ${className}`} {...props}>
    {children}
  </div>
);

const PageContent = ({ children, className = '' }) => (
  <div className={`page__content ${className}`}>
    {children}
  </div>
);

export {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}
