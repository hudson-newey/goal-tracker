package models

type Habit struct {
	Id             string
	ClientId       string
	Name           string
	Description    string
	CompletedDates []string // in ISO-8601 format
	CreatedAt      string   // in ISO-8601 format
	Goal           string   // as _id
	AntiHabit      bool     // if the habit is not to do something e.g. smoking
	IsQuantifiable bool     // if the habit is quantifiable e.g. running 5km
	IsTimeBased    bool		// if the habit should be started/ended using a timer
	TargetValue    int		// when completed n times, the habit is complete. Useful for quantifiable habits
	TargetTime     int		// if the habit is time-based, this is the target time in seconds
	Value          int      // the the habit is quantifiable, it'll show the current value
	DependsOn      []string // as _id
}
