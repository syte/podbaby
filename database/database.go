package database

import (
	"github.com/danjac/podbaby/config"
	"github.com/danjac/podbaby/sql"
	"github.com/jmoiron/sqlx"
	"github.com/smotes/purse"
	"path/filepath"
)

type DB struct {
	*sqlx.DB
	Users         UserDB
	Channels      ChannelDB
	Podcasts      PodcastDB
	Bookmarks     BookmarkDB
	Subscriptions SubscriptionDB
	Plays         PlayDB
}

type SQLError struct {
	Err error
	SQL string
}

func (e SQLError) Error() string {
	return e.Err.Error()
}

func sqlErr(err error, sql string) error {
	if err == nil {
		return nil
	}
	return SQLError{err, sql}
}

func MustConnect(cfg *config.Config) *DB {
	db, err := New(sqlx.MustConnect("postgres", cfg.DatabaseURL), cfg)
	if err != nil {
		panic(err)
	}
	return db
}

func New(db *sqlx.DB, cfg *config.Config) (*DB, error) {

	var (
		ps  purse.Purse
		err error
	)

	if cfg.IsDev() {
		ps, err = purse.New(filepath.Join(".", "sql", "queries"))
		if err != nil {
			return nil, err
		}
	} else {
		ps = sql.Queries
	}

	return &DB{
		DB:            db,
		Users:         &defaultUserDBImpl{db, ps},
		Channels:      &defaultChannelDBImpl{db, ps},
		Podcasts:      &defaultPodcastDBImpl{db, ps},
		Subscriptions: &defaultSubscriptionDBImpl{db, ps},
		Bookmarks:     &defaultBookmarkDBImpl{db, ps},
		Plays:         &defaultPlayDBImpl{db, ps},
	}, nil
}
