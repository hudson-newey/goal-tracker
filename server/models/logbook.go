package models

type Logbook struct {
	Id          string
	ClientId    string
	Name        string
	CreatedAt   string
	Content     string
	LastUpdated string
	// sync tombstone: deleted records stay in the database so other clients
	// converge on the deletion, but they are filtered from all reads
	Deleted   bool   `bson:",omitempty"`
	DeletedAt string `bson:",omitempty"`
}

func (logbook Logbook) GetClientId() string {
	return logbook.ClientId
}

func (logbook Logbook) GetLastUpdated() string {
	return logbook.LastUpdated
}
