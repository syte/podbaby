package database

import (
	"github.com/danjac/podbaby/models"
	"github.com/jmoiron/sqlx"
	"github.com/smotes/purse"
)

// UserDB handles all user queries
type UserDB interface {
	GetByID(int64) (*models.User, error)
	GetByNameOrEmail(string) (*models.User, error)
	Create(*models.User) error
	IsName(string) (bool, error)
	IsEmail(string, int64) (bool, error)
	UpdateEmail(string, int64) error
	UpdatePassword(string, int64) error
	DeleteUser(int64) error
}

type defaultUserDBImpl struct {
	*sqlx.DB
	ps purse.Purse
}

func (db *defaultUserDBImpl) DeleteUser(userID int64) error {
	q, _ := db.ps.Get("delete_user.sql")
	_, err := db.Exec(q, userID)
	return sqlErr(err, q)
}

func (db *defaultUserDBImpl) GetByID(id int64) (*models.User, error) {
	q, _ := db.ps.Get("get_user_by_id.sql")
	user := &models.User{}
	err := db.Get(user, q, id)
	return user, sqlErr(err, q)
}

func (db *defaultUserDBImpl) GetByNameOrEmail(identifier string) (*models.User, error) {
	q, _ := db.ps.Get("get_user_by_name_or_email.sql")
	user := &models.User{}
	err := db.Get(user, q, identifier)
	return user, sqlErr(err, q)
}

func (db *defaultUserDBImpl) Create(user *models.User) error {
	q, _ := db.ps.Get("insert_user.sql")
	q, args, err := sqlx.Named(q, user)
	if err != nil {
		return sqlErr(err, q)
	}
	return sqlErr(db.QueryRow(db.Rebind(q), args...).Scan(&user.ID), q)
}

func (db *defaultUserDBImpl) IsName(name string) (bool, error) {
	q, _ := db.ps.Get("user_name_exists.sql")
	var count int64
	if err := db.QueryRow(q, name).Scan(&count); err != nil {
		return false, sqlErr(err, q)
	}
	return count > 0, nil

}

func (db *defaultUserDBImpl) IsEmail(email string, userID int64) (bool, error) {

	qname := "user_email_exists.sql"
	args := []interface{}{email}

	if userID != 0 {
		qname = "user_email_exists_with_id.sql"
		args = append(args, userID)
	}

	q, _ := db.ps.Get(qname)

	var count int64

	if err := db.QueryRow(q, args...).Scan(&count); err != nil {
		return false, sqlErr(err, q)
	}
	return count > 0, nil
}

func (db *defaultUserDBImpl) UpdateEmail(email string, userID int64) error {
	q, _ := db.ps.Get("update_user_email.sql")
	_, err := db.Exec(q, email, userID)
	return sqlErr(err, q)
}

func (db *defaultUserDBImpl) UpdatePassword(password string, userID int64) error {
	q, _ := db.ps.Get("update_user_password.sql")
	_, err := db.Exec(q, password, userID)
	return sqlErr(err, q)
}
