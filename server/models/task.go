package models

type Task struct {
	Id          string // as _id
	ClientId    string
	Name        string
	Description string
	Completed   bool
	Goal        string // as _id
	Importance  int
	CompleteBy  string   // in ISO-8601 format
	DependsOn   []string // as _id
	LastUpdated string
}
