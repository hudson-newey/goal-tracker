package models

type Goal struct {
	Id          string
	ClientId    string
	Name        string
	Description string
	Completed   bool
	CompleteBy  string
	LastUpdated string
	// sync tombstone: deleted records stay in the database so other clients
	// converge on the deletion, but they are filtered from all reads
	Deleted   bool   `bson:",omitempty"`
	DeletedAt string `bson:",omitempty"`
}

func (goal Goal) GetClientId() string {
	return goal.ClientId
}

func (goal Goal) GetLastUpdated() string {
	return goal.LastUpdated
}
