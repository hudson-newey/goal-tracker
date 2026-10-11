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
	// sync tombstone: deleted records stay in the database so other clients
	// converge on the deletion, but they are filtered from all reads
	Deleted   bool   `bson:",omitempty"`
	DeletedAt string `bson:",omitempty"`
}

func (task Task) GetClientId() string {
	return task.ClientId
}

func (task Task) GetLastUpdated() string {
	return task.LastUpdated
}
