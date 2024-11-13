package models

type Goal struct {
	Id          string
	ClientId    string
	Name        string
	Description string
	Completed   bool
	CompleteBy  string
	LastUpdated string
}
