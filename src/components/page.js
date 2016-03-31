import React from 'react';

const Page = ({ children, className = '' }) => (
  <div className={`page__container ${className}`}>
    {children}
  </div>
);

const PageCaption = ({ children }) => (
  <header className="page__caption">
    <h1>{children}</h1>
  </header>
);

const PageHero = ({ children, src }) => (
  <div className="page__hero">
    <div className="page__hero_body">
      <div
        className="page__hero_content"
        style={{
          backgroundImage: `url(${src})`
        }}
      >
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
