CREATE TABLE users (
    id uuid not null unique PRIMARY KEY,
    username text not null unique,
    hashed_password text not null,
    email text not null unique,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    more jsonb
);

CREATE TABLE posts (
    id uuid not null unique PRIMARY KEY,
    user_id uuid not null REFERENCES users (id) ON DELETE CASCADE,
    "text" text not null,
    type text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    more jsonb
);

CREATE TABLE followers (
    id uuid not null unique PRIMARY KEY,
    user_id uuid not null REFERENCES users (id) ON DELETE CASCADE,
    following_user_id uuid not null REFERENCES users (id) ON DELETE CASCADE
);

