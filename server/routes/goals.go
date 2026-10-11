package routes

import (
	"log"
	"strings"

	"server/helpers"
	"server/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// POST /goals
//
// Creating is an upsert keyed by the record's client id: clients replay
// their offline operations on reconnect, so the same create can arrive more
// than once. Conflicts are resolved with last-write-wins (LastUpdated).
func CreateGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Goal

		if err := context.BindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		goal, err := helpers.UpsertSynced(database, "goals", requestBody)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, goal)
	}
}

// GET /goals
func ListGoals(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		goals, err := helpers.ListSynced[models.Goal](database, "goals")
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, goals)
	}
}

// GET /goals/search?name=partial_name
func SearchGoals(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		searchTerm := context.Query("name")

		goals, err := helpers.ListSynced[models.Goal](database, "goals")
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		// filter in memory; the collection is small and this matches the
		// client side (offline) search implementation
		responseBody := []models.Goal{}

		for _, goal := range goals {
			if strings.Contains(goal.Name, searchTerm) {
				responseBody = append(responseBody, goal)
			}
		}

		helpers.Success(context, responseBody)
	}
}

// GET /goals/:id
func GetGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		goal, found, err := helpers.FetchSynced[models.Goal](database, "goals", id)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		if !found {
			helpers.NotFoundError(context)
			return
		}

		helpers.Success(context, goal)
	}
}

// PUT /goals/:id
//
// Updates follow the same last-write-wins rules as creates; an update for a
// client id that does not exist yet creates the goal (offline clients may
// replay an update before its create reached the server).
func UpdateGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Goal

		if err := context.ShouldBindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		// trust the client id in the path so replays are deterministic
		if pathId := context.Param("id"); pathId != "" {
			requestBody.ClientId = pathId
		}

		goal, err := helpers.UpsertSynced(database, "goals", requestBody)
		if err == helpers.ErrSupersededDelete {
			helpers.NotFoundError(context)
			return
		}
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, goal)
	}
}

// DELETE /goals/:id
//
// Deletes are tombstones so other clients converge on the deletion. The
// optional lastUpdated query parameter carries the time the delete was
// made; if the record changed after that, the delete loses and the record
// is kept.
func DeleteGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")
		lastUpdated := context.Query("lastUpdated")

		_, err := helpers.DeleteSynced(database, "goals", id, lastUpdated)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		// always succeed: deletes are idempotent and conflicts are resolved
		// on the next pull
		helpers.Success(context, nil)
	}
}

// associations

// ListByGoalFilter builds the filter used to find all records of a table
// that belong to a goal.
func ListByGoalFilter(goalId string) bson.M {
	return bson.M{
		"goal":    goalId,
		"deleted": bson.M{"$ne": true},
	}
}

// GET /goals/:id/tasks
func ListTasksByGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		cursor, err := database.Client.Database("habits").
			Collection("tasks").
			Find(database.Ctx, ListByGoalFilter(id))
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		defer cursor.Close(database.Ctx)

		responseBody := []models.Task{}

		for cursor.Next(database.Ctx) {
			var task models.Task

			if err := cursor.Decode(&task); err != nil {
				log.Println(err)
				helpers.InternalServerError(context)
				return
			}

			task.Id = idHex(cursor.Current)

			responseBody = append(responseBody, task)
		}

		if err := cursor.Err(); err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, responseBody)
	}
}

// GET /goals/:id/habits
func ListHabitsByGoal(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		cursor, err := database.Client.Database("habits").
			Collection("habits").
			Find(database.Ctx, ListByGoalFilter(id))
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		defer cursor.Close(database.Ctx)

		responseBody := []models.Habit{}

		for cursor.Next(database.Ctx) {
			var habit models.Habit

			if err := cursor.Decode(&habit); err != nil {
				log.Println(err)
				helpers.InternalServerError(context)
				return
			}

			habit.Id = idHex(cursor.Current)

			responseBody = append(responseBody, habit)
		}

		if err := cursor.Err(); err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, responseBody)
	}
}

func idHex(current bson.Raw) string {
	var objectID primitive.ObjectID

	if err := current.Lookup("_id").Unmarshal(&objectID); err != nil {
		return ""
	}

	return objectID.Hex()
}
