import React, {
  Component
} from 'react';

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

const PageBody = ({ children, className, ...props }) => (
  <div className={`page__body ${className}`} {...props}>
    {children}
  </div>
);

const PageCenter = ({ children }) => (
  <div className="page__body_content">
    {children}
  </div>
);

export {
  Page,
  PageCaption,
  PageHero,
  PageBody,
  PageCenter
}
