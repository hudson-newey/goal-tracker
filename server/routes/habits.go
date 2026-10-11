package routes

import (
	"log"

	"server/helpers"
	"server/models"

	"github.com/gin-gonic/gin"
)

// POST /habits
//
// Upsert keyed by client id with last-write-wins conflict resolution, so
// offline replays and concurrent clients converge (see goals.go).
func CreateHabit(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Habit

		if err := context.BindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		habit, err := helpers.UpsertSynced(database, "habits", requestBody)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, habit)
	}
}

// GET /habits
func ListHabits(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		habits, err := helpers.ListSynced[models.Habit](database, "habits")
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, habits)
	}
}

// GET /habits/:id
func GetHabit(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		habit, found, err := helpers.FetchSynced[models.Habit](database, "habits", id)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		if !found {
			helpers.NotFoundError(context)
			return
		}

		helpers.Success(context, habit)
	}
}

// PUT /habits/:id
func UpdateHabit(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Habit

		if err := context.ShouldBindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		if pathId := context.Param("id"); pathId != "" {
			requestBody.ClientId = pathId
		}

		habit, err := helpers.UpsertSynced(database, "habits", requestBody)
		if err == helpers.ErrSupersededDelete {
			helpers.NotFoundError(context)
			return
		}
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, habit)
	}
}

// DELETE /habits/:id
func DeleteHabit(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")
		lastUpdated := context.Query("lastUpdated")

		_, err := helpers.DeleteSynced(database, "habits", id, lastUpdated)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, nil)
	}
}
